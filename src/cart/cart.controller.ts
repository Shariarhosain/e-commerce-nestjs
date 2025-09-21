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
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  CartResponseDto,
  GuestTokenResponseDto,
} from './dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('cart')
@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('guest')
  @ApiOperation({ summary: 'Create a guest cart token' })
  @ApiResponse({
    status: 201,
    description: 'Guest cart token created successfully',
    type: GuestTokenResponseDto,
  })
  async createGuestCart(): Promise<GuestTokenResponseDto> {
    const { guestToken } = await this.cartService.createGuestCart();
    return {
      guestToken,
      message: 'Guest cart created successfully',
    };
  }

  @Post('add')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @User() user?: any,
  ): Promise<CartResponseDto> {
    return this.cartService.addToCart(addToCartDto, user?.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get cart contents' })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'guestToken',
    description: 'Guest token for non-authenticated users',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async getCart(
    @Query('guestToken') guestToken?: string,
    @User() user?: any,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(user?.id, guestToken);
  }

  @Patch('items/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBearerAuth('JWT-auth')
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
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(id, updateCartItemDto, user?.id);
  }

  @Delete('items/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'guestToken',
    description: 'Guest token for non-authenticated users',
    required: false,
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
    @Query('guestToken') guestToken?: string,
    @User() user?: any,
  ): Promise<CartResponseDto> {
    return this.cartService.removeCartItem(id, user?.id, guestToken);
  }

  @Delete('clear')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'guestToken',
    description: 'Guest token for non-authenticated users',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async clearCart(
    @Query('guestToken') guestToken?: string,
    @User() user?: any,
  ): Promise<{ message: string }> {
    return this.cartService.clearCart(user?.id, guestToken);
  }

  @Post('transfer')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Transfer guest cart to authenticated user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Guest cart transferred successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Guest cart not found' })
  async transferGuestCart(
    @Body('guestToken') guestToken: string,
    @User() user: any,
  ): Promise<CartResponseDto> {
    if (!user?.id) {
      throw new Error('Authentication required');
    }
    return this.cartService.transferGuestCartToUser(guestToken, user.id);
  }
}
