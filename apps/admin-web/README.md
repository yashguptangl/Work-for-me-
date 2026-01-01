# Admin Panel - Frontend

Admin dashboard for Roomlocate platform management.

## Features

- 🔐 Secure admin authentication
- 📊 Dashboard with real-time statistics
- 👥 User management
- 🏠 Property management  
- 🏢 Owner management
- ✅ Property verification system
- 🛡️ Role-based access control

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1
```

3. Run development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:4000`

## Default Admin Credentials

```
Email: admin@roomsdekho.com
Password: Admin@123
```

**⚠️ IMPORTANT: Change these credentials after first login!**

## Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Sonner (Toast notifications)
- Lucide Icons