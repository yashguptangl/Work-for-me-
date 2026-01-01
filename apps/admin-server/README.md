# Admin Panel - Backend

Express.js backend API for admin panel operations.

## Features

- 🔐 JWT-based authentication
- 📊 Dashboard statistics API
- 👥 User & Owner management APIs
- 🏠 Property management APIs
- ✅ Verification request handling
- 🛡️ Role-based access control

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=4001
JWT_SECRET=your_secret_key_here
DATABASE_URL=your_database_url
```

3. Create main admin account:
```bash
npx ts-node src/scripts/createAdmin.ts
```

4. Build and run:
```bash
npm run dev
```

Server will run on `http://localhost:4001`

## API Endpoints

### Authentication
- `POST /api/v1/admin/login` - Admin login
- `GET /api/v1/admin/profile` - Get admin profile

### Dashboard
- `GET /api/v1/admin/stats` - Get dashboard statistics

### Management
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/owners` - Get all owners
- `GET /api/v1/admin/properties` - Get all properties
- `GET /api/v1/admin/verifications` - Get verification requests
- `POST /api/v1/admin/verifications/:id/approve` - Approve verification
- `POST /api/v1/admin/verifications/:id/reject` - Reject verification

## Tech Stack

- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication
- Bcrypt password hashing