import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main St, City, State 12345',
  })
  @IsString({ message: 'Shipping address must be a valid text string' })
  @IsNotEmpty({ message: 'Shipping address is required to process your order' })
  @MinLength(10, { message: 'Shipping address must be at least 10 characters long' })
  @MaxLength(200, { message: 'Shipping address cannot exceed 200 characters' })
  shippingAddress: string;

  @ApiProperty({
    description: 'Phone number for delivery contact',
    example: '+1234567890',
  })
  @IsString({ message: 'Phone number must be a valid text string' })
  @IsNotEmpty({ message: 'Phone number is required for delivery contact' })
  @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Additional notes for the order',
    required: false,
    example: 'Please handle with care',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a valid text string' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}