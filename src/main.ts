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
    .setTitle('NestJS + Prisma User API')
    .setDescription('A RESTful API for user management built with NestJS, Prisma, and PostgreSQL')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addTag('app', 'General application endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 NestJS application is running on: http://localhost:3000');
  console.log('📊 Swagger API Documentation: http://localhost:3000/api-docs');
  console.log('📋 Available Endpoints:');
  console.log('  - GET    /            - Welcome message');
  console.log('  - GET    /users      - Get all users');
  console.log('  - POST   /users      - Create user');
  console.log('  - GET    /users/:id  - Get user by ID');
  console.log('  - PATCH  /users/:id  - Update user');
  console.log('  - DELETE /users/:id  - Delete user');
}
bootstrap();
