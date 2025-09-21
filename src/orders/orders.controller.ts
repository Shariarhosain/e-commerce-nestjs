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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Cart empty or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get orders with filtering (users see own orders, admins see all)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto,
  })
  async findAll(
    @Query() filterDto: OrderFilterDto,
    @User() user: any,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.findAll(filterDto, user.id, user.role);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get order statistics (user stats for regular users, admin stats for admins)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  async getStats(@User() user: any): Promise<any> {
    if (user.role === 'ADMIN') {
      return this.ordersService.getAdminOrderStats();
    } else {
      return this.ordersService.getUserOrderStats(user.id);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @User() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, updateStatusDto, user.role);
  }
}
