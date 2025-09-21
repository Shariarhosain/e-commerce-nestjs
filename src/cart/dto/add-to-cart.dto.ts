import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: '3ee767ad-bf98-483e-87d8-f4edb40e6969',
    format: 'uuid',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product to add to cart',
    example: 2,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  quantity: number = 1;
}