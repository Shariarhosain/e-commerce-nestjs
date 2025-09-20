import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Patch,
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
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService, AuthResponse, TokenResponse } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  UpdateProfileDto,
  RegisterResponseDto,
  AuthResponseDto,
  TokenResponseDto,
  MessageResponseDto,
  ErrorResponseDto,
} from './dto';
import { LocalAuthGuard, JwtAuthGuard } from './guards';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('guest')
  @ApiOperation({ 
    summary: 'Register new user',
    description: 'Create a new user account and automatically log them in. **No authentication required.**'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'User registration data'
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered and authenticated.',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'USER' },
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
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('admin')
  @ApiOperation({ 
    summary: 'Create first admin user',
    description: 'Creates the first admin user in the system. **System setup endpoint.**'
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

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiTags('guest')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email/password. Returns access and refresh tokens. **No authentication required.**'
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
  @ApiTags('user')
  @ApiOperation({ 
    summary: 'Refresh JWT tokens',
    description: 'Get new access and refresh tokens using valid refresh token. **Requires valid refresh token.**'
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

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiTags('user')
  @ApiOperation({ 
    summary: 'User logout',
    description: 'Revoke refresh token and logout user. **Requires JWT token.**'
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

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiTags('user')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get current authenticated user profile. **Requires JWT token.**'
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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiTags('user')
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Allow users to update their own profile information (email, username, name)'
  })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Profile updated successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cuid123...' },
            email: { type: 'string', example: 'john.doe@example.com' },
            username: { type: 'string', example: 'johndoe' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'USER' },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        message: { 
          oneOf: [
            { type: 'string', example: 'Please provide a valid email address' },
            { type: 'array', items: { type: 'string' }, example: ['Username must be at least 3 characters long'] }
          ]
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
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
  @ApiConflictResponse({
    description: 'Username or email already exists',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Username already exists' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.authService.updateProfile(req.user.id, updateProfileDto);
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
}