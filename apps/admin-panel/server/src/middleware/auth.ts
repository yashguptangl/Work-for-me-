import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, AdminRole } from '@repo/db';

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: AdminRole;
    permissions?: any;
  };
}

export const authenticateAdmin = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: AdminRole;
    };

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      include: {
        permissions: true,
      },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive admin account' });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireMainAdmin = (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.admin?.role !== 'MAIN_ADMIN') {
    return res.status(403).json({ error: 'Only Main Admin can perform this action' });
  }
  next();
};

export const checkPermission = (permission: string) => {
  return (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    // Main admin has all permissions
    if (req.admin?.role === 'MAIN_ADMIN') {
      return next();
    }

    // Check employee permissions
    const permissions = req.admin?.permissions;
    if (!permissions || !permissions[permission]) {
      return res.status(403).json({ 
        error: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

// Log admin activity
export const logActivity = async (
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) => {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        details,
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
