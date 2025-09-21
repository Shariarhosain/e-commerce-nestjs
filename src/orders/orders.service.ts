import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CartService } from '../cart/cart.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderFilterDto,
  OrderResponseDto,
  OrderListResponseDto,
} from './dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async create(dto: CreateOrderDto, userId?: string): Promise<OrderResponseDto> {
    // Require user to be authenticated for checkout
    if (!userId) {
      throw new UnauthorizedException('You must be logged in to place an order. Please login or register to continue.');
    }

    // Get user's cart
    let cart;
    try {
      cart = await this.cartService.getCart(userId);
    } catch (error) {
      throw new BadRequestException('Your cart is empty or could not be found. Please add items to your cart before placing an order.');
    }

    if (!cart.cartItems.length) {
      throw new BadRequestException('Cannot create order with empty cart. Please add items to your cart first.');
    }

    // Verify stock availability for all items
    for (const item of cart.cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}, Requested: ${item.quantity}. Please update your cart and try again.`,
        );
      }
    }

    try {
      // Create order with items in a transaction
      const order = await this.prisma.$transaction(async (tx) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.PENDING,
            totalAmount: cart.totalAmount,
            shippingAddress: dto.shippingAddress,
            phoneNumber: dto.phoneNumber,
            notes: dto.notes,
          },
        });

        // Create order items and update product stock
        for (const item of cart.cartItems) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price, // Store current price
            },
          });

          // Reduce product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Clear the cart after successful order
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return newOrder;
      });

      return this.findOne(order.id, userId, 'USER');
    } catch (error) {
      if (error.message.includes('Insufficient stock')) {
        throw error; // Re-throw stock validation errors
      }
      throw new BadRequestException('Failed to create order. Please check your order details and try again.');
    }
  }

  async findAll(
    filterDto: OrderFilterDto,
    userId?: string,
    userRole?: string,
  ): Promise<OrderListResponseDto> {
    const { page = 1, limit = 10, status, fromDate, toDate } = filterDto;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // If not admin, only show user's own orders
    if (userRole !== 'ADMIN') {
      if (!userId) {
        throw new UnauthorizedException('You must be logged in to view your orders. Please login to access your order history.');
      }
      where.userId = userId;
    } else if (filterDto.userId) {
      // Admin can filter by specific user
      where.userId = filterDto.userId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Get total count
    const total = await this.prisma.order.count({ where });

    // Get orders
    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate pagination meta
    const totalPages = Math.ceil(total / limit);

    return {
      data: orders.map(order => this.transformOrder(order)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string, userId?: string, userRole?: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
        orderItems: {
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

    if (!order) {
      throw new NotFoundException('Order not found. Please check the order ID and try again.');
    }

    // Check if user can access this order
    if (userRole !== 'ADMIN' && order.userId !== userId) {
      throw new ForbiddenException('You can only access your own orders. This order belongs to another user.');
    }

    return this.transformOrder(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    userRole?: string,
  ): Promise<OrderResponseDto> {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can update order status. Please contact an admin if you need to modify an order.');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found. Please check the order ID and try again.');
    }

    // Business logic for status transitions
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update status of a cancelled order. Cancelled orders are final.');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot update status of a delivered order. The order has already been completed.');
    }

    // Validate status transition logic
    if (order.status === OrderStatus.SHIPPED && dto.status === OrderStatus.PENDING) {
      throw new BadRequestException('Cannot change status from SHIPPED back to PENDING. Invalid status transition.');
    }

    if (order.status === OrderStatus.SHIPPED && dto.status === OrderStatus.APPROVED) {
      throw new BadRequestException('Cannot change status from SHIPPED back to APPROVED. Invalid status transition.');
    }

    // If cancelling an order, restore product stock
    if (dto.status === OrderStatus.CANCELLED) {
      await this.restoreProductStock(id);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.notes && { notes: order.notes ? `${order.notes}\\n\\n${dto.notes}` : dto.notes }),
      },
    });

    return this.findOne(updatedOrder.id, undefined, userRole);
  }

  async getUserOrderStats(userId: string): Promise<any> {
    const stats = await this.prisma.order.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    });

    const totalSpent = await this.prisma.order.aggregate({
      where: { 
        userId,
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalOrders = await this.prisma.order.count({
      where: { userId },
    });

    return {
      totalOrders,
      totalSpent: totalSpent._sum.totalAmount || 0,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
    };
  }

  async getAdminOrderStats(): Promise<any> {
    const stats = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const revenueStats = await this.prisma.order.aggregate({
      where: {
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalOrders = await this.prisma.order.count();

    const pendingOrders = await this.prisma.order.count({
      where: { status: OrderStatus.PENDING },
    });

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: revenueStats._sum.totalAmount || 0,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
    };
  }

  private async restoreProductStock(orderId: string): Promise<void> {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    for (const item of orderItems) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  private transformOrder(order: any): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      phoneNumber: order.phoneNumber,
      notes: order.notes || undefined,
      user: {
        id: order.user.id,
        email: order.user.email,
        username: order.user.username,
        name: order.user.name || undefined,
      },
      orderItems: order.orderItems.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          ...item.product,
          description: item.product.description || undefined,
          slug: item.product.slug || undefined,
          imageUrl: item.product.imageUrl || undefined,
          category: item.product.category ? {
            ...item.product.category,
            description: item.product.category.description || undefined,
            slug: item.product.category.slug || undefined,
          } : undefined,
        },
        createdAt: item.createdAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}