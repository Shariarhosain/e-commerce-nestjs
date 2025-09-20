import { IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token received during login or token refresh',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE2OTUyMTA2NDUsImV4cCI6MTY5NTgxNTQ0NX0...'
  })
  @IsJWT({ message: 'Invalid refresh token format' })
  refreshToken: string;
}