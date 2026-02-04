import { Response } from 'express';
import { prisma } from '@repo/db';
import { AdminAuthRequest, logActivity } from '../middleware/auth';

export const getAllOwners = async (req: AdminAuthRequest, res: Response) => {
  try {
    console.log('🔍 getAllOwners called with query:', req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const verified = req.query.verified as string;
    const planType = req.query.planType as string;

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

    if (verified && verified !== '') {
      where.isVerified = verified === 'true';
    }

    if (planType) {
      where.planType = planType;
    }

    console.log('📝 Final where clause:', JSON.stringify(where, null, 2));

    const [owners, total] = await Promise.all([
      prisma.owner.findMany({
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
          isVerified: true,
          planType: true,
          validity: true,
          listings: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              properties: true,
            },
          },
        },
      }),
      prisma.owner.count({ where }),
    ]);

    console.log(`✅ Found ${total} owners, returning ${owners.length} owners`);

    await logActivity(
      req.admin!.id,
      'VIEWED_OWNERS',
      'OWNER',
      undefined,
      `Viewed owners list (page ${page})`
    );

    res.json({
      owners,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get owners error:', error);
    res.status(500).json({ error: 'Failed to fetch owners' });
  }
};

export const getOwnerById = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            city: true,
            propertyType: true,
            listingType: true,
            verificationStatus: true,
            isAvailable: true,
            images: true,
            createdAt: true,
          },
        },
      },
    });

    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    await logActivity(
      req.admin!.id,
      'VIEWED_OWNER_DETAILS',
      'OWNER',
      id,
      `Viewed details of owner: ${owner.email}`
    );

    res.json({ owner });
  } catch (error) {
    console.error('Get owner error:', error);
    res.status(500).json({ error: 'Failed to fetch owner' });
  }
};

export const updateOwner = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified, planType, listings, validity } = req.body;

    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (planType) updateData.planType = planType;
    if (listings !== undefined) updateData.listings = listings;
    if (validity) updateData.validity = new Date(validity);

    const owner = await prisma.owner.update({
      where: { id },
      data: updateData,
    });

    await logActivity(
      req.admin!.id,
      'UPDATED_OWNER',
      'OWNER',
      id,
      `Updated owner: ${owner.email}`
    );

    res.json({ message: 'Owner updated successfully', owner });
  } catch (error) {
    console.error('Update owner error:', error);
    res.status(500).json({ error: 'Failed to update owner' });
  }
};

export const deleteOwner = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const owner = await prisma.owner.findUnique({ where: { id } });
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    await prisma.owner.delete({ where: { id } });

    await logActivity(
      req.admin!.id,
      'DELETED_OWNER',
      'OWNER',
      id,
      `Deleted owner: ${owner.email}`
    );

    res.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    console.error('Delete owner error:', error);
    res.status(500).json({ error: 'Failed to delete owner' });
  }
};
