import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  CartResponseDto,
} from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(
    dto: AddToCartDto,
    userId?: string,
    guestTokenFromAuth?: string,
  ): Promise<CartResponseDto & { guestToken?: string }> {
    // Verify product exists and has stock
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    let cart;
    let generatedGuestToken: string | null = null;

    if (userId) {
      // Authenticated user cart
      cart = await this.findOrCreateUserCart(userId);
    } else {
      // Use guest token from authorization header or create new
      const guestToken = guestTokenFromAuth;
      
      if (guestToken) {
        // Guest cart with existing token
        cart = await this.findGuestCart(guestToken);
        if (!cart) {
          throw new NotFoundException('Guest cart not found');
        }
      } else {
        // Create new guest cart
        const { id, guestToken: newToken } = await this.createGuestCart();
        cart = { id, guestToken: newToken };
        generatedGuestToken = newToken;
      }
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
        },
      });
    } else {
      // Create new cart item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });
    }

    const cartResponse = await this.getCartWithItems(cart.id);
    
    // Include generated guest token in response if created
    return generatedGuestToken 
      ? { ...cartResponse, guestToken: generatedGuestToken }
      : cartResponse;
  }

  async getCart(userId?: string, guestToken?: string, guestTokenFromAuth?: string): Promise<CartResponseDto> {
    let cart;

    if (userId) {
      cart = await this.findUserCart(userId);
    } else {
      // Use guest token from authorization header first, then from query parameter
      const token = guestTokenFromAuth || guestToken;
      if (token) {
        cart = await this.findGuestCart(token);
      } else {
        throw new BadRequestException('User ID or guest token required');
      }
    }

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.getCartWithItems(cart.id);
  }

  async updateCartItem(
    cartItemId: string,
    dto: UpdateCartItemDto,
    userId?: string,
    guestTokenFromAuth?: string,
  ): Promise<CartResponseDto> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    if (userId && cartItem.cart.userId !== userId) {
      throw new UnauthorizedException('Not authorized to modify this cart');
    }

    if (!userId) {
      const guestToken = guestTokenFromAuth;
      if (cartItem.cart.guestToken !== guestToken) {
        throw new UnauthorizedException('Invalid guest token');
      }
    }

    // Check stock if increasing quantity
    if (dto.quantity > cartItem.quantity) {
      const additionalQuantity = dto.quantity - cartItem.quantity;
      if (cartItem.product.stock < additionalQuantity) {
        throw new BadRequestException('Insufficient stock');
      }
    }

    if (dto.quantity === 0) {
      // Remove item
      await this.prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: dto.quantity },
      });
    }

    return this.getCartWithItems(cartItem.cartId);
  }

  async removeCartItem(
    cartItemId: string,
    userId?: string,
    guestToken?: string,
    guestTokenFromAuth?: string,
  ): Promise<CartResponseDto> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    if (userId && cartItem.cart.userId !== userId) {
      throw new UnauthorizedException('Not authorized to modify this cart');
    }

    if (!userId) {
      const token = guestTokenFromAuth || guestToken;
      if (cartItem.cart.guestToken !== token) {
        throw new UnauthorizedException('Invalid guest token');
      }
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCartWithItems(cartItem.cartId);
  }

  async clearCart(userId?: string, guestToken?: string, guestTokenFromAuth?: string): Promise<{ message: string }> {
    let cart;

    if (userId) {
      cart = await this.findUserCart(userId);
    } else {
      // Use guest token from authorization header first, then from query parameter
      const token = guestTokenFromAuth || guestToken;
      if (token) {
        cart = await this.findGuestCart(token);
      } else {
        throw new BadRequestException('User ID or guest token required');
      }
    }

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared successfully' };
  }

  private async createGuestCart(): Promise<{ id: string; guestToken: string }> {
    const guestToken = uuidv4();
    
    const cart = await this.prisma.cart.create({
      data: { guestToken },
    });

    return { id: cart.id, guestToken };
  }

  private async findOrCreateUserCart(userId: string) {
    let cart = await this.findUserCart(userId);
    
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  private async findUserCart(userId: string) {
    return this.prisma.cart.findFirst({
      where: { userId },
    });
  }

  private async findGuestCart(guestToken: string) {
    return this.prisma.cart.findUnique({
      where: { guestToken },
    });
  }

  private async getCartWithItems(cartId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Calculate totals
    const totalAmount = cart.cartItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0,
    );

    const totalItems = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId || undefined,
      guestToken: cart.guestToken || undefined,
      cartItems: cart.cartItems.map(item => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          ...item.product,
          description: item.product.description || undefined,
          slug: item.product.slug || undefined,
          imageUrls: item.product.imageUrls || [],
          category: item.product.category ? {
            ...item.product.category,
            description: item.product.category.description || undefined,
            slug: item.product.category.slug || undefined,
          } : undefined,
        },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      totalAmount,
      totalItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}