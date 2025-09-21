import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderFilterDto,
  OrderResponseDto,
  OrderListResponseDto,
} from './dto';
import { OrderAuthGuard } from './guards/order-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OrderAuthGuard)
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Cart empty, insufficient stock, or invalid order data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Cannot create order with empty cart' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required - You must be logged in to place an order',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'You must be logged in to place an order. Please login or register to continue.' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Get()
  @UseGuards(OrderAuthGuard)
  @ApiOperation({ summary: 'Get orders with filtering (users see own orders, admins see all)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required - You must be logged in to view orders',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'You must be logged in to view your orders. Please login to access your order history.' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async findAll(
    @Query() filterDto: OrderFilterDto,
    @User() user: any,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.findAll(filterDto, user.id, user.role);
  }

  @Get('stats')
  @UseGuards(OrderAuthGuard)
  @ApiOperation({ summary: 'Get order statistics (user stats for regular users, admin stats for admins)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required - You must be logged in to view order statistics',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'You must be logged in to access this order resource. Please login to continue.' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async getStats(@User() user: any): Promise<any> {
    if (user.role === 'ADMIN') {
      return this.ordersService.getAdminOrderStats();
    } else {
      return this.ordersService.getUserOrderStats(user.id);
    }
  }

  @Get(':id')
  @UseGuards(OrderAuthGuard)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required - You must be logged in to view orders',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'You must be logged in to access this order resource. Please login to continue.' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - You can only view your own orders',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only access your own orders' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found with the provided ID',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Order not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Patch(':id/status')
  @UseGuards(OrderAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid status transition or bad request data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid status transition from DELIVERED to PENDING' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required - You must be logged in',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'You must be logged in with admin privileges to update order status.' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required to update order status',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Required roles: ADMIN' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found with the provided ID',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Order not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @User() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, updateStatusDto, user.role);
  }
}
