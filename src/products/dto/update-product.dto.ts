import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Laptop',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-performance gaming laptop with RTX 4070',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: 1299.99,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Product stock quantity',
    example: 10,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Category ID',
    example: 'uuid-of-category',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
