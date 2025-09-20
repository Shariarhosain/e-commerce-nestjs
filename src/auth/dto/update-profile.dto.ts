import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Username (unique)',
    example: 'johndoe',
    minLength: 3,
    maxLength: 20,
    required: false
  })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    maxLength: 50,
    required: false
  })
  @IsString()
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  @IsOptional()
  name?: string;
}