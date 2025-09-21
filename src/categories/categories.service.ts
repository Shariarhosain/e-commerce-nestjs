import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import slugify from 'slugify';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryListResponseDto,
  ApiSuccessResponse,
} from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    try {
      // Validate input
      if (!createCategoryDto.name || createCategoryDto.name.trim().length === 0) {
        throw new BadRequestException('Category name is required and cannot be empty');
      }

      // Check if category with this name already exists
      const existingCategory = await this.prisma.category.findFirst({
        where: { 
          name: {
            equals: createCategoryDto.name.trim(),
            mode: 'insensitive'
          }
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }

      // Generate slug from name if not provided
      let slug: string;
      if (createCategoryDto.slug) {
        slug = await this.generateUniqueSlug(createCategoryDto.slug.trim());
      } else {
        const baseSlug = slugify(createCategoryDto.name.trim(), { lower: true, strict: true });
        slug = await this.generateUniqueSlug(baseSlug);
      }

      const category = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name.trim(),
          description: createCategoryDto.description?.trim() || null,
          slug: slug,
        },
      });

      const categoryResponse: CategoryResponseDto = {
        ...category,
        productCount: 0, // New category has no products
      };

      return new ApiSuccessResponse('Category created successfully', categoryResponse);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async findAll(): Promise<ApiSuccessResponse<CategoryListResponseDto[]>> {
    try {
      const categories = await this.prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: {
          name: 'asc',
        },
      });

      if (!categories || categories.length === 0) {
        return new ApiSuccessResponse('No categories found', []);
      }

      const categoriesResponse = categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        productCount: category._count.products,
      }));

      return new ApiSuccessResponse(
        `Found ${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`,
        categoriesResponse
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve categories');
    }
  }

  async findOne(id: string): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    try {
      // Validate ID format (basic UUID validation)
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Category ID is required');
      }

      const category = await this.prisma.category.findUnique({
        where: { id: id.trim() },
        include: {
          _count: {
            select: { products: true }
          }
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const categoryResponse: CategoryResponseDto = {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: category._count.products,
      };

      return new ApiSuccessResponse('Category retrieved successfully', categoryResponse);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve category');
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    try {
      // Validate ID
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Category ID is required');
      }

      // Validate at least one field is provided for update
      if (!updateCategoryDto.name && !updateCategoryDto.description && !updateCategoryDto.slug) {
        throw new BadRequestException('At least one field (name, description, or slug) must be provided for update');
      }

      // If name is provided, validate it and check for duplicates
      if (updateCategoryDto.name) {
        if (updateCategoryDto.name.trim().length === 0) {
          throw new BadRequestException('Category name cannot be empty');
        }

        const existingCategory = await this.prisma.category.findFirst({
          where: { 
            name: {
              equals: updateCategoryDto.name.trim(),
              mode: 'insensitive'
            },
            NOT: { id: id.trim() }
          },
        });

        if (existingCategory) {
          throw new ConflictException('Category with this name already exists');
        }
      }

      const updateData: any = {};
      if (updateCategoryDto.name) {
        updateData.name = updateCategoryDto.name.trim();
      }
      if (updateCategoryDto.description !== undefined) {
        updateData.description = updateCategoryDto.description?.trim() || null;
      }

      // Handle slug generation
      if (updateCategoryDto.slug !== undefined) {
        if (updateCategoryDto.slug) {
          // User provided a slug
          updateData.slug = await this.generateUniqueSlug(updateCategoryDto.slug.trim(), id.trim());
        } else {
          // User wants to clear the slug
          updateData.slug = null;
        }
      } else if (updateCategoryDto.name) {
        // Name was updated but no slug provided, auto-generate from new name
        const baseSlug = slugify(updateCategoryDto.name.trim(), { lower: true, strict: true });
        updateData.slug = await this.generateUniqueSlug(baseSlug, id.trim());
      }

      const category = await this.prisma.category.update({
        where: { id: id.trim() },
        data: updateData,
        include: {
          _count: {
            select: { products: true }
          }
        },
      });

      const categoryResponse: CategoryResponseDto = {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: category._count.products,
      };

      return new ApiSuccessResponse('Category updated successfully', categoryResponse);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: string): Promise<ApiSuccessResponse<{ message: string }>> {
    try {
      // Validate ID
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('Category ID is required');
      }

      // Check if category exists first
      const existingCategory = await this.prisma.category.findUnique({
        where: { id: id.trim() },
      });

      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      // TODO: When Product model is added, check if category has products
      // const categoryWithProducts = await this.prisma.category.findUnique({
      //   where: { id: id.trim() },
      //   include: {
      //     _count: {
      //       select: { products: true }
      //     }
      //   },
      // });
      
      // if (categoryWithProducts?._count.products > 0) {
      //   throw new BadRequestException('Cannot delete category with linked products');
      // }

      await this.prisma.category.delete({
        where: { id: id.trim() },
      });

      return new ApiSuccessResponse('Category deleted successfully', { 
        message: `Category "${existingCategory.name}" has been deleted successfully` 
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const where: any = { slug };
      if (excludeId) {
        where.NOT = { id: excludeId };
      }

      const existing = await this.prisma.category.findUnique({ where });
      
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}