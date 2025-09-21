# Guest Token Removal from Create Order DTO

## Changes Made

### File: `src/orders/dto/create-order.dto.ts`

**Removed:**
- `guestToken` field and its validation decorators
- `IsPhoneNumber` import (unused after removal)

**Current DTO Structure:**
```typescript
export class CreateOrderDto {
  shippingAddress: string;    // Required, 10-200 characters
  phoneNumber: string;        // Required, minimum 10 characters  
  notes?: string;            // Optional, maximum 500 characters
}
```

## Impact

### ✅ What Works:
- Order creation now only requires authenticated users
- Cleaner API without guest functionality
- All existing validation rules remain intact
- Swagger documentation updated automatically

### ✅ API Request Format:
```json
{
  "shippingAddress": "123 Main St, City, State 12345",
  "phoneNumber": "+1234567890", 
  "notes": "Please handle with care"
}
```

### ✅ Validation Messages:
- **shippingAddress**: Must be 10-200 characters, required for order processing
- **phoneNumber**: Must be minimum 10 characters, required for delivery contact  
- **notes**: Optional, maximum 500 characters

## Verification
- ✅ Project builds successfully
- ✅ No references to `guestToken` found in codebase
- ✅ Clean imports with unused validators removed
- ✅ All existing functionality preserved

The `guestToken` field has been completely removed from the order creation process. Orders can now only be placed by authenticated users with valid JWT tokens.