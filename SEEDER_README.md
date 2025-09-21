# Database Seeder

This seeder script populates your e-commerce database with sample data for development and testing purposes.

## What Gets Created

### 👑 Admin User
- **Email**: `admin@ecommerce.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Username**: `admin`

### 👥 Sample Users (3)
- **John Doe**: `john.doe@example.com` (password: `password123`)
- **Jane Smith**: `jane.smith@example.com` (password: `password123`)
- **Bob Wilson**: `bob.wilson@example.com` (password: `password123`)

### 📂 Categories (10)
1. Electronics - Latest electronic devices and gadgets
2. Clothing - Fashion and apparel for all ages
3. Home & Garden - Home improvement and garden supplies
4. Sports & Outdoors - Sports equipment and outdoor gear
5. Books - Books, magazines, and educational materials
6. Health & Beauty - Health supplements and beauty products
7. Toys & Games - Toys, games, and entertainment for kids
8. Automotive - Car accessories and automotive parts
9. Kitchen & Dining - Kitchen appliances and dining essentials
10. Office Supplies - Office equipment and stationery

### 📦 Products (15)
**Electronics:**
- iPhone 15 Pro Max ($1,199.99)
- Samsung Galaxy S24 Ultra ($1,299.99)
- MacBook Pro 16-inch ($2,499.99)

**Clothing:**
- Premium Cotton T-Shirt ($29.99)
- Designer Jeans ($89.99)
- Winter Jacket ($149.99)

**Home & Garden:**
- Smart Home Security Camera ($199.99)
- Garden Tool Set ($79.99)

**Sports & Outdoors:**
- Professional Basketball ($49.99)
- Hiking Backpack ($129.99)

**Books:**
- The Psychology of Programming ($39.99)

**Health & Beauty:**
- Vitamin D3 Supplements ($24.99)

**Toys & Games:**
- Educational Building Blocks ($59.99)

**Kitchen & Dining:**
- Stainless Steel Cookware Set ($299.99)

**Office Supplies:**
- Ergonomic Office Chair ($399.99)

### 🛒 Sample Carts (2)
- User 1: iPhone + 2x T-Shirts
- User 2: Samsung Galaxy + Security Camera

### 📋 Sample Orders (3)
- **Pending Order**: $1,259.97 (iPhone + T-Shirts)
- **Approved Order**: $1,499.98 (Samsung Galaxy + Security Camera)
- **Delivered Order**: $179.98 (Winter Jacket + T-Shirt)

## How to Use

### Run Seeder
```bash
npm run seed
```

### Reset Database and Seed
```bash
npm run db:reset
npm run seed
```

### Or Combined
```bash
npm run db:reset && npm run seed
```

## Available Scripts

- `npm run seed` - Run the seeder script
- `npm run db:reset` - Reset database (removes all data and re-runs migrations)
- `npm run db:seed` - Alias for `npm run seed`

## Notes

- The seeder will **clear all existing data** before inserting new data
- Product images use Unsplash URLs for realistic sample images
- All users have the same password: `password123` (except admin: `admin123`)
- Orders include realistic shipping addresses and phone numbers
- Stock quantities are set to realistic values for testing

## Testing the Data

After running the seeder, you can:

1. **Login as Admin**: Use `admin@ecommerce.com` / `admin123`
2. **Login as User**: Use any of the sample user emails with `password123`
3. **Browse Products**: All categories and products will be available
4. **Test Cart**: Sample carts are already created for users
5. **View Orders**: Sample orders with different statuses are available

## API Endpoints to Test

- `GET /api/categories` - View all categories
- `GET /api/products` - View all products
- `GET /api/products/search?q=iPhone` - Search products
- `POST /api/auth/login` - Login with sample users
- `GET /api/cart` - View user carts (requires authentication)
- `GET /api/orders` - View user orders (requires authentication)

Enjoy testing your e-commerce API! 🚀