import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity (0 to remove item)',
    example: 3,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @ApiProperty({
    description: 'Guest token for non-authenticated users',
    required: false,
    example: 'guest-token-uuid',
  })
  @IsOptional()
  @IsString()
  guestToken?: string;
}