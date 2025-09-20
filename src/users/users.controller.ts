import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../dto/userDto/update-user.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get all users (Admin only)',
    description: 'Retrieve all users in the system. **Requires JWT token + ADMIN role.**'
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    schema: {
      example: [
        {
          id: 1,
          email: 'john.doe@example.com',
          name: 'John Doe',
          createdAt: '2025-09-20T10:00:00.000Z',
          updatedAt: '2025-09-20T10:00:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get user by ID (Admin only)',
    description: 'Retrieve a specific user by their ID. **Requires JWT token + ADMIN role.**'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        email: 'john.doe@example.com',
        name: 'John Doe',
        createdAt: '2025-09-20T10:00:00.000Z',
        updatedAt: '2025-09-20T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update user (Admin only)',
    description: 'Update user information by ID. **Requires JWT token + ADMIN role.**'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        email: 'john.doe.updated@example.com',
        name: 'John Doe Updated',
        createdAt: '2025-09-20T10:00:00.000Z',
        updatedAt: '2025-09-20T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Delete user (Admin only)',
    description: 'Delete a user by ID. **Requires JWT token + ADMIN role.**'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}