import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UploadService } from '../upload/upload.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
  ProductListResponseDto,
} from './dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(
    dto: CreateProductDto,
    images?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Generate slug
    const baseSlug = slugify(dto.name, { lower: true, strict: true });
    const slug = await this.generateUniqueSlug(baseSlug);

    let imageUrls: string[] = [];

    try {
      // Create product first
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          slug,
          price: dto.price,
          stock: dto.stock,
          categoryId: dto.categoryId,
        },
        include: {
          category: true,
        },
      });

      // Upload images if provided
      if (images && images.length > 0) {
        for (const image of images) {
          const imageUrl = await this.uploadService.uploadProductImage(image, product.id);
          imageUrls.push(imageUrl);
        }
        
        // Update product with all image URLs
        const updatedProduct = await this.prisma.product.update({
          where: { id: product.id },
          data: { imageUrls: imageUrls },
          include: {
            category: true,
          },
        });

        return this.transformProduct(updatedProduct);
      }

      return this.transformProduct(product);
    } catch (error) {
      // Clean up uploaded images if product creation fails
      if (imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          await this.uploadService.deleteProductImage(imageUrl);
        }
      }
      
      if (error.code === 'P2002') {
        throw new ConflictException('Product with this name already exists');
      }
      throw error;
    }
  }

  async findAll(query: ProductQueryDto): Promise<ProductListResponseDto> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Calculate pagination meta
    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map(product => this.transformProduct(product)),
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

  async search(q: string, query: ProductQueryDto): Promise<ProductListResponseDto> {
    return this.findAll({ ...query, q });
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.transformProduct(product);
  }

  async findBySlug(slug: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.transformProduct(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    images?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // Verify category exists if provided
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    let newSlug: string | undefined;
    let imageUrls: string[] = [];

    // Generate new slug if name is being updated
    if (dto.name && dto.name !== existingProduct.name) {
      const baseSlug = slugify(dto.name, { lower: true, strict: true });
      newSlug = await this.generateUniqueSlug(baseSlug, id);
    }

    // Upload new images if provided
    if (images && images.length > 0) {
      for (const image of images) {
        const imageUrl = await this.uploadService.uploadProductImage(image, id);
        imageUrls.push(imageUrl);
      }
    }

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...dto,
          ...(newSlug && { slug: newSlug }),
          ...(imageUrls.length > 0 && { imageUrls: imageUrls }),
        },
        include: {
          category: true,
        },
      });

      // Delete old images if new images were uploaded and old images exist
      if (imageUrls.length > 0 && existingProduct.imageUrls.length > 0) {
        for (const oldImageUrl of existingProduct.imageUrls) {
          try {
            await this.uploadService.deleteProductImage(oldImageUrl);
          } catch (error) {
            // Log the error but don't fail the update if old image deletion fails
            console.warn('Failed to delete old image:', error.message);
          }
        }
      }

      return this.transformProduct(updatedProduct);
    } catch (error) {
      // Clean up uploaded images if update fails
      if (imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          await this.uploadService.deleteProductImage(imageUrl);
        }
      }

      if (error.code === 'P2002') {
        throw new ConflictException('Product with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Delete from database
    await this.prisma.product.delete({
      where: { id },
    });

    // Delete all images from storage if they exist
    if (product.imageUrls && product.imageUrls.length > 0) {
      for (const imageUrl of product.imageUrls) {
        try {
          await this.uploadService.deleteProductImage(imageUrl);
        } catch (error) {
          console.warn('Failed to delete image during product removal:', error.message);
        }
      }
    }
  }

  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock + quantity < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        stock: product.stock + quantity,
      },
      include: {
        category: true,
      },
    });

    return this.transformProduct(updatedProduct);
  }

  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const where: any = { slug };
      if (excludeId) {
        where.NOT = { id: excludeId };
      }

      const existing = await this.prisma.product.findUnique({ where });
      
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  private transformProduct(product: any): ProductResponseDto {
    return {
      ...product,
      description: product.description || undefined,
      slug: product.slug || undefined,
      imageUrls: product.imageUrls || [],
      category: product.category ? {
        ...product.category,
        description: product.category.description || undefined,
        slug: product.category.slug || undefined,
      } : undefined,
    };
  }
}