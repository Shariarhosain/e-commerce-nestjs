import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for testing
  app.enableCors();
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('E-Commerce NestJS API')
    .setDescription(`
# E-Commerce API Documentation

A comprehensive RESTful API for e-commerce with role-based authentication and user management.

## API Sections Overview

### 👥 **Guest Section**
**No authentication required**
- User registration
- Email verification  
- User login
- Password reset functionality

### 🔒 **User Section** 
**Requires: Valid JWT Token**
- Profile management
- Token refresh
- Account logout
- View personal information

### 👑 **Admin Section**
**Requires: JWT Token + ADMIN Role**

**User Management:**
- View all users
- Get user details
- Update user information
- Delete users

**Token & Security Management:**
- Get token statistics
- View all user sessions
- Revoke specific refresh tokens
- Revoke all user tokens (force logout)
- Clean up expired tokens
- Monitor user sessions

---
*Built with NestJS, Prisma ORM, and PostgreSQL*
    `)
    .setVersion('1.0')
    .addTag('guest', '👥 Guest Section - No authentication required')
    .addTag('user', '🔒 User Section - Requires valid JWT token')
    .addTag('admin', '👑 Admin Section - Requires JWT token + ADMIN role')
    .addTag('system', '⚙️ System - General application endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('https://e-commerce-nestjs-production-a304.up.railway.app', 'Production server (Railway)')
    .addServer('http://localhost:3000', 'Development server')
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  
  // Remove any unwanted tags from the generated document
  if (document.tags) {
    document.tags = document.tags.filter(tag => 
      ['guest', 'user', 'admin', 'system'].includes(tag.name)
    );
  }
  
  // Ensure all operations have proper tags and remove any "auth" or "Auth" tags
  if (document.paths) {
    Object.keys(document.paths).forEach(path => {
      Object.keys(document.paths[path]).forEach(method => {
        const operation = document.paths[path][method];
        if (operation && operation.tags) {
          // Remove any "auth" or "Auth" tags and ensure proper tagging
          operation.tags = operation.tags.filter(tag => 
            tag !== 'auth' && tag !== 'Auth' && tag !== 'AUTH'
          );
          
          // If no tags remain, assign to appropriate section based on path
          if (operation.tags.length === 0) {
            if (path.includes('/api/auth/')) {
              // Default guest endpoints
              if (['register', 'login', 'verify-email', 'forgot-password', 'reset-password'].some(ep => path.includes(ep))) {
                operation.tags = ['guest'];
              }
              // User endpoints
              else if (['refresh', 'logout', 'profile'].some(ep => path.includes(ep))) {
                operation.tags = ['user'];
              }
              // Admin endpoints
              else if (path.includes('create-admin')) {
                operation.tags = ['admin'];
              }
              else {
                operation.tags = ['guest']; // fallback
              }
            }
          }
        }
      });
    });
  }
  
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      // Force refresh and hide any Auth section
      url: '/api-docs-json?v=' + Date.now(),
      customCss: `
        .opblock-tag-section[data-tag="auth"],
        .opblock-tag-section[data-tag="Auth"],
        .opblock-tag-section[data-tag="AUTH"] {
          display: none !important;
        }
        .swagger-ui .opblock-tag {
          border: none !important;
        }
      `,
    },
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 NestJS application is running on: http://localhost:3000');
  console.log('📊 Swagger API Documentation: http://localhost:3000/api-docs');
  console.log('📋 Available Endpoints:');
  console.log('  - GET    /            - Welcome message');
  console.log('  - GET    /users                  - Get all users');
  console.log('  - GET    /users/:id              - Get user by ID');
  console.log('  - PATCH  /users/:id              - Update user');
  console.log('  - DELETE /users/:id              - Delete user');
}
bootstrap();
