# 🛒 **E-Commerce NestJS API**

![Node.js](https://img.shields.io/badge/Node.js-18.x-green) ![NestJS](https://img.shields.io/badge/NestJS-10.x-red) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue) ![JWT](https://img.shields.io/badge/JWT-Auth-orange) ![Swagger](https://img.shields.io/badge/Swagger-API%20Docs-brightgreen)

A comprehensive, production-ready e-commerce REST API built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. Features include role-based authentication, guest cart support, product management, order processing, and complete admin dashboard capabilities.

---

## 📋 **Table of Contents**

- [🚀 Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [📊 User Flow Diagrams](#-user-flow-diagrams)
- [🛠️ Technology Stack](#️-technology-stack)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🔧 Environment Configuration](#-environment-configuration)
- [📚 API Documentation](#-api-documentation)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [🎯 Usage Examples](#-usage-examples)
- [🧪 Testing](#-testing)
- [📈 Database Schema](#-database-schema)
- [🚀 Future Scope](#-future-scope)
- [🤝 Contributing](#-contributing)

---

## 🚀 **Latest Updates & New Features**

### **🆕 Recently Added (v1.2.0)**
- ✅ **Multiple Images Array Support**: Products now return `imageUrls` array instead of single `imageUrl`
- ✅ **Enhanced UPDATE Endpoint**: PATCH now supports partial updates - only send fields you want to change
- ✅ **Improved Swagger Documentation**: Better API examples with required/optional field indicators
- ✅ **Database Migration**: Seamlessly migrated from single image to multiple images array
- ✅ **Backward Compatibility**: Old image URLs preserved during migration

---

## 🚀 **Features**

### 🔐 **Authentication & Authorization**
- ✅ **JWT Authentication** with access and refresh tokens
- ✅ **Role-Based Access Control** (USER, ADMIN)
- ✅ **Guest Cart Support** for non-authenticated users
- ✅ **Secure Password Hashing** with bcrypt
- ✅ **Token Refresh & Logout** functionality

### 🛍️ **Guest User Experience**
- ✅ **Browse Products** without authentication
- ✅ **Guest Cart Management** with unique tokens
- ✅ **Cart Persistence** across browser sessions
- ✅ **Seamless Cart Transfer** on registration/login
- ⚠️ **Guest Checkout** (Currently requires registration - see [Future Scope](#-future-scope))

### 👤 **Registered User Features**
- ✅ **User Registration & Login**
- ✅ **Profile Management**
- ✅ **Persistent Shopping Cart**
- ✅ **Order History & Tracking**
- ✅ **Secure Checkout Process**

### 📦 **Product Management**
- ✅ **CRUD Operations** for products (Admin only)
- ✅ **Advanced Search & Filtering**
- ✅ **Category Management**
- ✅ **Multiple Image Upload** (up to 5 images per product)
- ✅ **Image Upload Support** (Supabase Storage)
- ✅ **Stock Management & Validation**
- ✅ **Product Pagination & Sorting**

### 🛒 **Shopping Cart**
- ✅ **Guest Cart** with unique token generation
- ✅ **User Cart** with automatic synchronization
- ✅ **Add/Update/Remove** cart items
- ✅ **Real-time Stock Validation**
- ✅ **Cart Transfer** from guest to registered user

### 📋 **Order Management**
- ✅ **Checkout Process** from cart to order
- ✅ **Order Status Tracking** (PENDING → APPROVED → PROCESSING → SHIPPED → DELIVERED → CANCELLED)
- ✅ **Admin Order Management**
- ✅ **Stock Reduction** on order confirmation
- ✅ **Order History** with pagination

### 🏪 **Admin Dashboard**
- ✅ **Product & Category Management**
- ✅ **Order Status Updates**
- ✅ **User Management**
- ✅ **Inventory Control**
- ✅ **Sales Analytics**
- ✅ **Bulk Operations**

### 📤 **File Management**
- ✅ **Multiple Image Upload** for products (max 5 images)
- ✅ **Image Delete API** for removing uploaded images
- ✅ **Supabase Storage Integration**
- ✅ **File Validation** (size, type, security)
- ✅ **Secure URL Generation**

---

## 🏗️ **System Architecture**

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Web Application]
        MOBILE[Mobile App]
        ADMIN[Admin Dashboard]
    end
    
    subgraph "API Gateway"
        NEST[NestJS Application]
        AUTH[JWT Authentication]
        GUARD[Role Guards]
    end
    
    subgraph "Business Logic"
        USER_SERVICE[User Service]
        PRODUCT_SERVICE[Product Service]
        CART_SERVICE[Cart Service]
        ORDER_SERVICE[Order Service]
        UPLOAD_SERVICE[Upload Service]
    end
    
    subgraph "Data Layer"
        PRISMA[Prisma ORM]
        DB[(PostgreSQL Database)]
        SUPABASE[Supabase Storage]
    end
    
    WEB --> NEST
    MOBILE --> NEST
    ADMIN --> NEST
    
    NEST --> AUTH
    NEST --> GUARD
    
    AUTH --> USER_SERVICE
    GUARD --> USER_SERVICE
    GUARD --> PRODUCT_SERVICE
    GUARD --> CART_SERVICE
    GUARD --> ORDER_SERVICE
    GUARD --> UPLOAD_SERVICE
    
    USER_SERVICE --> PRISMA
    PRODUCT_SERVICE --> PRISMA
    CART_SERVICE --> PRISMA
    ORDER_SERVICE --> PRISMA
    UPLOAD_SERVICE --> SUPABASE
    
    PRISMA --> DB
```

---

## 📊 **User Flow Diagrams**

### 🌐 **Guest User Flow**

```mermaid
flowchart TD
    START([Guest Visits Website]) --> BROWSE[Browse Products]
    BROWSE --> SEARCH{Search/Filter Products?}
    SEARCH -->|Yes| FILTER[Apply Filters]
    SEARCH -->|No| VIEW[View Product Details]
    FILTER --> VIEW
    
    VIEW --> ADD_CART{Add to Cart?}
    ADD_CART -->|Yes| CREATE_GUEST[Create Guest Token]
    CREATE_GUEST --> CART_ADD[Add Item to Cart]
    ADD_CART -->|No| BROWSE
    
    CART_ADD --> CONTINUE{Continue Shopping?}
    CONTINUE -->|Yes| BROWSE
    CONTINUE -->|No| CHECKOUT_DECISION{Ready to Checkout?}
    
    CHECKOUT_DECISION -->|Yes| FORCE_LOGIN[⚠️ Must Register/Login]
    CHECKOUT_DECISION -->|No| BROWSE
    
    FORCE_LOGIN --> REGISTER[Register Account]
    REGISTER --> TRANSFER[Transfer Guest Cart]
    TRANSFER --> CHECKOUT[Complete Checkout]
    CHECKOUT --> ORDER_PLACED[✅ Order Placed]
    
    style FORCE_LOGIN fill:#ffcccc
    style ORDER_PLACED fill:#ccffcc
```

### 👤 **Registered User Flow**

```mermaid
flowchart TD
    START([User Login]) --> AUTH[Authenticate User]
    AUTH --> DASHBOARD[View Dashboard/Products]
    
    DASHBOARD --> BROWSE[Browse Products]
    BROWSE --> SEARCH{Search Products?}
    SEARCH -->|Yes| FILTER[Apply Filters]
    SEARCH -->|No| VIEW[View Product Details]
    FILTER --> VIEW
    
    VIEW --> ADD_CART{Add to Cart?}
    ADD_CART -->|Yes| CART_ADD[Add to User Cart]
    ADD_CART -->|No| BROWSE
    
    CART_ADD --> CART_MANAGE[Manage Cart Items]
    CART_MANAGE --> UPDATE{Update Cart?}
    UPDATE -->|Yes| MODIFY[Modify Quantities]
    UPDATE -->|No| CHECKOUT_READY{Ready to Checkout?}
    MODIFY --> CHECKOUT_READY
    
    CHECKOUT_READY -->|Yes| CHECKOUT[Complete Checkout]
    CHECKOUT_READY -->|No| BROWSE
    
    CHECKOUT --> ORDER_PLACED[✅ Order Placed]
    ORDER_PLACED --> ORDER_HISTORY[View Order History]
    ORDER_HISTORY --> TRACK[Track Order Status]
    
    DASHBOARD --> PROFILE[Manage Profile]
    PROFILE --> UPDATE_PROFILE[Update Information]
    UPDATE_PROFILE --> DASHBOARD
    
    style ORDER_PLACED fill:#ccffcc
    style TRACK fill:#e6f3ff
```

### 🔐 **Admin Management Flow**

```mermaid
flowchart TD
    START([Admin Login]) --> ADMIN_AUTH[Admin Authentication]
    ADMIN_AUTH --> ADMIN_DASHBOARD[Admin Dashboard]
    
    ADMIN_DASHBOARD --> MANAGE_PRODUCTS[Product Management]
    ADMIN_DASHBOARD --> MANAGE_CATEGORIES[Category Management]
    ADMIN_DASHBOARD --> MANAGE_ORDERS[Order Management]
    ADMIN_DASHBOARD --> MANAGE_USERS[User Management]
    
    MANAGE_PRODUCTS --> PRODUCT_CRUD[Create/Update/Delete Products]
    PRODUCT_CRUD --> UPLOAD_IMAGE[Upload Product Images]
    UPLOAD_IMAGE --> STOCK_MANAGEMENT[Manage Stock Levels]
    
    MANAGE_CATEGORIES --> CATEGORY_CRUD[Create/Update/Delete Categories]
    
    MANAGE_ORDERS --> VIEW_ALL_ORDERS[View All Orders]
    VIEW_ALL_ORDERS --> UPDATE_STATUS[Update Order Status]
    UPDATE_STATUS --> ORDER_WORKFLOW{Status Workflow}
    
    ORDER_WORKFLOW --> PENDING[PENDING]
    PENDING --> APPROVED[APPROVED]
    APPROVED --> PROCESSING[PROCESSING]
    PROCESSING --> SHIPPED[SHIPPED]
    SHIPPED --> DELIVERED[DELIVERED]
    
    ORDER_WORKFLOW --> CANCELLED[CANCELLED]
    
    MANAGE_USERS --> VIEW_USERS[View All Users]
    VIEW_USERS --> USER_ACTIONS[User Actions]
    
    style ADMIN_DASHBOARD fill:#fff2cc
    style DELIVERED fill:#ccffcc
    style CANCELLED fill:#ffcccc
```

### 🔄 **Cart Transfer Flow**

```mermaid
sequenceDiagram
    participant G as Guest User
    participant API as NestJS API
    participant DB as Database
    participant U as Registered User
    
    G->>API: Browse Products
    G->>API: POST /api/cart/guest
    API->>DB: Create guest cart with token
    DB-->>API: Return guest token
    API-->>G: Guest token created
    
    G->>API: POST /api/cart/add (with guestToken)
    API->>DB: Add items to guest cart
    DB-->>API: Cart updated
    API-->>G: Item added to cart
    
    Note over G,U: User decides to register/login
    
    G->>API: POST /api/auth/register
    API->>DB: Create user account
    DB-->>API: User created
    API-->>U: Registration successful
    
    U->>API: POST /api/cart/transfer (with guestToken)
    API->>DB: Transfer guest cart to user
    API->>DB: Delete guest cart
    DB-->>API: Transfer complete
    API-->>U: Cart transferred successfully
    
    U->>API: POST /api/orders
    API->>DB: Create order from user cart
    DB-->>API: Order created
    API-->>U: Order placed successfully
```

---

## 🛠️ **Technology Stack**

| Category | Technologies |
|----------|-------------|
| **Backend Framework** | NestJS 10.x, TypeScript 5.x |
| **Database** | PostgreSQL 15.x, Prisma ORM |
| **Authentication** | JWT, bcrypt, Passport.js |
| **File Storage** | Supabase Storage |
| **API Documentation** | Swagger/OpenAPI 3.0 |
| **Validation** | class-validator, class-transformer |
| **Testing** | Jest, Supertest |
| **Code Quality** | ESLint, Prettier |
| **Deployment** | Docker Ready |

---

## ⚙️ **Installation & Setup**

### **Prerequisites**
- Node.js 18.x or higher
- PostgreSQL 15.x
- npm or yarn
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/Shariarhosain/e-commerce-nestjs.git
cd e-commerce-nestjs
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### **4. Database Setup**
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with sample data
npm run seed
```

### **5. Start Application**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### **6. Access API Documentation**
- **Swagger UI**: http://localhost:3000/api-docs
- **API Base URL**: http://localhost:3000/api

---

## 🔧 **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"
JWT_REFRESH_EXPIRES_IN="7d"

# Supabase Configuration (for file uploads)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_BUCKET_NAME="e-commerce"

# Application Configuration
PORT=3000
NODE_ENV="development"
```

### **Environment Variables Explained**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes |
| `JWT_EXPIRES_IN` | Access token expiration time | ✅ Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | ✅ Yes |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | ✅ Yes |
| `SUPABASE_URL` | Supabase project URL | ❌ Optional |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ❌ Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ❌ Optional |
| `SUPABASE_BUCKET_NAME` | Storage bucket name | ❌ Optional |

> **📁 Supabase Storage Note**: Make sure your Supabase bucket is named `'e-commerce'` and has proper read/write permissions for image upload functionality.

---

## 📚 **API Documentation**

### **🔗 Base URL**
```
http://localhost:3000/api
```

### **📖 Interactive Documentation**
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api-docs-json

### **🔐 Authentication**

All protected endpoints require a JWT token in the Authorization header:
```bash
Authorization: Bearer <your-jwt-token>
```

### **📋 Endpoint Categories**

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **🔐 Authentication** | `/api/auth/*` | User registration, login, profile management |
| **🛒 Cart** | `/api/cart/*` | Guest and user cart operations |
| **📂 Categories** | `/api/categories/*` | Product category management |
| **📦 Products** | `/api/products/*` | Product CRUD and search |
| **📋 Orders** | `/api/orders/*` | Order placement and management |
| **📤 Upload** | `/api/upload/*` | Multiple image upload/delete for products |

### **🔗 Key Endpoints**

#### **Authentication**
```bash
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/logout            # User logout
GET    /api/auth/profile           # Get user profile
PATCH  /api/auth/profile           # Update user profile
POST   /api/auth/create-admin      # Create admin user
```

#### **Cart Management**
```bash
POST   /api/cart/guest             # Create guest cart token
POST   /api/cart/add               # Add item to cart
GET    /api/cart                   # Get cart contents
PATCH  /api/cart/items/:id         # Update cart item
DELETE /api/cart/items/:id         # Remove cart item
DELETE /api/cart/clear             # Clear entire cart
POST   /api/cart/transfer          # Transfer guest cart to user
```

#### **Products**
```bash
GET    /api/products               # List products (with pagination/filters)
POST   /api/products               # Create product (Admin only)
GET    /api/products/search        # Search products
GET    /api/products/:id           # Get product details
PATCH  /api/products/:id           # Update product (Admin only)
DELETE /api/products/:id           # Delete product (Admin only)
```

#### **Orders**
```bash
POST   /api/orders                 # Create order from cart
GET    /api/orders                 # Get user orders
GET    /api/orders/stats           # Get order statistics
GET    /api/orders/:id             # Get order details
PATCH  /api/orders/:id/status      # Update order status (Admin only)
```

---

## 🔐 **Authentication & Authorization**

### **🔑 JWT Token System**
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Secure Storage**: Refresh tokens stored in database with revocation support

### **👥 Role-Based Access Control**

| Role | Permissions |
|------|-------------|
| **👤 USER** | View products, manage own cart, place orders, view own order history |
| **👑 ADMIN** | All USER permissions + manage products/categories, view all orders, update order status |

### **🛡️ Security Features**
- ✅ Password hashing with bcrypt
- ✅ JWT token validation on protected routes
- ✅ Role-based route protection
- ✅ Input validation with class-validator
- ✅ SQL injection prevention with Prisma
- ✅ CORS configuration
- ✅ Rate limiting ready

---

## 🎯 **Usage Examples**

### **1. Guest User Journey**

#### **Create Guest Cart**
```bash
curl -X POST http://localhost:3000/api/cart/guest
```
Response:
```json
{
  "guestToken": "uuid-guest-token",
  "message": "Guest cart created successfully"
}
```

#### **Add Product to Guest Cart**
```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-uuid",
    "quantity": 2,
    "guestToken": "uuid-guest-token"
  }'
```

#### **View Guest Cart**
```bash
curl -X GET "http://localhost:3000/api/cart?guestToken=uuid-guest-token"
```

### **2. User Registration & Login**

#### **Register New User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

#### **User Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### **3. Admin Operations**

#### **Create Product with Multiple Images (Admin)**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer admin-jwt-token" \
  -F "name=Gaming Laptop" \
  -F "description=High-performance gaming laptop" \
  -F "price=1299.99" \
  -F "stock=10" \
  -F "categoryId=category-uuid" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg"
```

**Response:**
```json
{
  "id": "product-uuid",
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "stock": 10,
  "imageUrls": [
    "https://your-supabase-url.supabase.co/storage/v1/object/public/e-commerce/products/image1.jpg",
    "https://your-supabase-url.supabase.co/storage/v1/object/public/e-commerce/products/image2.jpg",
    "https://your-supabase-url.supabase.co/storage/v1/object/public/e-commerce/products/image3.jpg"
  ],
  "categoryId": "category-uuid",
  "category": { ... },
  "createdAt": "2025-09-21T...",
  "updatedAt": "2025-09-21T..."
}
```

#### **Update Product with New Images (Admin)**
```bash
# Update only specific fields + replace all images
curl -X PATCH http://localhost:3000/api/products/product-uuid \
  -H "Authorization: Bearer admin-jwt-token" \
  -F "name=Updated Gaming Laptop" \
  -F "price=1399.99" \
  -F "images=@new_image1.jpg" \
  -F "images=@new_image2.jpg"

# Update only images (keep other fields unchanged)
curl -X PATCH http://localhost:3000/api/products/product-uuid \
  -H "Authorization: Bearer admin-jwt-token" \
  -F "images=@replacement1.jpg" \
  -F "images=@replacement2.jpg" \
  -F "images=@replacement3.jpg"
```

#### **Delete Product Image (Admin)**
```bash
curl -X DELETE http://localhost:3000/api/upload/product-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-jwt-token" \
  -d '{
    "imageUrl": "https://your-supabase-url.supabase.co/storage/v1/object/public/e-commerce/products/filename.jpg"
  }'
```

> **📸 Multiple Images Upload Notes**: 
> - You can upload up to **5 images** per product via CREATE or UPDATE endpoints
> - Supported formats: **JPEG, PNG, WebP**
> - Maximum file size: **5MB per image**  
> - Images are stored in Supabase Storage
> - **NEW**: All images are stored in `imageUrls` array in response
> - **UPDATE behavior**: New images replace ALL existing images
> - **Partial updates**: Only send the fields you want to update

#### **Update Order Status (Admin)**
```bash
curl -X PATCH http://localhost:3000/api/orders/order-uuid/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-jwt-token" \
  -d '{
    "status": "SHIPPED"
  }'
```

### **4. Search & Filter Products**

#### **Search Products**
```bash
curl -X GET "http://localhost:3000/api/products/search?q=laptop&category=electronics&minPrice=500&maxPrice=2000&page=1&limit=10"
```

#### **Filter Products**
```bash
curl -X GET "http://localhost:3000/api/products?categoryId=category-uuid&sortBy=price&sortOrder=desc&page=1&limit=10"
```

---

## 🧪 **Testing**

### **Available Test Scripts**
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### **Test Structure**
```
test/
├── app.e2e-spec.ts           # End-to-end tests
├── auth/                     # Authentication tests
├── products/                 # Product management tests
├── cart/                     # Cart functionality tests
└── orders/                   # Order processing tests
```

### **Sample Test Data**

The database seeder includes:
- **👑 Admin User**: admin@ecommerce.com (password: admin123)
- **👥 Sample Users**: 3 test users
- **📂 Categories**: 10 product categories
- **📦 Products**: 15 sample products
- **🛒 Sample Carts**: 2 test carts
- **📋 Sample Orders**: 3 test orders

```bash
# Reset and seed database
npm run db:reset
npm run seed
```

---

## 📈 **Database Schema**

### **🗂️ Entity Relationship Diagram**

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string username UK
        string password
        string name
        enum role
        datetime createdAt
        datetime updatedAt
    }
    
    REFRESH_TOKEN {
        string id PK
        string userId FK
        string token UK
        datetime expiresAt
        boolean isRevoked
        datetime createdAt
    }
    
    CATEGORY {
        string id PK
        string name UK
        string description
        string slug UK
        datetime createdAt
        datetime updatedAt
    }
    
    PRODUCT {
        string id PK
        string name
        string description
        string slug UK
        float price
        int stock
        string imageUrl
        string categoryId FK
        datetime createdAt
        datetime updatedAt
    }
    
    CART {
        string id PK
        string userId FK
        string guestToken UK
        datetime createdAt
        datetime updatedAt
    }
    
    CART_ITEM {
        string id PK
        string cartId FK
        string productId FK
        int quantity
        datetime createdAt
        datetime updatedAt
    }
    
    ORDER {
        string id PK
        string userId FK
        enum status
        float totalAmount
        string shippingAddress
        string phoneNumber
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        float price
        datetime createdAt
    }
    
    USER ||--o{ REFRESH_TOKEN : has
    USER ||--o{ CART : owns
    USER ||--o{ ORDER : places
    
    CATEGORY ||--o{ PRODUCT : contains
    
    CART ||--o{ CART_ITEM : contains
    PRODUCT ||--o{ CART_ITEM : includes
    
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : includes
```

### **📊 Database Tables**

| Table | Purpose | Key Features |
|-------|---------|-------------|
| **users** | User accounts | Role-based access, secure passwords |
| **refresh_tokens** | JWT management | Token revocation, expiration tracking |
| **categories** | Product categorization | Hierarchical organization |
| **products** | Product catalog | Stock management, pricing |
| **carts** | Shopping carts | Guest and user cart support |
| **cart_items** | Cart contents | Quantity management, product linking |
| **orders** | Order tracking | Status workflow, customer info |
| **order_items** | Order details | Price history, quantity tracking |

### **🔄 Order Status Workflow**

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> APPROVED : Admin approval
    PENDING --> CANCELLED : Customer/Admin cancellation
    APPROVED --> PROCESSING : Begin processing
    PROCESSING --> SHIPPED : Package shipped
    SHIPPED --> DELIVERED : Package delivered
    SHIPPED --> CANCELLED : Shipping failed
    DELIVERED --> [*]
    CANCELLED --> [*]
```

---

## 🚀 **Future Scope**

### **✅ Recently Implemented Features**

#### **Enhanced File Management (v1.1.0)**
- ✅ **Multiple Image Upload**: Products now support up to 5 images per product
- ✅ **Image Delete API**: Admin can delete uploaded images via dedicated endpoint
- ✅ **Enhanced Validation**: Improved file type, size validation and error handling
- ✅ **Supabase Integration**: Fixed bucket configuration and URL parsing
- ✅ **Swagger Documentation**: Complete API documentation for upload endpoints

#### **Authentication Improvements (v1.1.0)**
- ✅ **Consistent JWT Auth**: Unified `@ApiBearerAuth('JWT-auth')` across all endpoints
- ✅ **Proper Error Handling**: Enhanced authentication error responses
- ✅ **Role-Based Security**: Improved admin-only endpoint protection

---

### **🔐 User Authentication Enhancements**

#### **Email Verification System**
- **Email Confirmation**: Send verification link on registration
- **Account Activation**: Require email verification before full access
- **Re-send Verification**: Option to resend verification emails
- **Email Templates**: Beautiful HTML email templates

#### **Password Recovery**
- **Forgot Password**: Email-based password reset
- **OTP System**: One-time password via email/SMS
- **Password Strength**: Enhanced password requirements
- **Security Questions**: Additional account recovery options

#### **Two-Factor Authentication**
- **TOTP Support**: Google Authenticator, Authy integration
- **SMS Verification**: Phone number-based 2FA
- **Backup Codes**: Emergency access codes
- **Device Management**: Trusted device tracking

### **💰 Discount & Offers System**

#### **Coupon Management**
- **Coupon Codes**: Alphanumeric discount codes
- **Discount Types**: Percentage, flat amount, free shipping
- **Usage Limits**: Per user, total usage, time-based expiry
- **Minimum Order**: Order value requirements
- **Category Specific**: Apply to specific product categories

#### **Promotional Campaigns**
- **Flash Sales**: Time-limited offers
- **Bulk Discounts**: Quantity-based pricing
- **Seasonal Offers**: Holiday and event-based promotions
- **First-Time Buyer**: Special discounts for new users
- **Referral System**: Reward users for referrals

#### **Loyalty Program**
- **Points System**: Earn points on purchases
- **Tier Benefits**: VIP customer levels
- **Reward Catalog**: Redeem points for products/discounts
- **Birthday Offers**: Special birthday discounts

### **💳 Payment Gateway Integration**

#### **Multiple Payment Options**
- **Credit/Debit Cards**: Visa, MasterCard, American Express
- **Digital Wallets**: PayPal, Apple Pay, Google Pay
- **Bank Transfers**: Direct bank account integration
- **Cryptocurrency**: Bitcoin, Ethereum support
- **Buy Now, Pay Later**: Afterpay, Klarna integration

#### **Mobile Banking (Local)**
- **bKash Integration**: Bangladesh mobile banking
- **Nagad Support**: Government mobile banking
- **Rocket**: Dutch-Bangla Bank mobile banking
- **Other Local**: Country-specific payment methods

#### **Payment Security**
- **PCI Compliance**: Industry standard security
- **Fraud Detection**: AI-powered fraud prevention
- **3D Secure**: Enhanced card verification
- **Tokenization**: Secure payment token storage

### **🎯 User Experience Improvements**

#### **Wishlist & Favorites**
- **Save for Later**: Add products to wishlist
- **Wishlist Sharing**: Share lists with friends/family
- **Price Alerts**: Notify when wishlist items go on sale
- **Move to Cart**: Easy wishlist to cart conversion

#### **Product Reviews & Ratings**
- **Star Ratings**: 5-star product rating system
- **Written Reviews**: Detailed customer feedback
- **Photo Reviews**: Customer product photos
- **Verified Purchases**: Mark reviews from actual buyers
- **Review Helpfulness**: Upvote/downvote reviews
- **Review Moderation**: Admin review approval system

#### **Recommendation Engine**
- **Collaborative Filtering**: "Customers who bought this also bought"
- **Content-Based**: Similar product recommendations
- **Browsing History**: Personalized suggestions
- **AI/ML Integration**: Machine learning recommendations
- **Trending Products**: Popular and trending items
- **Recently Viewed**: Quick access to browsed products

#### **Enhanced Search**
- **Auto-complete**: Search suggestions as you type
- **Search Filters**: Advanced filtering options
- **Visual Search**: Image-based product search
- **Voice Search**: Speech-to-text search functionality
- **Search Analytics**: Track popular search terms

### **📊 Advanced Admin Features**

#### **Analytics Dashboard**
- **Sales Reports**: Revenue, profit, growth metrics
- **Customer Analytics**: User behavior, retention rates
- **Product Performance**: Best/worst selling products
- **Geographic Data**: Sales by location
- **Real-time Metrics**: Live sales and visitor tracking
- **Custom Reports**: Build custom analytics reports

#### **Inventory Management**
- **Stock Alerts**: Low stock notifications
- **Automatic Reordering**: Set reorder points
- **Supplier Management**: Track product suppliers
- **Bulk Operations**: Mass product updates
- **Import/Export**: CSV/Excel data handling
- **Barcode Support**: Product barcode integration

#### **Content Management**
- **Rich Text Editor**: Enhanced product descriptions
- **SEO Optimization**: Meta tags, URL slugs
- **Multi-language**: Internationalization support
- **Content Scheduling**: Schedule product launches
- **Bulk Upload**: Mass product import via CSV/Excel

#### **Advanced Order Management**
- **Order Splitting**: Split orders across warehouses
- **Partial Fulfillment**: Ship available items first
- **Return Management**: Handle returns and refunds
- **Shipping Integration**: Real-time shipping rates
- **Print Labels**: Generate shipping labels
- **Order Notes**: Internal order annotations

#### **Role-Based Administration**
- **Sub-Admin Roles**: Limited admin access
- **Permission System**: Granular permission control
- **Audit Logs**: Track admin actions
- **Multi-location**: Support multiple warehouses
- **Staff Management**: Employee account management

### **🌐 Advanced Features**

#### **Multi-tenant Support**
- **Multi-store**: Support multiple stores
- **Store Branding**: Custom themes per store
- **Separate Inventory**: Store-specific products
- **Domain Mapping**: Custom domains per store

#### **API & Integration**
- **Webhooks**: Real-time event notifications
- **Third-party APIs**: ERP, CRM integrations
- **Mobile App APIs**: React Native, Flutter support
- **Partner APIs**: Supplier/vendor integrations

#### **Performance & Scalability**
- **Caching Layer**: Redis implementation
- **CDN Integration**: Global content delivery
- **Database Optimization**: Query optimization
- **Horizontal Scaling**: Multi-server deployment
- **Load Balancing**: Distribute traffic efficiently

---

## 🤝 **Contributing**

We welcome contributions to improve this e-commerce API! Here's how you can help:

### **🔧 Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm run test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### **📝 Contribution Guidelines**
- Follow existing code style and conventions
- Add comprehensive tests for new features
- Update documentation for API changes
- Use clear, descriptive commit messages
- Ensure backward compatibility when possible

### **🐛 Bug Reports**
- Use GitHub Issues to report bugs
- Include steps to reproduce the issue
- Provide error messages and logs
- Specify your environment details

### **💡 Feature Requests**
- Open a GitHub Issue with the enhancement label
- Describe the feature and its benefits
- Provide use cases and examples
- Discuss implementation approach

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 **Support & Contact**

- **GitHub Issues**: [Report bugs or request features](https://github.com/Shariarhosain/e-commerce-nestjs/issues)
- **Documentation**: [API Documentation](http://localhost:3000/api-docs)
- **Author**: Shariar Hosain
- **Email**: [Your Email]

---

## ⭐ **Show Your Support**

If this project helped you, please consider giving it a ⭐ on GitHub! Your support motivates continued development and improvements.

---

**Built with ❤️ using NestJS, TypeScript, and PostgreSQL**