import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductListResponseDto,
} from './dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@ApiTags('products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({
    summary: 'Create a new product (Admin only)',
    description: 'Create a new product with up to 5 images. Admin only.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    description: 'Product creation form with multiple image upload support',
    schema: {
      type: 'object',
      required: ['name', 'price', 'stock', 'categoryId'],
      properties: {
        name: { 
          type: 'string', 
          example: 'Gaming Laptop',
          description: 'Product name (required)'
        },
        description: { 
          type: 'string', 
          example: 'High-performance gaming laptop with RTX 4070',
          description: 'Product description (optional)'
        },
        price: { 
          type: 'number', 
          example: 1299.99,
          description: 'Product price in USD (required)'
        },
        stock: { 
          type: 'number', 
          example: 10,
          description: 'Available stock quantity (required)'
        },
        categoryId: { 
          type: 'string', 
          format: 'uuid',
          example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          description: 'Valid category UUID (required)'
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload up to 5 product images (optional)',
          maxItems: 5,
          example: ['image1.jpg', 'image2.png', 'image3.webp']
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto, images);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ProductListResponseDto,
  })
  async findAll(@Query() query: ProductQueryDto): Promise<ProductListResponseDto> {
    return this.productsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or description' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: ProductListResponseDto,
  })
  async search(
    @Query('q') q: string,
    @Query() query: ProductQueryDto,
  ): Promise<ProductListResponseDto> {
    return this.productsService.search(q, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({
    summary: 'Update a product (Admin only)',
    description: 'Update a product with up to 5 images. Admin only.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    description: 'Product update form - all fields are optional, only send what you want to update',
    schema: {
      type: 'object',
      properties: {
        name: { 
          type: 'string', 
          example: 'Updated Gaming Laptop',
          description: 'Product name (optional)'
        },
        description: { 
          type: 'string', 
          example: 'Updated high-performance gaming laptop with RTX 4070',
          description: 'Product description (optional)'
        },
        price: { 
          type: 'number', 
          example: 1399.99,
          description: 'Product price in USD (optional)'
        },
        stock: { 
          type: 'number', 
          example: 15,
          description: 'Available stock quantity (optional)'
        },
        categoryId: { 
          type: 'string', 
          format: 'uuid',
          example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          description: 'Valid category UUID (optional)'
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload up to 5 new product images - replaces existing images (optional)',
          maxItems: 5,
          example: ['new_image1.jpg', 'new_image2.png']
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto, images);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.productsService.remove(id);
    return { message: 'Product deleted successfully' };
  }
}