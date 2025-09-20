import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { EmailService } from './email.service';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto';
import { User } from '@prisma/client';

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string; token: string }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === dto.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Generate verification code
    const verificationCode = this.emailService.generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        name: dto.name,
      },
    });

    // Create email verification record
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        code: verificationCode,
        expiresAt: verificationExpires,
      },
    });

    // Generate temporary token for verification
    const verificationToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'email_verification' },
      { expiresIn: '15m' },
    );

    // Send verification email asynchronously
    setImmediate(async () => {
      try {
        await this.emailService.sendVerificationEmail(
          user.email,
          verificationCode,
          verificationToken,
        );
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
    });

    return {
      message: 'Registration successful. Please check your email for verification code.',
      token: verificationToken,
    };
  }

  async createAdmin(dto: RegisterDto): Promise<{ message: string; user: any }> {
    // Check if any admin already exists
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin user already exists. Contact existing admin for new admin creation.');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === dto.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create admin user with email already verified
    const adminUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        name: dto.name,
        role: 'ADMIN',
        isEmailVerified: true, // Admin doesn't need email verification
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Admin user created successfully.',
      user: adminUser,
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<AuthResponse> {
    // Verify token
    let payload;
    try {
      payload = this.jwtService.verify(dto.token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    if (payload.type !== 'email_verification') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Find the latest email verification record
    const emailVerification = await this.prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!emailVerification || emailVerification.code !== dto.code) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Mark verification as used and user as verified
    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: emailVerification.id },
        data: { isUsed: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
    ]);

    // Get updated user
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    // Generate tokens
    const tokens = await this.generateTokens(updatedUser);

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: updatedUser.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: this.excludePassword(updatedUser),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto.email, dto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const tokens = await this.generateTokens(user);

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: this.excludePassword(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<TokenResponse> {
    let payload;
    try {
      payload = this.jwtService.verify(dto.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find the refresh token in database
    const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!refreshTokenRecord || refreshTokenRecord.isRevoked || refreshTokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = refreshTokenRecord.user;
    const tokens = await this.generateTokens(user);

    // Mark old refresh token as revoked and create new one
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { isRevoked: true },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
    ]);

    return tokens;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Return success message even if user doesn't exist for security
      return {
        message: 'If an account with that email exists, we have sent a password reset link.',
      };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password_reset' },
      { expiresIn: '1h' },
    );

    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create password reset record
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: resetExpires,
      },
    });

    // Send reset email asynchronously
    setImmediate(async () => {
      try {
        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
      }
    });

    return {
      message: 'If an account with that email exists, we have sent a password reset link.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Verify token
    let payload;
    try {
      payload = this.jwtService.verify(dto.token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.type !== 'password_reset') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Find the password reset record
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        token: dto.token,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = passwordReset.user;

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    // Update password, mark reset as used, and revoke all refresh tokens
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { isUsed: true },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
      }),
    ]);

    return { message: 'Password reset successful' };
  }

  async logout(userId: string): Promise<{ message: string }> {
    // Revoke all refresh tokens for the user
    await this.prisma.refreshToken.updateMany({
      where: { userId: userId },
      data: { isRevoked: true },
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User): Promise<TokenResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });

    return { accessToken, refreshToken };
  }

  private excludePassword(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}