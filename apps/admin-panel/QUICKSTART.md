# Admin Panel Setup - Quick Start Guide

## Quick Setup (5 minutes)

### 1. Database Migration
```bash
cd packages/prisma
npx prisma migrate dev --name add_admin_models
npx prisma generate
```

### 2. Create First Admin Account

Option A - Using Prisma Studio:
```bash
npx prisma studio
```
Then create an Admin record manually.

Option B - Using seed script:
```bash
# Create packages/prisma/src/seedAdmin.ts
npm run seed:admin
```

### 3. Start Backend
```bash
cd apps/admin-panel/server
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

### 4. Start Frontend
```bash
cd apps/admin-panel/client
npm install
npm run dev
```

### 5. Login
Open `http://localhost:3001/login` and use your admin credentials.

## Default Admin Credentials (for development)

**⚠️ Change these in production!**

Email: `admin@roomsdekho.com`
Password: `admin123`

## Main Features at a Glance

### Main Admin Can:
- ✅ View all users, owners, and properties
- ✅ Verify or reject properties
- ✅ Edit property details
- ✅ Create and manage employees
- ✅ Assign granular permissions
- ✅ View complete analytics

### Employees Can (based on permissions):
- 👁️ View data (users/owners/properties)
- ✏️ Edit properties
- ✅ Verify properties
- 🔧 Handle user/owner management

## Verification Flow

1. Owner pays ₹149 → 
2. Request appears in admin panel → 
3. Admin/Employee reviews → 
4. Approve (3 months validity) OR Reject (payment required again)

## Common Commands

```bash
# Run both frontend and backend
cd apps/admin-panel
npm run dev

# Backend only
cd apps/admin-panel/server
npm run dev

# Frontend only
cd apps/admin-panel/client
npm run dev

# Database operations
cd packages/prisma
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Run migrations
npx prisma generate        # Generate client
```

## Ports

- Backend API: `http://localhost:5001`
- Frontend UI: `http://localhost:3001`
- Main App: `http://localhost:3000`

## Need Help?

Check the full [README.md](./README.md) for detailed documentation.
