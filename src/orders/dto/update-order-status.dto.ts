import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.APPROVED,
  })
  @IsEnum(OrderStatus, { 
    message: 'Status must be one of: PENDING, APPROVED, SHIPPED, DELIVERED, CANCELLED' 
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Additional notes about the status change',
    required: false,
    example: 'Order approved and ready for processing',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a valid text string' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}