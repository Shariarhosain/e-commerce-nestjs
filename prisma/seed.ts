import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in correct order to avoid foreign key constraints)
  console.log('🧹 Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👑 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ecommerce.com',
      username: 'admin',
      name: 'System Administrator',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create sample users
  console.log('👥 Creating sample users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        username: 'johndoe',
        name: 'John Doe',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        name: 'Jane Smith',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@example.com',
        username: 'bobwilson',
        name: 'Bob Wilson',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.USER,
      },
    }),
  ]);

  // Create categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'Latest electronic devices and gadgets',
        slug: 'electronics',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Clothing',
        description: 'Fashion and apparel for all ages',
        slug: 'clothing',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        slug: 'home-garden',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear',
        slug: 'sports-outdoors',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Books',
        description: 'Books, magazines, and educational materials',
        slug: 'books',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Health & Beauty',
        description: 'Health supplements and beauty products',
        slug: 'health-beauty',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Toys & Games',
        description: 'Toys, games, and entertainment for kids',
        slug: 'toys-games',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Automotive',
        description: 'Car accessories and automotive parts',
        slug: 'automotive',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Kitchen & Dining',
        description: 'Kitchen appliances and dining essentials',
        slug: 'kitchen-dining',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Office Supplies',
        description: 'Office equipment and stationery',
        slug: 'office-supplies',
      },
    }),
  ]);

  // Create products
  console.log('📦 Creating products...');
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro Max',
        description: 'Latest Apple iPhone with Pro camera system and A17 Pro chip. Features titanium design and advanced computational photography.',
        price: 1199.99,
        stock: 50,
        categoryId: categories[0].id, // Electronics
        slug: 'iphone-15-pro-max',
        imageUrls: [ 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen, 200MP camera, and Galaxy AI features for enhanced productivity.',
        price: 1299.99,
        stock: 35,
        categoryId: categories[0].id, // Electronics
        slug: 'samsung-galaxy-s24-ultra',
        imageUrls: [ 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16-inch',
        description: 'Professional laptop with M3 Pro chip, stunning Liquid Retina XDR display, and up to 22 hours of battery life.',
        price: 2499.99,
        stock: 25,
        categoryId: categories[0].id, // Electronics
        slug: 'macbook-pro-16-inch',
        imageUrls: [ 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
      },
    }),

    // Clothing
    prisma.product.create({
      data: {
        name: 'Premium Cotton T-Shirt',
        description: 'Comfortable 100% organic cotton t-shirt with modern fit. Perfect for casual wear and everyday comfort.',
        price: 29.99,
        stock: 100,
        categoryId: categories[1].id, // Clothing
        slug: 'premium-cotton-t-shirt',
        imageUrls: [ 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Designer Jeans',
        description: 'High-quality denim jeans with perfect fit and premium finishing. Available in multiple sizes and washes.',
        price: 89.99,
        stock: 75,
        categoryId: categories[1].id, // Clothing
        slug: 'designer-jeans',
        imageUrls: [ 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Winter Jacket',
        description: 'Warm and stylish winter jacket with waterproof exterior and insulated interior. Perfect for cold weather.',
        price: 149.99,
        stock: 40,
        categoryId: categories[1].id, // Clothing
        slug: 'winter-jacket',
        imageUrls: [ 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
      },
    }),

    // Home & Garden
    prisma.product.create({
      data: {
        name: 'Smart Home Security Camera',
        description: 'WiFi-enabled security camera with night vision, motion detection, and mobile app control.',
        price: 199.99,
        stock: 60,
        categoryId: categories[2].id, // Home & Garden
        slug: 'smart-home-security-camera',
        imageUrls: [ 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Garden Tool Set',
        description: 'Complete 10-piece garden tool set with ergonomic handles and rust-resistant coating.',
        price: 79.99,
        stock: 45,
        categoryId: categories[2].id, // Home & Garden
        slug: 'garden-tool-set',
        imageUrls: [ 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500'],
      },
    }),

    // Sports & Outdoors
    prisma.product.create({
      data: {
        name: 'Professional Basketball',
        description: 'Official size and weight basketball with superior grip and durability for indoor and outdoor play.',
        price: 49.99,
        stock: 80,
        categoryId: categories[3].id, // Sports & Outdoors
        slug: 'professional-basketball',
        imageUrls: [ 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Hiking Backpack',
        description: '40L hiking backpack with multiple compartments, hydration system compatibility, and weather protection.',
        price: 129.99,
        stock: 30,
        categoryId: categories[3].id, // Sports & Outdoors
        slug: 'hiking-backpack',
        imageUrls: [ 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
      },
    }),

    // Books
    prisma.product.create({
      data: {
        name: 'The Psychology of Programming',
        description: 'Essential book for software developers covering cognitive aspects of programming and team dynamics.',
        price: 39.99,
        stock: 120,
        categoryId: categories[4].id, // Books
        slug: 'psychology-of-programming',
        imageUrls: [ 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'],
      },
    }),

    // Health & Beauty
    prisma.product.create({
      data: {
        name: 'Vitamin D3 Supplements',
        description: 'High-potency Vitamin D3 supplements for immune support and bone health. 60 capsules per bottle.',
        price: 24.99,
        stock: 200,
        categoryId: categories[5].id, // Health & Beauty
        slug: 'vitamin-d3-supplements',
        imageUrls: [ 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500'],
      },
    }),

    // Toys & Games
    prisma.product.create({
      data: {
        name: 'Educational Building Blocks',
        description: 'STEM learning building blocks set with 200+ pieces for creative construction and learning.',
        price: 59.99,
        stock: 85,
        categoryId: categories[6].id, // Toys & Games
        slug: 'educational-building-blocks',
        imageUrls: [ 'https://images.unsplash.com/photo-1558877385-1c91f703ed88?w=500'],
      },
    }),

    // Kitchen & Dining
    prisma.product.create({
      data: {
        name: 'Stainless Steel Cookware Set',
        description: 'Professional 12-piece stainless steel cookware set with tri-ply construction and heat-resistant handles.',
        price: 299.99,
        stock: 25,
        categoryId: categories[8].id, // Kitchen & Dining
        slug: 'stainless-steel-cookware-set',
        imageUrls: [ 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'],
      },
    }),

    // Office Supplies
    prisma.product.create({
      data: {
        name: 'Ergonomic Office Chair',
        description: 'Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh back.',
        price: 399.99,
        stock: 20,
        categoryId: categories[9].id, // Office Supplies
        slug: 'ergonomic-office-chair',
        imageUrls: [ 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'],
      },
    }),
  ]);

  // Create sample carts for users
  console.log('🛒 Creating sample carts...');
  const userCarts = await Promise.all([
    prisma.cart.create({
      data: {
        userId: users[0].id,
        cartItems: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
            },
            {
              productId: products[3].id,
              quantity: 2,
            },
          ],
        },
      },
    }),
    prisma.cart.create({
      data: {
        userId: users[1].id,
        cartItems: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
            },
            {
              productId: products[7].id,
              quantity: 1,
            },
          ],
        },
      },
    }),
  ]);

  // Create sample orders
  console.log('📋 Creating sample orders...');
  const sampleOrders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        totalAmount: 1259.97,
        status: 'PENDING',
        shippingAddress: '123 Main St, New York, NY 10001',
        phoneNumber: '+1-555-0123',
        notes: 'Please deliver after 5 PM',
        orderItems: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: 1199.99,
            },
            {
              productId: products[3].id,
              quantity: 2,
              price: 29.99,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        totalAmount: 1499.98,
        status: 'APPROVED',
        shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
        phoneNumber: '+1-555-0456',
        notes: 'Fragile items - handle with care',
        orderItems: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: 1299.99,
            },
            {
              productId: products[7].id,
              quantity: 1,
              price: 199.99,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[2].id,
        totalAmount: 179.98,
        status: 'DELIVERED',
        shippingAddress: '789 Pine St, Chicago, IL 60614',
        phoneNumber: '+1-555-0789',
        orderItems: {
          create: [
            {
              productId: products[5].id,
              quantity: 1,
              price: 149.99,
            },
            {
              productId: products[3].id,
              quantity: 1,
              price: 29.99,
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Seeded Data Summary:');
  console.log(`👑 Admin User: admin@ecommerce.com (password: admin123)`);
  console.log(`👥 Sample Users: ${users.length}`);
  console.log(`📂 Categories: ${categories.length}`);
  console.log(`📦 Products: ${products.length}`);
  console.log(`🛒 Sample Carts: ${userCarts.length}`);
  console.log(`📋 Sample Orders: ${sampleOrders.length}`);
  console.log('\n🚀 You can now start using the application with sample data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
