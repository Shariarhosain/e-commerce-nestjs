# Orders API Error Handling Implementation

## Overview
This document outlines the comprehensive error handling improvements implemented for the Orders API endpoints. The changes ensure proper authentication error messages and user-friendly responses for all order-related operations.

## Key Improvements

### 1. Custom Authentication Guard
- **File**: `src/orders/guards/order-auth.guard.ts`
- **Purpose**: Provides context-specific error messages for orders endpoints
- **Features**:
  - Custom error messages based on HTTP method and endpoint
  - Clear "must login before order" messages
  - Specific guidance for different operations

### 2. Enhanced DTO Validation
- **Files**: 
  - `src/orders/dto/create-order.dto.ts`
  - `src/orders/dto/update-order-status.dto.ts`
- **Improvements**:
  - Detailed validation messages for all fields
  - Proper length constraints with error messages
  - User-friendly error descriptions

### 3. Improved Controller Error Responses
- **File**: `src/orders/orders.controller.ts`
- **Changes**:
  - Updated to use `OrderAuthGuard` instead of generic `JwtAuthGuard`
  - Comprehensive API response documentation
  - Detailed error schemas in Swagger documentation

### 4. Enhanced Service Error Messages
- **File**: `src/orders/orders.service.ts`
- **Improvements**:
  - Clear, actionable error messages for all scenarios
  - Better authentication requirement messages
  - Detailed business rule validation errors
  - Status transition validation with explanations

## Error Message Examples

### Authentication Errors
```json
{
  "statusCode": 401,
  "message": "You must be logged in to place an order. Please login or register to continue.",
  "error": "Unauthorized"
}
```

### Order Creation Errors
```json
{
  "statusCode": 400,
  "message": "Cannot create order with empty cart. Please add items to your cart first.",
  "error": "Bad Request"
}
```

### Stock Validation Errors
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for \"Product Name\". Available: 5, Requested: 10. Please update your cart and try again.",
  "error": "Bad Request"
}
```

### Access Control Errors
```json
{
  "statusCode": 403,
  "message": "You can only access your own orders. This order belongs to another user.",
  "error": "Forbidden"
}
```

### Status Update Errors
```json
{
  "statusCode": 400,
  "message": "Cannot change status from SHIPPED back to PENDING. Invalid status transition.",
  "error": "Bad Request"
}
```

## API Endpoints Covered

### POST /api/orders
- **Authentication**: Required (clear "must login" message)
- **Validation**: Shipping address, phone number with detailed messages
- **Business Logic**: Cart validation, stock checking

### GET /api/orders
- **Authentication**: Required (login to view order history)
- **Authorization**: Users see own orders, admins see all
- **Filtering**: Proper validation for date ranges and status

### GET /api/orders/:id
- **Authentication**: Required
- **Authorization**: Own orders only (unless admin)
- **Validation**: Order existence and access rights

### PATCH /api/orders/:id/status
- **Authentication**: Required (admin privileges message)
- **Authorization**: Admin role required
- **Business Logic**: Status transition validation

### GET /api/orders/stats
- **Authentication**: Required
- **Role-based**: Different stats for users vs admins

## Validation Rules Added

### CreateOrderDto
- `shippingAddress`: Min 10 chars, max 200 chars
- `phoneNumber`: Min 10 chars, required for delivery
- `notes`: Optional, max 500 chars
- `guestToken`: Optional string validation

### UpdateOrderStatusDto
- `status`: Valid enum values with clear error message
- `notes`: Optional, max 500 chars

## Testing Scenarios Covered

1. **Unauthenticated Access**: Clear login requirements
2. **Empty Cart Orders**: Helpful guidance to add items
3. **Stock Validation**: Specific product and quantity information
4. **Order Access**: Clear ownership validation
5. **Admin Operations**: Role requirement messaging
6. **Status Transitions**: Business rule explanations

## Benefits

1. **User Experience**: Clear, actionable error messages
2. **Developer Experience**: Comprehensive Swagger documentation
3. **Security**: Proper authentication and authorization checks
4. **Maintainability**: Centralized error handling patterns
5. **API Documentation**: Detailed error response schemas

## Implementation Notes

- All endpoints use the custom `OrderAuthGuard` for consistent error messages
- Error messages are user-friendly and provide clear next steps
- Business logic errors include specific details (product names, quantities, etc.)
- Authentication errors are tailored to the specific operation being attempted
- Status transition validation prevents invalid state changes with explanations

This implementation ensures that users receive clear, helpful error messages throughout their order management experience, particularly emphasizing the need to login before placing orders and other critical operations.