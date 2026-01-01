import { Router } from 'express';
import { prisma } from '@repo/db/prisma';
import { authenticateAdmin, requirePermission } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

// Get dashboard statistics
router.get('/stats', requirePermission('VIEW_DASHBOARD'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalProperties,
      activeProperties,
      pendingVerifications,
      verifiedProperties,
      totalContacts,
      todayContacts,
      weeklyUsers,
      monthlyRevenue
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { deletedAt: null }
      }),
      
      // Total owners
      prisma.owner.count({
        where: { deletedAt: null }
      }),
      
      // Total properties
      prisma.property.count({
        where: { ownerDeleted: false }
      }),
      
      // Active properties
      prisma.property.count({
        where: {
          ownerDeleted: false,
          isAvailable: true,
          isDraft: false
        }
      }),
      
      // Pending verifications
      prisma.property.count({
        where: {
          ownerDeleted: false,
          verificationStatus: {
            in: ['PENDING_PAYMENT', 'PENDING_VERIFICATION']
          }
        }
      }),
      
      // Verified properties
      prisma.property.count({
        where: {
          ownerDeleted: false,
          verificationStatus: 'VERIFIED'
        }
      }),
      
      // Total contacts
      prisma.contact.count(),
      
      // Today's contacts
      prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Weekly new users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          deletedAt: null
        }
      }),
      
      // Monthly verification revenue (placeholder - implement based on your pricing)
      prisma.verificationPayment.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          },
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }).then(result => result._sum.amount || 0)
    ]);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          weekly: weeklyUsers
        },
        owners: {
          total: totalOwners
        },
        properties: {
          total: totalProperties,
          active: activeProperties,
          pendingVerification: pendingVerifications,
          verified: verifiedProperties
        },
        contacts: {
          total: totalContacts,
          today: todayContacts
        },
        revenue: {
          monthly: monthlyRevenue
        }
      }
    });

  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities
router.get('/activities', requirePermission('VIEW_DASHBOARD'), async (req, res) => {
  try {
    const [recentProperties, recentContacts, recentUsers] = await Promise.all([
      // Recent properties
      prisma.property.findMany({
        where: { ownerDeleted: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          city: true,
          propertyType: true,
          createdAt: true,
          owner: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      
      // Recent contacts
      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              title: true,
              city: true
            }
          }
        }
      }),
      
      // Recent users
      prisma.user.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isVerified: true,
          createdAt: true
        }
      })
    ]);

    res.json({
      activities: {
        properties: recentProperties.map(prop => ({
          id: prop.id,
          title: prop.title,
          location: prop.city,
          type: prop.propertyType,
          ownerName: `${prop.owner.firstName} ${prop.owner.lastName}`,
          createdAt: prop.createdAt
        })),
        contacts: recentContacts.map(contact => ({
          id: contact.id,
          userName: contact.userName,
          userPhone: contact.userPhone,
          propertyTitle: contact.property.title,
          propertyLocation: contact.property.city,
          createdAt: contact.createdAt
        })),
        users: recentUsers.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }))
      }
    });

  } catch (error: any) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;