# Cart Update Examples - Using Cart Item IDs

## Current Cart Status
Based on your cart response, you have 2 items:

### Item 1: Hiking Backpack
- **Cart Item ID**: `4675008e-391a-4a5f-b36f-f627597953b9`
- **Product ID**: `5af4fe53-f9d0-4a26-810e-812932b47dad`
- **Current Quantity**: 5
- **Price**: $129.99
- **Subtotal**: $649.95

### Item 2: Ergonomic Office Chair  
- **Cart Item ID**: `d4dd7cda-f57b-4e94-8cfe-5a9f8ecea615`
- **Product ID**: `13ac2e3b-f0bc-4bde-8df1-384c518231b9`
- **Current Quantity**: 5
- **Price**: $399.99
- **Subtotal**: $1,999.95

**Total Cart Value**: $2,649.90 (10 items)

---

## How to Update These Items Using Cart Item IDs

### 1. Update Hiking Backpack Quantity

**Endpoint**: `PATCH /api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9`

**Request**:
```http
PATCH /api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9
Content-Type: application/json
X-Guest-Token: c815eee3-c605-41af-b44d-3e5835541c61

{
  "quantity": 3
}
```

**cURL Example**:
```bash
curl -X PATCH "http://localhost:3000/api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9" \
  -H "Content-Type: application/json" \
  -H "X-Guest-Token: c815eee3-c605-41af-b44d-3e5835541c61" \
  -d '{"quantity": 3}'
```

### 2. Update Office Chair Quantity

**Endpoint**: `PATCH /api/cart/items/d4dd7cda-f57b-4e94-8cfe-5a9f8ecea615`

**Request**:
```http
PATCH /api/cart/items/d4dd7cda-f57b-4e94-8cfe-5a9f8ecea615
Content-Type: application/json
X-Guest-Token: c815eee3-c605-41af-b44d-3e5835541c61

{
  "quantity": 2
}
```

**cURL Example**:
```bash
curl -X PATCH "http://localhost:3000/api/cart/items/d4dd7cda-f57b-4e94-8cfe-5a9f8ecea615" \
  -H "Content-Type: application/json" \
  -H "X-Guest-Token: c815eee3-c605-41af-b44d-3e5835541c61" \
  -d '{"quantity": 2}'
```

### 3. Remove an Item Completely

To remove the Hiking Backpack:

**Endpoint**: `DELETE /api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9`

**Request**:
```http
DELETE /api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9
X-Guest-Token: c815eee3-c605-41af-b44d-3e5835541c61
```

**cURL Example**:
```bash
curl -X DELETE "http://localhost:3000/api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9" \
  -H "X-Guest-Token: c815eee3-c605-41af-b44d-3e5835541c61"
```

### 4. Alternative: Set Quantity to 0 (Also Removes Item)

**Request**:
```http
PATCH /api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9
Content-Type: application/json
X-Guest-Token: c815eee3-c605-41af-b44d-3e5835541c61

{
  "quantity": 0
}
```

---

## JavaScript/Frontend Examples

### Using Fetch API

```javascript
// Update Hiking Backpack quantity to 3 (using cart item ID)
async function updateHikingBackpack() {
  const response = await fetch('/api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Guest-Token': 'c815eee3-c605-41af-b44d-3e5835541c61'
    },
    body: JSON.stringify({
      quantity: 3
    })
  });
  
  const updatedCart = await response.json();
  console.log('Updated cart:', updatedCart);
}

// Update Office Chair quantity to 2 (using cart item ID)
async function updateOfficeChair() {
  const response = await fetch('/api/cart/items/d4dd7cda-f57b-4e94-8cfe-5a9f8ecea615', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Guest-Token': 'c815eee3-c605-41af-b44d-3e5835541c61'
    },
    body: JSON.stringify({
      quantity: 2
    })
  });
  
  const updatedCart = await response.json();
  console.log('Updated cart:', updatedCart);
}

// Remove Hiking Backpack completely (using cart item ID)
async function removeHikingBackpack() {
  const response = await fetch('/api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9', {
    method: 'DELETE',
    headers: {
      'X-Guest-Token': 'c815eee3-c605-41af-b44d-3e5835541c61'
    }
  });
  
  const updatedCart = await response.json();
  console.log('Updated cart:', updatedCart);
}
```

### Using Axios

```javascript
import axios from 'axios';

const guestToken = 'c815eee3-c605-41af-b44d-3e5835541c61';

// Update quantities using cart item IDs
await axios.patch('/api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9', 
  { quantity: 3 },
  { headers: { 'X-Guest-Token': guestToken } }
);

await axios.patch('/api/cart/items/d4dd7cda-f57b-4e94-8cfe-5a9f8ecea615',
  { quantity: 2 },
  { headers: { 'X-Guest-Token': guestToken } }
);

// Remove item using cart item ID
await axios.delete('/api/cart/items/4675008e-391a-4a5f-b36f-f627597953b9', {
  headers: { 'X-Guest-Token': guestToken }
});
```

---

## Expected Response After Updates

After updating the quantities (Hiking Backpack: 3, Office Chair: 2), your cart would look like:

```json
{
  "id": "eeca0848-98a8-47fd-84ab-eaa9cdaf50fb",
  "guestToken": "c815eee3-c605-41af-b44d-3e5835541c61",
  "cartItems": [
    {
      "id": "4675008e-391a-4a5f-b36f-f627597953b9",
      "productId": "5af4fe53-f9d0-4a26-810e-812932b47dad",
      "quantity": 3,
      "product": {
        "name": "Hiking Backpack",
        "price": 129.99
      }
    },
    {
      "id": "d4dd7cda-f57b-4e94-8cfe-5a9f8ecea615",
      "productId": "13ac2e3b-f0bc-4bde-8df1-384c518231b9", 
      "quantity": 2,
      "product": {
        "name": "Ergonomic Office Chair",
        "price": 399.99
      }
    }
  ],
  "totalAmount": 1189.95,
  "totalItems": 5
}
```

**New Total**: $1,189.95 (5 items)
- Hiking Backpack: 3 × $129.99 = $389.97
- Office Chair: 2 × $399.99 = $799.98

---

## Cart Item ID vs Product ID

✅ **Cart Item ID**: Unique identifier for each item in the cart (what we're using now)  
- Each cart item has its own unique ID
- Used for update/remove operations
- Found in the cart response under `cartItems[].id`

ℹ️ **Product ID**: Identifier for the product in the catalog  
- Used when adding items to cart
- Found in the cart response under `cartItems[].productId`
- Multiple cart items can reference the same product ID (if added separately)

The API now uses cart item IDs for update/remove operations as requested! �