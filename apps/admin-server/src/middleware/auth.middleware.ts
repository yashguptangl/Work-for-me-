import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/db/prisma';

interface AdminPayload {
  adminId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    
    // Verify admin still exists and is active
    const admin = await prisma.admin.findUnique({
      where: { 
        id: decoded.adminId,
        isActive: true,
        deletedAt: null 
      },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        lastLoginAt: true,
        isActive: true
      }
    });

    if (!admin) {
      return res.status(401).json({ 
        error: 'Invalid token. Admin not found or inactive.' 
      });
    }

    req.admin = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role as AdminPayload['role'],
      permissions: admin.permissions
    };

    next();
  } catch (error: any) {
    console.error('Admin auth error:', error.message);
    return res.status(401).json({ 
      error: 'Invalid token.' 
    });
  }
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.admin.role === 'SUPER_ADMIN' || req.admin.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Insufficient permissions' 
    });
  };
};

export const requireRole = (roles: AdminPayload['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (roles.includes(req.admin.role)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Insufficient role permissions' 
    });
  };
};