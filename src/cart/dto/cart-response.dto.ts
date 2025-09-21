import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class CartItemResponseDto {
  @ApiProperty({ 
    description: 'Cart item ID',
    example: '9a1de781-30e9-4962-aa56-e3cf068d175d',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({ 
    description: 'Cart ID this item belongs to',
    example: '1f4f7ea2-8449-4cdc-8e19-deb36d253d5e',
    format: 'uuid'
  })
  cartId: string;

  @ApiProperty({ 
    description: 'Product ID',
    example: '3ee767ad-bf98-483e-87d8-f4edb40e6969',
    format: 'uuid'
  })
  productId: string;

  @ApiProperty({ 
    description: 'Quantity of the product in cart',
    example: 2,
    minimum: 1
  })
  quantity: number;

  @ApiProperty({ 
    description: 'Product details',
    type: ProductResponseDto 
  })
  product: ProductResponseDto;

  @ApiProperty({ 
    description: 'Date when item was added to cart',
    example: '2025-09-21T06:48:32.693Z' 
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Date when item was last updated',
    example: '2025-09-21T06:49:09.500Z' 
  })
  updatedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({ 
    description: 'Cart ID',
    example: '1f4f7ea2-8449-4cdc-8e19-deb36d253d5e',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({ 
    description: 'User ID (null for guest carts)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
    required: false 
  })
  userId?: string;

  @ApiProperty({ 
    description: 'Guest token (null for authenticated user carts)',
    example: 'edd62581-5e49-42bc-bb85-0d9741d48d06',
    format: 'uuid',
    required: false 
  })
  guestToken?: string;

  @ApiProperty({ 
    description: 'List of items in the cart',
    type: [CartItemResponseDto] 
  })
  cartItems: CartItemResponseDto[];

  @ApiProperty({ 
    description: 'Total amount of all items in cart',
    example: 2599.98 
  })
  totalAmount: number;

  @ApiProperty({ 
    description: 'Total number of items in cart',
    example: 3 
  })
  totalItems: number;

  @ApiProperty({ 
    description: 'Date when cart was created',
    example: '2025-09-21T06:48:32.272Z' 
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Date when cart was last updated',
    example: '2025-09-21T06:48:32.272Z' 
  })
  updatedAt: Date;
}

export class GuestTokenResponseDto {
  @ApiProperty({ 
    description: 'Generated guest cart token',
    example: 'edd62581-5e49-42bc-bb85-0d9741d48d06',
    format: 'uuid'
  })
  guestToken: string;

  @ApiProperty({ 
    description: 'Success message',
    example: 'Guest cart created successfully' 
  })
  message: string;
}

export class AddToCartResponseDto {
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