# Admin Panel - Rooms Dekho

A comprehensive admin panel for managing the Rooms Dekho real estate platform, featuring role-based access control, property verification, and complete management capabilities.

## Features

### Main Admin Features
- **Full Dashboard Access**: View complete statistics of users, owners, properties, and verifications
- **User Management**: View, edit, and delete users
- **Owner Management**: View, edit, and delete property owners
- **Property Management**: 
  - View all properties with S3 image support
  - Edit property details
  - Verify or reject properties
  - View property verification history
- **Verification Handling**:
  - Review verification requests
  - Approve or reject verifications with notes
  - Set 3-month verification validity
  - Payment requires resubmission if rejected
- **Employee Management**:
  - Create employee accounts
  - Assign granular permissions
  - Monitor employee activity
  - Deactivate/activate employees

### Employee Features (Permission-Based)
- **Limited Access**: Based on permissions assigned by Main Admin
- **Available Permissions**:
  - `canViewUsers`: View user list and details
  - `canViewOwners`: View owner list and details
  - `canViewProperties`: View property listings
  - `canEditProperties`: Edit property information
  - `canVerifyProperties`: Review and verify properties
  - `canHandleUsers`: Edit/delete users
  - `canHandleOwners`: Edit/delete owners
  - `canViewReports`: Access reports and analytics

## Project Structure

```
apps/admin-panel/
├── server/                 # Backend API
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   │   ├── admin.auth.controllers.ts
│   │   │   ├── admin.dashboard.controllers.ts
│   │   │   ├── admin.users.controllers.ts
│   │   │   ├── admin.owners.controllers.ts
│   │   │   ├── admin.properties.controllers.ts
│   │   │   ├── admin.verifications.controllers.ts
│   │   │   └── admin.employees.controllers.ts
│   │   ├── middleware/
│   │   │   └── auth.ts    # Authentication & authorization
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── client/                # Frontend (Next.js)
    ├── src/
    │   ├── app/
    │   │   ├── login/     # Login page
    │   │   └── dashboard/ # Admin dashboard
    │   │       ├── page.tsx           # Dashboard home
    │   │       ├── layout.tsx         # Dashboard layout
    │   │       ├── properties/        # Properties management
    │   │       ├── verifications/     # Verification requests
    │   │       ├── users/             # User management
    │   │       ├── owners/            # Owner management
    │   │       └── employees/         # Employee management
    │   ├── lib/
    │   │   └── api.ts     # API client
    │   └── store/
    │       └── authStore.ts # Authentication state
    ├── package.json
    ├── tsconfig.json
    └── .env.local
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- AWS S3 bucket configured
- Prisma setup completed

### 1. Update Database Schema

The Prisma schema has been updated with admin models. Run migrations:

```bash
cd packages/prisma
npx prisma migrate dev --name add_admin_models
npx prisma generate
```

### 2. Create First Main Admin

Create a seed script or use Prisma Studio to create the first main admin:

```typescript
// Run this in Prisma Studio or create a seed script
await prisma.admin.create({
  data: {
    email: "admin@roomsdekho.com",
    password: await bcrypt.hash("secure_password", 10),
    firstName: "Main",
    lastName: "Admin",
    phone: "1234567890",
    role: "MAIN_ADMIN",
    isActive: true,
  },
});
```

### 3. Backend Setup

```bash
cd apps/admin-panel/server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# - DATABASE_URL
# - JWT_SECRET
# - AWS credentials
# - PORT (default: 5001)

# Start development server
npm run dev
```

Backend will run on `http://localhost:5001`

### 4. Frontend Setup

```bash
cd apps/admin-panel/client

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3001`

### 5. Run Both Together

From the `admin-panel` directory:

```bash
npm install
npm run dev
```

This will run both backend and frontend concurrently.

## API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/profile` - Get admin profile
- `POST /api/admin/auth/change-password` - Change password
- `POST /api/admin/auth/create-admin` - Create admin (Main Admin only)

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/recent-users` - Get recent users
- `GET /api/admin/dashboard/recent-properties` - Get recent properties

### Users
- `GET /api/admin/users` - List all users (with pagination & filters)
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Owners
- `GET /api/admin/owners` - List all owners
- `GET /api/admin/owners/:id` - Get owner details
- `PUT /api/admin/owners/:id` - Update owner
- `DELETE /api/admin/owners/:id` - Delete owner

### Properties
- `GET /api/admin/properties` - List all properties
- `GET /api/admin/properties/stats` - Get property statistics
- `GET /api/admin/properties/:id` - Get property details (with S3 URLs)
- `PUT /api/admin/properties/:id` - Update property
- `POST /api/admin/properties/:id/verify` - Verify/reject property
- `DELETE /api/admin/properties/:id` - Delete property

### Verifications
- `GET /api/admin/verifications` - List verification requests
- `GET /api/admin/verifications/stats` - Get verification statistics
- `GET /api/admin/verifications/:id` - Get verification details
- `POST /api/admin/verifications/:id/assign` - Assign to employee (Main Admin)
- `POST /api/admin/verifications/:id/review` - Approve/reject verification

### Employees
- `GET /api/admin/employees` - List all employees (Main Admin only)
- `GET /api/admin/employees/:id` - Get employee details
- `POST /api/admin/employees` - Create employee
- `PUT /api/admin/employees/:id` - Update employee
- `PUT /api/admin/employees/:id/permissions` - Update permissions
- `DELETE /api/admin/employees/:id` - Delete employee

## Permission System

### Main Admin
- Has access to ALL features
- Can create and manage employees
- Can assign permissions to employees
- Can override all permissions

### Employee Permissions
Employees only have access to features they're explicitly granted:

1. **canViewUsers**: View user list and details
2. **canHandleUsers**: Edit/delete users
3. **canViewOwners**: View owner list and details
4. **canHandleOwners**: Edit/delete owners
5. **canViewProperties**: View property listings
6. **canEditProperties**: Edit property details
7. **canVerifyProperties**: Review and verify properties
8. **canViewReports**: Access analytics and reports
9. **canViewDashboard**: Always enabled for employees

## Verification Workflow

1. **Owner Submits Request**: Owner initiates verification and pays ₹149
2. **Payment Completed**: Status changes to `PAYMENT_COMPLETED`
3. **Main Admin Assignment**: Main Admin assigns request to employee
4. **Under Review**: Employee reviews property and photos
5. **Approval/Rejection**:
   - **Approved**: Property verified for 3 months, owner can list
   - **Rejected**: Owner must fix issues and pay again for re-verification
6. **Expiry**: After 3 months, verification expires and renewal needed

## Activity Logging

All admin actions are logged:
- Property verifications
- User/owner modifications
- Property edits
- Employee management
- View actions

Logs include:
- Admin who performed action
- Action type
- Entity affected
- Timestamp
- Additional details

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Password hashing with bcrypt
- Activity logging for audit trail
- Session management
- Token expiration

## Environment Variables

### Backend (.env)
```env
PORT=5001
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Deployment

### Backend Deployment
1. Build the server: `npm run build`
2. Set environment variables
3. Run: `npm start`

### Frontend Deployment
1. Build: `npm run build`
2. Deploy to Vercel/Netlify or run: `npm start`

### Database
Run migrations in production:
```bash
npx prisma migrate deploy
```

## Usage Examples

### Login as Main Admin
1. Navigate to `http://localhost:3001/login`
2. Enter main admin credentials
3. Access full dashboard

### Create Employee
1. Login as Main Admin
2. Go to "Employees" section
3. Click "Add Employee"
4. Fill in details and select permissions
5. Employee receives login credentials

### Verify Property
1. Go to "Verifications" section
2. Click on verification request
3. Review property details and photos
4. Add verification notes
5. Approve or Reject
6. Property status updates automatically

### Edit Property
1. Go to "Properties" section
2. Click on property to view details
3. Click "Edit Property"
4. Modify details
5. Save changes

## Troubleshooting

### Cannot login
- Check JWT_SECRET is set
- Verify database connection
- Check admin account exists and isActive=true

### Images not loading
- Verify AWS credentials
- Check S3 bucket permissions
- Ensure presigned URLs are being generated

### Permission denied
- Check employee permissions in database
- Verify JWT token is valid
- Check role assignment

## Support

For issues or questions:
1. Check logs in terminal
2. Verify environment variables
3. Check database connectivity
4. Review permission settings

## Future Enhancements

- [ ] Email notifications for verification status
- [ ] Advanced analytics and reports
- [ ] Bulk operations
- [ ] Export data to CSV/Excel
- [ ] Mobile app for employees
- [ ] Real-time notifications
- [ ] Chat support integration
