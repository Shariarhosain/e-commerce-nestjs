import { IsString, Length, IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'JWT token received during registration',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInR5cGUiOiJlbWFpbF92ZXJpZmljYXRpb24iLCJpYXQiOjE2OTUyMTA2NDUsImV4cCI6MTY5NTIxMTU0NX0...'
  })
  @IsJWT({ message: 'Invalid token format' })
  token: string;

  @ApiProperty({
    description: '6-digit verification code sent to email',
    example: '123456',
    minLength: 6,
    maxLength: 6
  })
  @IsString({ message: 'Verification code must be a string' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 characters' })
  code: string;
}