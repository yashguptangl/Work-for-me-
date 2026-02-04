import { Response } from 'express';
import { prisma } from '@repo/db';
import { AdminAuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AdminAuthRequest, res: Response) => {
  try {
    // Get total counts
    const [
      totalUsers,
      totalOwners,
      totalProperties,
      verifiedProperties,
      notVerifiedProperties,
      pendingVerifications,
      totalContacts,
      activeEmployees,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.owner.count(),
      prisma.property.count(),
      prisma.property.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.property.count({ where: { verificationStatus: 'NOT_VERIFIED' } }),
      prisma.verificationRequest.count({ 
        where: { status: { in: ['UNDER_REVIEW', 'PAYMENT_COMPLETED'] } } 
      }),
      prisma.contact.count(),
      prisma.admin.count({ where: { role: 'EMPLOYEE', isActive: true } }),
    ]);

    // Get recent activities
    const recentActivities = await prisma.adminActivityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get verification requests by status
    const verificationStats = await prisma.verificationRequest.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get properties by city
    const propertiesByCity = await prisma.property.groupBy({
      by: ['city'],
      _count: true,
      orderBy: {
        _count: {
          city: 'desc',
        },
      },
      take: 10,
    });

    // Get monthly growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUsers = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      _count: true,
    });

    const monthlyProperties = await prisma.property.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      _count: true,
    });

    res.json({
      stats: {
        totalUsers,
        totalOwners,
        totalProperties,
        verifiedProperties,
        notVerifiedProperties,
        pendingVerifications,
        totalContacts,
        activeEmployees,
      },
      verificationStats,
      propertiesByCity,
      recentActivities,
      monthlyGrowth: {
        users: monthlyUsers,
        properties: monthlyProperties,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getRecentUsers = async (req: AdminAuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const recentUsers = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.json({ users: recentUsers });
  } catch (error) {
    console.error('Recent users error:', error);
    res.status(500).json({ error: 'Failed to fetch recent users' });
  }
};

export const getRecentProperties = async (req: AdminAuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const recentProperties = await prisma.property.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        city: true,
        propertyType: true,
        listingType: true,
        verificationStatus: true,
        isAvailable: true,
        createdAt: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ properties: recentProperties });
  } catch (error) {
    console.error('Recent properties error:', error);
    res.status(500).json({ error: 'Failed to fetch recent properties' });
  }
};
