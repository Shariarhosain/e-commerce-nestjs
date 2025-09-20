import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInR5cGUiOiJwYXNzd29yZF9yZXNldCIsImlhdCI6MTY5NTIxMDY0NSwiZXhwIjoxNjk1MjE0MjQ1fQ...'
  })
  @IsString({ message: 'Reset token must be a string' })
  token: string;

  @ApiProperty({
    description: 'New strong password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'MyNewSecurePassword123!',
    minLength: 8
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}