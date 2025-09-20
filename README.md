# E-Commerce NestJS API Documentation

## Overview

This is a comprehensive RESTful API for e-commerce built with NestJS, Prisma, and PostgreSQL. It features a complete authentication system with JWT tokens, email verification, and protected endpoints.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- SMTP email service (Gmail recommended for development)

### Installation
```bash
npm install
```

### Environment Setup
Configure your `.env` file with the following variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"

# Application
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3000"
```

### Database Setup
```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Start the Application
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## 📚 API Documentation

### Swagger UI
Access the interactive API documentation at: **http://localhost:3000/api-docs**

The Swagger UI provides:
- 📋 Complete endpoint documentation
- 🔐 JWT Bearer token authentication
- 🧪 Interactive API testing
- 📝 Request/response examples
- ✅ Input validation schemas

### Base URL
```
http://localhost:3000
```

## 🔐 Authentication Flow

### 1. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Description**: Create a new user account
- **Email**: Sends 6-digit verification code via email
- **Returns**: Temporary verification token

### 2. Email Verification
- **Endpoint**: `POST /api/auth/verify-email`
- **Description**: Verify email with 6-digit code
- **Returns**: Access token + Refresh token

### 3. User Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticate with email/password
- **Requirement**: Email must be verified
- **Returns**: Access token + Refresh token

### 4. Token Management
- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days
- **Refresh Endpoint**: `POST /api/auth/refresh`

## 🛡️ Protected Endpoints

All `/users` endpoints require JWT Bearer authentication:

```http
Authorization: Bearer <your-jwt-token>
```

### Available User Endpoints:
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 📋 API Endpoints Summary

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/verify-email` | Verify email with code | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/refresh` | Refresh tokens | ❌ |
| POST | `/api/auth/forgot-password` | Request password reset | ❌ |
| POST | `/api/auth/reset-password` | Reset password | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| GET | `/api/auth/profile` | Get user profile | ✅ |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | ✅ |
| POST | `/users` | Create user | ✅ |
| GET | `/users/:id` | Get user by ID | ✅ |
| PATCH | `/users/:id` | Update user | ✅ |
| DELETE | `/users/:id` | Delete user | ✅ |

## 🧪 Testing Examples

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john.doe@example.com",
    "username": "johndoe",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/auth/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds of 12
- **JWT Security**: Separate access and refresh tokens
- **Email Verification**: Required before login
- **Input Validation**: Comprehensive DTOs with class-validator
- **Rate Limiting**: Can be configured (recommended for production)
- **CORS**: Enabled for development

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (email not verified) |
| 404 | Not Found |
| 409 | Conflict (email/username exists) |
| 500 | Internal Server Error |

## 🏗️ Architecture

### Domain-Driven Design (DDD)
```
src/
├── auth/                   # Authentication Domain
│   ├── dto/               # Data Transfer Objects
│   ├── guards/            # Authentication Guards
│   ├── strategies/        # Passport Strategies
│   ├── auth.controller.ts # API Endpoints
│   ├── auth.service.ts    # Business Logic
│   ├── auth.module.ts     # Module Configuration
│   └── email.service.ts   # Email Service
├── users/                 # User Management Domain
├── prisma/               # Database Layer
└── main.ts               # Application Bootstrap
```

### Key Components
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and data processing
- **DTOs**: Data validation and transformation
- **Guards**: Authentication and authorization
- **Strategies**: Passport authentication strategies

---

For more detailed API documentation, visit the **Swagger UI** at http://localhost:3000/api-docs when the server is running.
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
