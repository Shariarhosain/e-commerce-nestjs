import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class CartItemResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  cartId: string;

  @ApiProperty({ example: 'uuid' })
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid', required: false })
  userId?: string;

  @ApiProperty({ example: 'guest-token-uuid', required: false })
  guestToken?: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  cartItems: CartItemResponseDto[];

  @ApiProperty({ example: 1299.98 })
  totalAmount: number;

  @ApiProperty({ example: 3 })
  totalItems: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class GuestTokenResponseDto {
  @ApiProperty({ example: 'guest-token-uuid' })
  guestToken: string;

  @ApiProperty({ example: 'Guest cart created successfully' })
  message: string;
}