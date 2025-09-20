# Authentication API Testing

This document provides examples of how to test the authentication endpoints.

## Base URL
```
http://localhost:3000
```

## Authentication Endpoints

### 1. Register a new user
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "TestPassword123!",
  "name": "Test User"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Verify email with the code sent
```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Token from registration
  "code": "123456" // 6-digit code from email
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User",
    "isEmailVerified": true,
    "createdAt": "2025-09-20T14:32:00.000Z",
    "updatedAt": "2025-09-20T14:32:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Login with verified user
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User",
    "isEmailVerified": true,
    "createdAt": "2025-09-20T14:32:00.000Z",
    "updatedAt": "2025-09-20T14:32:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Access protected endpoints
```bash
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Refresh access token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6. Forgot password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 7. Reset password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123!"
}
```

### 8. Logout
```bash
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Protected Endpoints

All `/users` endpoints now require JWT authentication:

```bash
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "Please verify your email before accessing this resource",
  "statusCode": 403
}
```

### 409 Conflict
```json
{
  "message": "Email already exists",
  "statusCode": 409
}
```

## Notes

1. **Email Verification**: After registration, a 6-digit code is sent to the user's email. The code expires in 15 minutes.

2. **JWT Tokens**: 
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days

3. **Password Requirements**: 
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

4. **Username Requirements**:
   - 3-20 characters
   - Only letters, numbers, and underscores allowed

5. **Email Configuration**: Make sure to configure SMTP settings in your `.env` file for email functionality.