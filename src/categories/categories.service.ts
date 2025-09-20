import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
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

      const category = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name.trim(),
          description: createCategoryDto.description?.trim() || null,
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
        orderBy: {
          name: 'asc',
        },
      });

      if (!categories || categories.length === 0) {
        return new ApiSuccessResponse('No categories found', []);
      }

      // For now, productCount is 0 since we don't have Product model yet
      // When Product model is added, this should be updated to:
      // const categories = await this.prisma.category.findMany({
      //   include: {
      //     _count: {
      //       select: { products: true }
      //     }
      //   },
      //   orderBy: {
      //     name: 'asc',
      //   },
      // });

      const categoriesResponse = categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        productCount: 0, // TODO: Update when Product model is added
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
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const categoryResponse: CategoryResponseDto = {
        ...category,
        productCount: 0, // TODO: Update when Product model is added
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
      if (!updateCategoryDto.name && !updateCategoryDto.description) {
        throw new BadRequestException('At least one field (name or description) must be provided for update');
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

      const category = await this.prisma.category.update({
        where: { id: id.trim() },
        data: updateData,
      });

      const categoryResponse: CategoryResponseDto = {
        ...category,
        productCount: 0, // TODO: Update when Product model is added
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
}