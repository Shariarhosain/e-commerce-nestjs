import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class TransferGuestCartDto {
  @ApiProperty({
    description: 'Guest token to transfer cart from',
    example: 'edd62581-5e49-42bc-bb85-0d9741d48d06',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  guestToken: string;
}