import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'Electronic devices and accessories' })
  description?: string;

  @ApiProperty({ example: 'electronics' })
  slug?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Gaming Laptop' })
  name: string;

  @ApiProperty({ example: 'High-performance gaming laptop' })
  description?: string;

  @ApiProperty({ example: 'gaming-laptop' })
  slug?: string;

  @ApiProperty({ example: 1299.99 })
  price: number;

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ 
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String]
  })
  imageUrls: string[];

  @ApiProperty({ example: 'uuid' })
  categoryId: string;

  @ApiProperty({ type: CategoryResponseDto })
  category?: CategoryResponseDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}
