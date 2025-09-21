import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiProperty({
    description: 'Search query for product name or description',
    required: false,
    example: 'laptop',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'Category ID to filter by',
    required: false,
    example: 'uuid-of-category',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Minimum price filter',
    required: false,
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price filter',
    required: false,
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort by field',
    required: false,
    example: 'createdAt',
    enum: ['name', 'price', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}