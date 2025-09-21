import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: 'uuid-of-product',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity to add',
    example: 2,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  quantity: number = 1;

  @ApiProperty({
    description: 'Guest token for non-authenticated users',
    required: false,
    example: 'guest-token-uuid',
  })
  @IsOptional()
  @IsString()
  guestToken?: string;
}