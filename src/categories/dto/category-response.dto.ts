import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Electronics and gadgets category',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Number of products in this category',
    example: 15,
  })
  productCount: number;

  @ApiProperty({
    description: 'Category creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Category last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CategoryListResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Electronics and gadgets category',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Number of products in this category',
    example: 15,
  })
  productCount: number;
}