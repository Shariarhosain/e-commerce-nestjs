# Role-Based Access Control (RBAC) Implementation

## Overview

Your NestJS application now has a complete role-based access control system that restricts user management operations to admin users only.

## User Roles

- **USER**: Default role for regular users
- **ADMIN**: Administrative role with full access to user management

## Protected Endpoints

### Admin-Only Endpoints (JWT + Admin Role Required)

All user management endpoints now require admin role:

- `POST /users` - Create a new user (Admin only)
- `GET /users` - Get all users (Admin only) 
- `GET /users/:id` - Get user by ID (Admin only)
- `DELETE /users/:id` - Delete a user (Admin only)

### User Endpoints (JWT Required)

- `PATCH /users/:id` - Update user (Users can update their own profile)

## Setting Up Admin Access

### 1. Create First Admin User

Use the new endpoint to create the first admin user:

```http
POST /api/auth/create-admin
Content-Type: application/json

{
  "email": "admin@company.com",
  "username": "admin",
  "password": "AdminPassword123!",
  "name": "System Administrator"
}
```

**Important Notes:**
- This endpoint can only be used when NO admin exists in the system
- Admin users are created with `isEmailVerified: true` (no email verification needed)
- After the first admin is created, this endpoint will return a 409 Conflict error

### 2. Admin Login

Admins login the same way as regular users:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "AdminPassword123!"
}
```

### 3. Using Admin Endpoints

Include the JWT token in the Authorization header:

```http
GET /users
Authorization: Bearer your-jwt-token-here
```

## Error Responses

### Non-Admin Users Accessing Admin Endpoints

```json
{
  "message": "Required roles: ADMIN",
  "statusCode": 403
}
```

### Creating Admin When One Already Exists

```json
{
  "message": "Admin user already exists. Contact existing admin for new admin creation.",
  "statusCode": 409
}
```

## Implementation Details

### Guards Used

1. **JwtAuthGuard**: Validates JWT token and sets `request.user`
2. **RolesGuard**: Checks if user has required role(s)

### Decorators

- `@Roles(UserRole.ADMIN)`: Marks endpoints that require admin role
- `@UseGuards(JwtAuthGuard, RolesGuard)`: Applied to controllers/methods

### Database Schema

```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  username        String   @unique
  password        String
  name            String?
  role            UserRole @default(USER)  // New field
  isEmailVerified Boolean  @default(false)
  // ... other fields
}

enum UserRole {
  USER
  ADMIN
}
```

## API Documentation

The Swagger documentation has been updated to reflect:
- Admin-only endpoints are clearly marked
- Role information is included in user responses
- Proper error responses for insufficient permissions

## Security Features

1. **Role Verification**: Every admin endpoint verifies user role
2. **First Admin Protection**: Only one admin can be created via the special endpoint
3. **JWT Integration**: Roles are included in JWT payload for efficient verification
4. **Clear Error Messages**: Users understand why access was denied

## Testing the Implementation

1. **Create First Admin**: Use `/api/auth/create-admin`
2. **Login as Admin**: Get JWT token
3. **Test Admin Endpoints**: Try user management operations
4. **Create Regular User**: Use `/api/auth/register`
5. **Test Regular User**: Verify they can't access admin endpoints

Your user management system is now properly secured with role-based access control!