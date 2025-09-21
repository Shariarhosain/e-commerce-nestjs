import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity for the cart item (set to 0 to remove item)',
    example: 3,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  quantity: number;
}