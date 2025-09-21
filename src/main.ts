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
    .setTitle('🛒 E-Commerce NestJS API')
    .setDescription(`
# 🛒 E-Commerce API Documentation

A comprehensive RESTful API for e-commerce platform with role-based authentication, product management, shopping cart, and order processing.

## 📋 Features

### 🔐 Authentication & Authorization
- **JWT Authentication** with access and refresh tokens
- **Role-Based Access Control** (USER, ADMIN)
- **Guest Cart Support** for non-authenticated users
- **Account Registration & Login**

### 📦 Product Management
- **CRUD Operations** for products (Admin only)
- **Product Search** with filters and pagination
- **Category Management**
- **Image Upload Support** (Swagger ready for multipart/form-data)
- **Stock Management**

### 🛍️ Shopping Cart
- **Guest Cart** with unique tokens
- **User Cart** with automatic migration from guest cart
- **Add/Update/Remove** cart items
- **Stock Validation**

### 📋 Order Management
- **Checkout Process** from cart to order
- **Order Status Tracking** (PENDING → APPROVED → PROCESSING → SHIPPED → DELIVERED → CANCELLED)
- **Admin Order Approval** workflow
- **Stock Management** during order processing

### 🏪 Admin Features
- **Product & Category Management**
- **Order Status Updates**
- **User Management**
- **Inventory Control**
- **Sales Analytics**

---

## 🔗 API Endpoints Overview

### A. Authentication
- **POST** /api/auth/register - Register new user
- **POST** /api/auth/login - User login  
- **POST** /api/auth/refresh - Refresh access token
- **POST** /api/auth/logout - Logout user
- **GET** /api/auth/profile - Get user profile
- **PATCH** /api/auth/profile - Update user profile
- **POST** /api/auth/admin/create - Create admin user

### B. Cart Management
- **POST** /api/cart/guest - Create guest cart token
- **POST** /api/cart/add - Add item to cart
- **GET** /api/cart - Get cart contents
- **PATCH** /api/cart/items/:id - Update cart item quantity
- **DELETE** /api/cart/items/:id - Remove cart item
- **DELETE** /api/cart/clear - Clear entire cart
- **POST** /api/cart/transfer - Transfer guest cart to user account

### C. Categories
- **GET** /api/categories - List all categories
- **POST** /api/categories - Create category (Admin)
- **GET** /api/categories/:id - Get category by ID
- **PATCH** /api/categories/:id - Update category (Admin)
- **DELETE** /api/categories/:id - Delete category (Admin)

### D. Products
- **GET** /api/products - List products with filters & pagination
- **POST** /api/products - Create product with image upload (Admin)
- **GET** /api/products/search - Search products by keyword
- **GET** /api/products/:id - Get product details
- **PATCH** /api/products/:id - Update product (Admin)
- **DELETE** /api/products/:id - Delete product (Admin)

### E. Orders
- **POST** /api/orders - Create order from cart (requires authentication)
- **GET** /api/orders - Get user orders (paginated)
- **GET** /api/orders/stats - Get order statistics
- **GET** /api/orders/:id - Get order details
- **PATCH** /api/orders/:id/status - Update order status (Admin)

### F. File Upload
- **POST** /api/upload/product-image - Upload product image (Admin)

---

## 🔑 Authentication

### Bearer Token
All protected endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Guest Token
For cart operations without authentication, use the guestToken parameter or header:
\`\`\`
POST /api/cart/add
{
  "productId": "uuid",
  "quantity": 2,
  "guestToken": "<your-guest-token>"
}
\`\`\`

### Role-Based Access
- **👤 USER**: Cart management, order placement, view own orders
- **👑 ADMIN**: Product/category management, order status updates, user management

---

## 🚀 Getting Started

### User Journey
1. **Browse Products** → \`GET /api/products\`
2. **Create Guest Cart** → \`POST /api/cart/guest\` (if not logged in)
3. **Add to Cart** → \`POST /api/cart/add\`
4. **Register/Login** → \`POST /api/auth/register\` or \`POST /api/auth/login\`
5. **Transfer Cart** → \`POST /api/cart/transfer\` (if had guest cart)
6. **Checkout** → \`POST /api/orders\`

### Admin Setup
1. **Register User** → \`POST /api/auth/register\`
2. **Create Admin** → \`POST /api/auth/admin/create\` (first admin only)
3. **Login as Admin** → \`POST /api/auth/login\`
4. **Manage Products** → \`POST /api/products\` with image upload

---

## 📱 Key Features

### 🛍️ Shopping Cart
- **Guest cart support** with unique tokens
- **Seamless migration** from guest to user cart
- **Real-time stock validation**
- **Quantity management**

### 📦 Product Management
- **Image upload** to Supabase storage
- **SEO-friendly slugs** auto-generated
- **Advanced filtering** (category, price range, search)
- **Pagination** for large catalogs
- **Stock tracking**

### 📋 Order Processing
- **COD (Cash on Delivery)** payment method
- **Admin approval workflow**
- **Status tracking** with detailed history
- **Stock reduction** on order creation
- **Stock restoration** on order cancellation

---

## 📱 Response Formats

All responses follow consistent JSON structure:
- **Success**: Direct data or wrapped in pagination metadata
- **Error**: Standard HTTP status codes with descriptive messages
- **Validation**: Detailed field-level error information
- **Pagination**: Includes total, page, limit, hasNext/Prev flags

---

*Built with NestJS, Prisma ORM, PostgreSQL, JWT, and Supabase Storage*
`)
    .setVersion('1.0.0')
        .setContact('Shariar Hosain Sanny', 'https://github.com/Shariarhosain/e-commerce-nestjs', 'shariarhosain131529@gmail.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addServer('http://localhost:3000', 'Local Development Server')
    .addServer('https://e-commerce-nestjs-production-a304.up.railway.app', 'Production Server')
    .addTag('auth', '🔐 User authentication and authorization')
    .addTag('cart', '🛍️ Shopping cart operations')
    .addTag('categories', '📂 Product category management')
    .addTag('orders', '📋 Order processing and management')
    .addTag('products', '📦 Product catalog and inventory management')
    .addTag('system', '⚙️ System health and status')
    .addTag('upload', '📤 File upload services')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: '🛒 E-Commerce API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      defaultModelRendering: 'model',
      displayOperationId: false,
      tryItOutEnabled: true,
      requestInterceptor: (request: any) => {
        console.log('Request:', request);
        return request;
      },
      responseInterceptor: (response: any) => {
        console.log('Response:', response);
        return response;
      },
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info hgroup.main { margin: 0 0 20px }
        .swagger-ui .info .title { color: #3b4151; font-size: 36px }
        .swagger-ui .info .description { margin: 20px 0; font-size: 16px }
        .swagger-ui .scheme-container { background: #f7f7f7; padding: 15px; border-radius: 4px; margin: 20px 0 }
        .swagger-ui .opblock.opblock-post { border-color: #49cc90; background: #f9fffc }
        .swagger-ui .opblock.opblock-get { border-color: #61affe; background: #f7f9fc }
        .swagger-ui .opblock.opblock-patch { border-color: #fca130; background: #fffcf5 }
        .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; background: #fff6f6 }
        .swagger-ui .opblock-tag { font-size: 18px; margin: 0 0 10px; font-weight: bold }
        .swagger-ui .parameter__name.required:after { color: #f93e3e }
        .swagger-ui .parameter__name.required { font-weight: bold }
        .swagger-ui .response-col_status { font-weight: bold }
        .swagger-ui .response.default .response-col_status { color: #999 }
        .swagger-ui .response.error .response-col_status { color: #f93e3e }
        .swagger-ui .response.success .response-col_status { color: #49cc90 }
        .swagger-ui .opblock-summary { font-weight: bold; font-size: 14px }
        .swagger-ui .opblock-description-wrapper { margin: 15px 0 }
        .swagger-ui .opblock-description { font-size: 14px; color: #3b4151 }
        .swagger-ui .btn.execute { background-color: #4f46e5; border-color: #4f46e5 }
        .swagger-ui .btn.execute:hover { background-color: #4338ca; border-color: #4338ca }
        .swagger-ui .auth-btn-wrapper .btn-done, .swagger-ui .auth-btn-wrapper .btn.authorize { 
          background-color: #10b981; border-color: #10b981; 
        }
        .swagger-ui .auth-btn-wrapper .btn-done:hover, .swagger-ui .auth-btn-wrapper .btn.authorize:hover { 
          background-color: #059669; border-color: #059669; 
        }
      `,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`
🚀 E-Commerce NestJS API is running!

📍 Server: http://localhost:${process.env.PORT ?? 3000}
📚 API Documentation: http://localhost:${process.env.PORT ?? 3000}/api-docs
📊 Interactive Swagger UI available with authentication support

🛒 E-Commerce Features:
  ✅ JWT Authentication & Role-based Authorization  
  ✅ Product Management with Search & Filtering
  ✅ Shopping Cart (Guest & User support)
  ✅ Order Processing with COD Payment
  ✅ Admin Panel for Order Management
  ✅ Image Upload to Supabase Storage
  ✅ Comprehensive API Documentation

🔑 Admin Setup: Use POST /api/auth/admin/create for first admin user
� Image Storage: Configure Supabase credentials in .env file
💾 Database: PostgreSQL with Prisma ORM
`);
}

bootstrap();