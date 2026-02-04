import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '@repo/db';
import adminAuthRoutes from './routes/admin.auth';
import adminDashboardRoutes from './routes/admin.dashboard';
import adminUsersRoutes from './routes/admin.users';
import adminOwnersRoutes from './routes/admin.owners';
import adminPropertiesRoutes from './routes/admin.properties';
import adminVerificationsRoutes from './routes/admin.verifications';
import adminRentAgreementsRoutes from './routes/admin.rent.agreements';
import adminEmployeesRoutes from './routes/admin.employees';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Admin Panel API is running' });
});

// Test endpoints to verify database connection
app.get('/api/test/db', async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const ownerCount = await prisma.owner.count();
    const propertyCount = await prisma.property.count();
    res.json({ 
      success: true, 
      counts: { users: userCount, owners: ownerCount, properties: propertyCount }
    });
  } catch (error: any) {
    console.error('❌ Database test error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({ take: 5 });
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    console.error('❌ Users test error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/owners', async (req: Request, res: Response) => {
  try {
    const owners = await prisma.owner.findMany({ take: 5 });
    res.json({ success: true, count: owners.length, owners });
  } catch (error: any) {
    console.error('❌ Owners test error:', error);
    res.status(500).json({ error: error.message });
  }
});



// Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/owners', adminOwnersRoutes);
app.use('/api/admin/properties', adminPropertiesRoutes);
app.use('/api/admin/verifications', adminVerificationsRoutes);
app.use('/api/admin/rent-agreements', adminRentAgreementsRoutes);
app.use('/api/admin/employees', adminEmployeesRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Admin Panel Server running on port ${PORT}`);
});
