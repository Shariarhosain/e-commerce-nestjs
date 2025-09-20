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
    .setDescription('A comprehensive RESTful API for e-commerce with authentication, user management, built with NestJS, Prisma, and PostgreSQL')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints - Register, Login, JWT management')
    .addTag('users', 'User management endpoints - CRUD operations (Protected)')
    .addTag('app', 'General application endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addServer('http://localhost:3000', 'Development server')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 NestJS application is running on: http://localhost:3000');
  console.log('📊 Swagger API Documentation: http://localhost:3000/api-docs');
  console.log('📋 Available Endpoints:');
  console.log('  - GET    /            - Welcome message');
  console.log('  - POST   /api/auth/register      - Register new user');
  console.log('  - POST   /api/auth/verify-email  - Verify email with code');
  console.log('  - POST   /api/auth/login         - Login user');
  console.log('  - POST   /api/auth/refresh       - Refresh JWT tokens');
  console.log('  - POST   /api/auth/logout        - Logout user (Protected)');
  console.log('  - GET    /api/auth/profile       - Get user profile (Protected)');
  console.log('  - GET    /users                  - Get all users (Protected)');
  console.log('  - POST   /users                  - Create user (Protected)');
  console.log('  - GET    /users/:id              - Get user by ID (Protected)');
  console.log('  - PATCH  /users/:id              - Update user (Protected)');
  console.log('  - DELETE /users/:id              - Delete user (Protected)');
}
bootstrap();
