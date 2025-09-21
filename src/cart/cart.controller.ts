import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  CartResponseDto,
  AddToCartResponseDto,
} from './dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { User, GuestToken } from '../auth/decorators';

@ApiTags('cart')
@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: AddToCartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @User() user?: any,
    @GuestToken() guestTokenFromAuth?: string,
  ): Promise<CartResponseDto & { guestToken?: string }> {
    return this.cartService.addToCart(addToCartDto, user?.id, guestTokenFromAuth);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get cart contents' })
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'X-Guest-Token',
    description: 'Guest token for non-authenticated users',
    required: false,
    example: 'edd62581-5e49-42bc-bb85-0d9741d48d06',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async getCart(
    @User() user?: any,
    @GuestToken() guestTokenFromAuth?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(user?.id, undefined, guestTokenFromAuth);
  }

  @Patch('items/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Cart item ID to update',
    example: '9a1de781-30e9-4962-aa56-e3cf068d175d',
    type: 'string',
    format: 'uuid',
  })
  @ApiHeader({
    name: 'X-Guest-Token',
    description: 'Guest token for non-authenticated users',
    required: false,
    example: 'edd62581-5e49-42bc-bb85-0d9741d48d06',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateCartItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @User() user?: any,
    @GuestToken() guestTokenFromAuth?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(id, updateCartItemDto, user?.id, guestTokenFromAuth);
  }

  @Delete('items/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Cart item ID to remove',
    example: '9a1de781-30e9-4962-aa56-e3cf068d175d',
    type: 'string',
    format: 'uuid',
  })
  @ApiHeader({
    name: 'X-Guest-Token',
    description: 'Guest token for non-authenticated users',
    required: false,
    example: 'edd62581-5e49-42bc-bb85-0d9741d48d06',
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeCartItem(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user?: any,
    @GuestToken() guestTokenFromAuth?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeCartItem(id, user?.id, undefined, guestTokenFromAuth);
  }

  @Delete('clear')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'X-Guest-Token',
    description: 'Guest token for non-authenticated users',
    required: false,
    example: 'edd62581-5e49-42bc-bb85-0d9741d48d06',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cart cleared successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cart cleared successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async clearCart(
    @User() user?: any,
    @GuestToken() guestTokenFromAuth?: string,
  ): Promise<{ message: string }> {
    return this.cartService.clearCart(user?.id, undefined, guestTokenFromAuth);
  }
}
