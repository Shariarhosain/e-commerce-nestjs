# Cart Implementation Fix - Complete Documentation

## Overview

The cart system has been completely updated to provide a seamless experience for both guest and authenticated users. The key improvements include automatic guest token generation, flexible authorization support, and proper cart operations management.

## Fixed Cart Flow

### 1. **Adding Items to Cart (`POST /api/cart/add`)**

**For Guest Users:**
- **Without any token**: Automatically creates a new guest cart and returns a guest token
- **With existing guest token**: Can be passed via:
  - Authorization header: `Bearer <guest-token>` (if token looks like UUID)
  - Authorization header: `Guest <guest-token>`
  - Request body: `{ "productId": "...", "quantity": 1, "guestToken": "..." }`

**For Authenticated Users:**
- Uses JWT token in Authorization header: `Bearer <jwt-token>`
- Automatically creates or uses existing user cart

**Response:**
```json
{
  "id": "cart-uuid",
  "userId": "user-uuid" | null,
  "guestToken": "guest-token-uuid", // Only when new guest cart is created
  "cartItems": [...],
  "totalAmount": 1299.98,
  "totalItems": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. **Getting Cart Contents (`GET /api/cart`)**

**Authorization Methods:**
- **JWT Token**: `Authorization: Bearer <jwt-token>`
- **Guest Token (Header)**: `Authorization: Bearer <guest-token>` or `Authorization: Guest <guest-token>`
- **Guest Token (Query)**: `?guestToken=<guest-token>`

**Priority**: Authorization header takes precedence over query parameter

### 3. **Updating Cart Item Quantity (`PATCH /api/cart/items/:itemId`)**

**Authorization**: Same as GET cart
**Body**:
```json
{
  "quantity": 3, // Set to 0 to remove item
  "guestToken": "..." // Optional, only if not using Authorization header
}
```

### 4. **Removing Specific Cart Item (`DELETE /api/cart/items/:itemId`)**

**Authorization**: Same as GET cart
**Query Parameter**: `?guestToken=<token>` (optional if using Authorization header)

### 5. **Clearing Entire Cart (`DELETE /api/cart/clear`)**

**Authorization**: Same as GET cart
**Query Parameter**: `?guestToken=<token>` (optional if using Authorization header)

### 6. **Creating Guest Cart Token (`POST /api/cart/guest`)**

**Purpose**: Explicitly create a guest cart token (though this is automatically done when adding items)
**Response**:
```json
{
  "guestToken": "guest-token-uuid",
  "message": "Guest cart created successfully"
}
```

### 7. **Transferring Guest Cart to User (`POST /api/cart/transfer`)**

**Purpose**: When a guest user logs in, transfer their cart to their user account
**Authorization**: Requires JWT token
**Body**:
```json
{
  "guestToken": "guest-token-uuid"
}
```

## Technical Implementation Details

### Guest Token Detection

The system automatically detects guest tokens vs JWT tokens:
- **Guest tokens**: UUID format (36 characters with hyphens, no dots)
- **JWT tokens**: Much longer with dots separating sections

### Authorization Header Support

```javascript
// Supported formats:
Authorization: Bearer <jwt-token>           // For authenticated users
Authorization: Bearer <guest-token>        // For guest users (UUID format)
Authorization: Guest <guest-token>         // Alternative guest format
```

### Cart Operations Security

- **Guest users**: Cart operations validated against guest token
- **Authenticated users**: Cart operations validated against user ID
- **Cross-validation**: Prevents unauthorized access to other users' carts

### Database Schema

```prisma
model Cart {
  id        String   @id @default(uuid())
  userId    String?  // Nullable for guest carts
  guestToken String? @unique // For guest carts
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  cartItems CartItem[]
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  
  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([cartId, productId])
}
```

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/cart/guest` | Create guest cart token | No |
| POST | `/api/cart/add` | Add item to cart | Optional |
| GET | `/api/cart` | Get cart contents | Optional |
| PATCH | `/api/cart/items/:id` | Update item quantity | Optional |
| DELETE | `/api/cart/items/:id` | Remove specific item | Optional |
| DELETE | `/api/cart/clear` | Clear entire cart | Optional |
| POST | `/api/cart/transfer` | Transfer guest cart to user | Yes (JWT) |

## Example Usage Scenarios

### Scenario 1: Guest User Shopping
```bash
# 1. Add first item (creates guest cart)
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"productId": "product-uuid", "quantity": 2}'

# Response includes guestToken: "abc-123-def"

# 2. Add more items using guest token in header
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc-123-def" \
  -d '{"productId": "another-product-uuid", "quantity": 1}'

# 3. View cart
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer abc-123-def"

# 4. Update quantity
curl -X PATCH http://localhost:3000/api/cart/items/item-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc-123-def" \
  -d '{"quantity": 3}'
```

### Scenario 2: Authenticated User Shopping
```bash
# 1. Login and get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Response includes access_token: "jwt-token"

# 2. Add items to cart
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token" \
  -d '{"productId": "product-uuid", "quantity": 2}'

# 3. View cart
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer jwt-token"
```

### Scenario 3: Guest Cart Transfer
```bash
# Guest has items in cart with token "abc-123-def"
# User logs in and wants to transfer guest cart

curl -X POST http://localhost:3000/api/cart/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token" \
  -d '{"guestToken": "abc-123-def"}'
```

## Key Features

✅ **Automatic guest token generation** when adding items without authentication  
✅ **Flexible authorization** supporting both header and query parameter guest tokens  
✅ **Smart token detection** distinguishing between JWT and guest tokens  
✅ **Seamless cart operations** for both guest and authenticated users  
✅ **Cart transfer functionality** for login scenarios  
✅ **Proper authorization validation** preventing unauthorized access  
✅ **Complete CRUD operations** for cart management  
✅ **Stock validation** during cart operations  
✅ **Comprehensive error handling** with meaningful messages  

The cart system now provides a complete e-commerce shopping experience with proper guest and user session management!