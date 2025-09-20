import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe123'
  })
  username: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false
  })
  name?: string;

  @ApiProperty({
    description: 'User role in the system',
    example: 'USER',
    enum: ['USER', 'ADMIN']
  })
  role: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-09-20T14:32:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2025-09-20T14:32:00.000Z'
  })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'JWT access token (expires in 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (expires in 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Registration success message',
    example: 'Registration successful. Please check your email for verification code.'
  })
  message: string;

  @ApiProperty({
    description: 'Temporary verification token (expires in 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  token: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'New JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully'
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message or array of validation errors',
    oneOf: [
      { type: 'string', example: 'Email already exists' },
      { 
        type: 'array', 
        items: { type: 'string' },
        example: ['email must be a valid email', 'password must be at least 8 characters long'] 
      }
    ]
  })
  message: string | string[];

  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
    required: false
  })
  error?: string;
}