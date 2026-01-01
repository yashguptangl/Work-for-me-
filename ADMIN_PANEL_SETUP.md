# 🔐 Admin Panel - Complete Setup Guide

Your admin panel is now completely separated from the main application!

## 📁 Directory Structure

```
apps/
├── admin-web/          # Admin Panel Frontend (Port 4000)
├── admin-server/       # Admin Panel Backend (Port 4001)
├── web/                # Main Website Frontend (Port 3000)
└── http-server/        # Main Website Backend (Port 3001)
```

## 🚀 Quick Start

### 1. Setup Admin Backend

```bash
cd apps/admin-server

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your database URL

# Build the project
npm run build

# Create main admin account
npx ts-node src/scripts/createAdmin.ts

# Start server
npm run dev
```

**Admin Backend will run on:** `http://localhost:4001`

### 2. Setup Admin Frontend

```bash
cd apps/admin-web

# Install dependencies
npm install

# Start development server
npm run dev
```

**Admin Frontend will run on:** `http://localhost:4000`

## 🔑 Default Admin Credentials

```
URL: http://localhost:4000/login
Email: admin@roomsdekho.com
Password: Admin@123
```

**⚠️ CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

## 📊 Admin Panel Features

### Dashboard
- ✅ Real-time statistics (Users, Owners, Properties)
- ✅ Pending verifications count
- ✅ Quick action cards

### User Management
- ✅ View all registered users
- ✅ User details with pagination
- ✅ Delete users

### Owner Management
- ✅ View all property owners
- ✅ Owner details with property count
- ✅ Delete owners

### Property Management
- ✅ View all properties
- ✅ Filter by status (Active, Draft, Verified)
- ✅ Property details
- ✅ Delete properties

### Verification System
- ✅ View pending verification requests
- ✅ Approve/Reject verifications
- ✅ Add review notes
- ✅ Set 1-year verification validity

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (MAIN_ADMIN, EMPLOYEE)
- Secure HTTP-only cookies
- Protected API routes
- Admin-only middleware

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15
- **UI:** React 19 + Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Language:** TypeScript

### Backend
- **Framework:** Express.js
- **Database:** Prisma ORM
- **Authentication:** JWT + Bcrypt
- **Language:** TypeScript

## 📦 Production Deployment

### Build Admin Frontend
```bash
cd apps/admin-web
npm run build
npm start
```

### Build Admin Backend
```bash
cd apps/admin-server
npm run build
npm start
```

## 🔐 Environment Variables

### Admin Frontend (`.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1
```

### Admin Backend (`.env`)
```env
PORT=4001
JWT_SECRET=your_super_secure_secret_key_here
DATABASE_URL=postgresql://user:pass@host:5432/database
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/admin/login` - Login
- `GET /api/v1/admin/profile` - Get profile

### Dashboard
- `GET /api/v1/admin/stats` - Statistics

### Management
- `GET /api/v1/admin/users` - All users
- `GET /api/v1/admin/owners` - All owners
- `GET /api/v1/admin/properties` - All properties
- `GET /api/v1/admin/verifications` - Verification requests
- `POST /api/v1/admin/verifications/:id/approve` - Approve
- `POST /api/v1/admin/verifications/:id/reject` - Reject
- `DELETE /api/v1/admin/users/:id` - Delete user
- `DELETE /api/v1/admin/owners/:id` - Delete owner
- `DELETE /api/v1/admin/properties/:id` - Delete property

## 🎯 Next Steps

1. ✅ Install dependencies for both admin apps
2. ✅ Configure environment variables
3. ✅ Create admin account
4. ✅ Start both servers
5. ✅ Login to admin panel
6. ✅ Change default password
7. ✅ Start managing your platform!

## 🔄 Connecting to Main Database

The admin backend uses the same Prisma schema as your main application. Update the `DATABASE_URL` in `apps/admin-server/.env` to point to your main database.

## 🚨 Important Notes

- Admin panel runs on **separate ports** (4000, 4001)
- **Completely isolated** from main website
- **Secure by default** - no public access
- **Role-based permissions** for team management
- **Production-ready** architecture

---

**🎉 Your admin panel is ready! Access it at http://localhost:4000**