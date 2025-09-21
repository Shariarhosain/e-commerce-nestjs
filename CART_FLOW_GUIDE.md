# Cart System Flow Guide

## Overview
The cart system now provides a seamless experience where guest carts are automatically transferred to user accounts during registration or login, eliminating the need for manual cart transfer operations.

## Guest Cart Flow

### 1. Adding Items to Cart (Unauthenticated)
- **Endpoint**: `POST /api/cart`
- **Authentication**: Not required
- **Flow**:
  1. User adds item to cart without being logged in
  2. System automatically generates a guest token (UUID)
  3. Guest cart is created with the generated token
  4. Response includes the generated guest token in `X-Guest-Token` header

### 2. Subsequent Cart Operations (Guest)
- **Authentication**: Use `X-Guest-Token` header with the token received from adding first item
- **Available Operations**:
  - `GET /api/cart` - View cart contents
  - `PUT /api/cart/items/:id` - Update item quantity
  - `DELETE /api/cart/items/:id` - Remove item from cart
  - `DELETE /api/cart` - Clear entire cart

## User Account Integration

### 3. User Registration with Existing Guest Cart
- **Endpoint**: `POST /api/auth/register`
- **Headers**: Include `X-Guest-Token` header if user has items in guest cart
- **Flow**:
  1. User registers for new account
  2. If `X-Guest-Token` header is provided, guest cart is automatically transferred
  3. Guest cart items are merged with any existing user cart
  4. Guest cart is deleted after successful transfer
  5. User receives authentication tokens and can continue using their cart

### 4. User Login with Existing Guest Cart
- **Endpoint**: `POST /api/auth/login`
- **Headers**: Include `X-Guest-Token` header if user has items in guest cart
- **Flow**:
  1. User logs into existing account
  2. If `X-Guest-Token` header is provided, guest cart is automatically transferred
  3. Guest cart items are merged with user's existing cart
  4. Guest cart is deleted after successful transfer
  5. User receives authentication tokens and can access their complete cart

## Authenticated Cart Operations

### 5. Cart Operations (Authenticated Users)
- **Authentication**: Required - use JWT token in Authorization header
- **Available Operations**:
  - `POST /api/cart` - Add items to cart
  - `GET /api/cart` - View cart contents
  - `PUT /api/cart/items/:id` - Update item quantity
  - `DELETE /api/cart/items/:id` - Remove item from cart
  - `DELETE /api/cart` - Clear entire cart

## Key Features

### Automatic Guest Token Generation
- No need to manually create guest tokens
- System generates tokens automatically when unauthenticated users add items
- Tokens are returned in response headers for subsequent requests

### Seamless Cart Transfer
- Guest carts are automatically transferred during registration/login
- No manual transfer endpoints needed
- Cart merging handles duplicate items intelligently

### Flexible Authentication
- All cart endpoints work with both guest tokens and user authentication
- Optional authentication allows mixed usage patterns
- Guest tokens are prioritized from headers over request body

## API Examples

### Adding First Item (Guest)
```http
POST /api/cart
Content-Type: application/json

{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 2
}

Response:
X-Guest-Token: 987fcdeb-51a2-43d1-9f4e-123456789abc
{
  "id": "cart-id",
  "items": [...],
  "guestToken": "987fcdeb-51a2-43d1-9f4e-123456789abc"
}
```

### User Registration with Cart Transfer
```http
POST /api/auth/register
Content-Type: application/json
X-Guest-Token: 987fcdeb-51a2-43d1-9f4e-123456789abc

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response:
{
  "user": {...},
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
// Guest cart automatically transferred to user account
```

## Error Handling

### Guest Token Validation
- Invalid guest tokens return 404 "Guest cart not found"
- Expired or non-existent tokens are handled gracefully

### Product Validation
- Stock verification before adding items
- Product existence validation
- Proper error messages for insufficient stock

### Authentication Flexibility
- Endpoints work without authentication (guest mode)
- Authenticated requests take precedence over guest tokens
- Smooth transition between guest and authenticated states

## Database Schema

### Cart Model
```prisma
model Cart {
  id         String     @id @default(cuid())
  userId     String?    @unique
  guestToken String?    @unique
  items      CartItem[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}
```

### Key Points
- Either `userId` OR `guestToken` is set, never both
- Guest carts use `guestToken` for identification
- User carts use `userId` for identification
- Automatic conversion during transfer process