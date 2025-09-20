import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Unique username (3-20 characters, letters, numbers, underscores only)',
    example: 'john_doe123',
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_]+$'
  })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not be longer than 20 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({
    description: 'Strong password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'MySecurePassword123!',
    minLength: 8
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
    maxLength: 50
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(50, { message: 'Name must not be longer than 50 characters' })
  name?: string;
}