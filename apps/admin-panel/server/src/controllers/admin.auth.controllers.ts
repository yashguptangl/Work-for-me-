import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/db';
import { z } from 'zod';
import { AdminAuthRequest } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  role: z.enum(['MAIN_ADMIN', 'EMPLOYEE']).optional(),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: { email },
      include: { permissions: true },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const jwtPayload = { id: admin.id, email: admin.email, role: admin.role };
    const jwtSecret = process.env.JWT_SECRET || '';
    const jwtOptions: jwt.SignOptions = { expiresIn: '7d' };
    const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Login failed' });
  }
};

export const createAdmin = async (req: AdminAuthRequest, res: Response) => {
  try {
    const data = createAdminSchema.parse(req.body);

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const admin = await prisma.admin.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || 'EMPLOYEE',
        assignedBy: req.admin?.id,
      },
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

export const getProfile = async (req: AdminAuthRequest, res: Response) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        permissions: true,
      },
    });

    res.json({ admin });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const changePassword = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Invalid password data' });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.id },
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, admin!.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: req.admin!.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
