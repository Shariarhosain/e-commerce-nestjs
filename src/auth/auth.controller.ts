import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthService, AuthResponse, TokenResponse } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  RegisterResponseDto,
  AuthResponseDto,
  TokenResponseDto,
  MessageResponseDto,
  ErrorResponseDto,
} from './dto';
import { LocalAuthGuard, JwtAuthGuard } from './guards';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register new user',
    description: 'Create a new user account. Sends verification email with 6-digit code. Returns temporary token for verification.'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'User registration data'
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered. Verification email sent.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Registration successful. Please check your email for verification code.'
        },
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiConflictResponse({
    description: 'Email or username already exists',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email already exists' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['email must be a valid email', 'password must be at least 8 characters long']
        },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async register(@Body() dto: RegisterDto): Promise<{ message: string; token: string }> {
    return this.authService.register(dto);
  }

  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create first admin user',
    description: 'Creates the first admin user in the system. Can only be used when no admin exists.'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'Admin user registration data'
  })
  @ApiResponse({
    status: 201,
    description: 'Admin user created successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Admin user created successfully.' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
            email: { type: 'string', example: 'admin@example.com' },
            username: { type: 'string', example: 'admin' },
            name: { type: 'string', example: 'Admin User' },
            role: { type: 'string', example: 'ADMIN' },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2025-09-20T14:32:00.000Z' },
            updatedAt: { type: 'string', example: '2025-09-20T14:32:00.000Z' }
          }
        }
      }
    }
  })
  @ApiConflictResponse({
    description: 'Admin already exists',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Admin user already exists. Contact existing admin for new admin creation.' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  async createAdmin(@Body() dto: RegisterDto): Promise<{ message: string; user: any }> {
    return this.authService.createAdmin(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify email address',
    description: 'Verify user email using the 6-digit code sent during registration. Returns access and refresh tokens.'
  })
  @ApiBody({ 
    type: VerifyEmailDto,
    description: 'Email verification data'
  })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified. User authenticated.',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            name: { type: 'string', example: 'John Doe' },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2025-09-20T14:32:00.000Z' },
            updatedAt: { type: 'string', example: '2025-09-20T14:32:00.000Z' }
          }
        },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired verification token/code',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid or expired verification code' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Email already verified',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email already verified' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<AuthResponse> {
    return this.authService.verifyEmail(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user with email and password. Returns access and refresh tokens. Requires verified email.'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'User login credentials'
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            name: { type: 'string', example: 'John Doe' },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2025-09-20T14:32:00.000Z' },
            updatedAt: { type: 'string', example: '2025-09-20T14:32:00.000Z' }
          }
        },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or email not verified',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Invalid credentials',
          enum: ['Invalid credentials', 'Please verify your email before logging in']
        },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async login(@Request() req, @Body() dto: LoginDto): Promise<AuthResponse> {
    // The LocalAuthGuard validates the user, but we still call the service
    // to get the complete response with tokens
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh JWT tokens',
    description: 'Generate new access and refresh tokens using a valid refresh token.'
  })
  @ApiBody({ 
    type: RefreshTokenDto,
    description: 'Refresh token data'
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid refresh token' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async refreshTokens(@Body() dto: RefreshTokenDto): Promise<TokenResponse> {
    return this.authService.refreshTokens(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset email to user. Always returns success message for security.'
  })
  @ApiBody({ 
    type: ForgotPasswordDto,
    description: 'Email for password reset'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'If an account with that email exists, we have sent a password reset link.' 
        }
      }
    }
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset password',
    description: 'Reset user password using the token from password reset email.'
  })
  @ApiBody({ 
    type: ResetPasswordDto,
    description: 'Password reset data'
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset successful' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired reset token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid or expired reset token' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Logout authenticated user and invalidate refresh token.'
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async logout(@Request() req): Promise<{ message: string }> {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get current authenticated user profile information.'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            name: { type: 'string', example: 'John Doe' },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2025-09-20T14:32:00.000Z' },
            updatedAt: { type: 'string', example: '2025-09-20T14:32:00.000Z' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiForbiddenResponse({
    description: 'Email not verified',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Please verify your email before accessing this resource' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }
}