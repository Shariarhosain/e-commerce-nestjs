# Role Authorization Debug Guide

## Check Your Current Role

First, let's verify what role your account actually has:

```bash
curl -X 'GET' \
  'http://localhost:3000/api/auth/profile' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

This will show your user profile including your `role` field.

## Test Admin-Only Endpoints

Try accessing these admin-only endpoints to see if they're properly blocked:

### 1. Create Product (Should be ADMIN only)
```bash
curl -X 'POST' \
  'http://localhost:3000/api/products' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 29.99,
    "stock": 10,
    "categoryId": "some-category-id"
  }'
```

### 2. Create Category (Should be ADMIN only)
```bash
curl -X 'POST' \
  'http://localhost:3000/api/categories' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Category",
    "description": "Test Description"
  }'
```

### 3. Update Order Status (Should be ADMIN only)
```bash
curl -X 'PATCH' \
  'http://localhost:3000/api/orders/SOME_ORDER_ID/status' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "APPROVED"
  }'
```

## Expected Results

If the system is working correctly:
- **USER role**: Should get `403 Forbidden` with message "Required roles: ADMIN"
- **ADMIN role**: Should be able to access these endpoints

## Possible Issues

1. **Your account might actually be ADMIN**: Check the profile endpoint
2. **Guards not working**: Missing or incorrect guard configuration
3. **Database inconsistency**: Role field might be corrupted

## Next Steps

Please run the profile check first and let me know:
1. What role shows up in your profile
2. Which specific admin actions you can perform
3. What responses you get from the test endpoints above