import { Response } from 'express';
import { prisma } from '@repo/db';
import { AdminAuthRequest, logActivity } from '../middleware/auth';

export const getAllUsers = async (req: AdminAuthRequest, res: Response) => {
  try {
    console.log('🔍 getAllUsers called with query:', req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const verified = req.query.verified as string;

    const where: any = {};
    console.log('📊 Building where clause:', where);

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (verified && verified !== '') {
      where.isVerified = verified === 'true';
    }

    console.log('📝 Final where clause:', JSON.stringify(where, null, 2));

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
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
          updatedAt: true,
          _count: {
            select: {
              wishlist: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    console.log(`✅ Found ${total} users, returning ${users.length} users`);

    await logActivity(
      req.admin!.id,
      'VIEWED_USERS',
      'USER',
      undefined,
      `Viewed users list (page ${page})`
    );

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wishlist: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                city: true,
                propertyType: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logActivity(
      req.admin!.id,
      'VIEWED_USER_DETAILS',
      'USER',
      id,
      `Viewed details of user: ${user.email}`
    );

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified, role } = req.body;

    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (role) updateData.role = role;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await logActivity(
      req.admin!.id,
      'UPDATED_USER',
      'USER',
      id,
      `Updated user: ${user.email}`
    );

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    await logActivity(
      req.admin!.id,
      'DELETED_USER',
      'USER',
      id,
      `Deleted user: ${user.email}`
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
