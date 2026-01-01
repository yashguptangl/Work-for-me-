import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '@repo/db/prisma';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

// Input validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

// Admin Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Rate limiting for login attempts
    const recentAttempts = await prisma.adminLoginAttempt.count({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        }
      }
    });

    if (recentAttempts >= 5) {
      return res.status(429).json({
        error: 'Too many login attempts. Please try again in 15 minutes.'
      });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { 
        email,
        isActive: true,
        deletedAt: null 
      },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        permissions: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!admin) {
      // Log failed attempt
      await prisma.adminLoginAttempt.create({
        data: { email, success: false }
      });

      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      // Log failed attempt
      await prisma.adminLoginAttempt.create({
        data: { email, success: false }
      });

      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT with limited lifetime
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { 
        expiresIn: '8h', // Token expires in 8 hours
        issuer: 'roomsdekho-admin',
        audience: 'admin-panel'
      }
    );

    // Update last login
    await Promise.all([
      prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() }
      }),
      // Log successful attempt
      prisma.adminLoginAttempt.create({
        data: { email, success: true }
      }),
      // Clean old login attempts
      prisma.adminLoginAttempt.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Older than 24 hours
          }
        }
      })
    ]);

    // Return token and minimal admin info
    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: `${admin.firstName} ${admin.lastName}`,
        permissions: admin.permissions,
        lastLogin: admin.lastLoginAt
      }
    });

  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Refresh Token
router.post('/refresh', authenticateAdmin, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { 
        id: req.admin!.adminId,
        isActive: true 
      },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true
      }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    const newToken = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { 
        expiresIn: '8h',
        issuer: 'roomsdekho-admin',
        audience: 'admin-panel'
      }
    );

    res.json({ token: newToken });

  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (Optional: Token blacklisting)
router.post('/logout', authenticateAdmin, async (req, res) => {
  try {
    // You can implement token blacklisting here if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Current Admin Profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ admin });

  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;