import { Response } from 'express';
import { prisma } from '@repo/db';
import { AdminAuthRequest, logActivity } from '../middleware/auth';
import { getPresignedUrls } from '../utils/s3client';

export const getAllProperties = async (req: AdminAuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const city = req.query.city as string;
    const propertyType = req.query.propertyType as string;
    const verificationStatus = req.query.verificationStatus as string;
    const available = req.query.available as string;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (verificationStatus) where.verificationStatus = verificationStatus;
    if (available !== undefined) where.isAvailable = available === 'true';

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    // Generate presigned URLs for images
    const propertiesWithUrls = await Promise.all(
      properties.map(async (property) => ({
        ...property,
        images: await getPresignedUrls(property.images),
      }))
    );

    await logActivity(
      req.admin!.id,
      'VIEWED_PROPERTIES',
      'PROPERTY',
      undefined,
      `Viewed properties list (page ${page})`
    );

    res.json({
      properties: propertiesWithUrls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const getPropertyById = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            planType: true,
          },
        },
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        contacts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        verifications: {
          where: { isActive: true },
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { verifiedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    console.log('🖼️  Property images (before presigned):', property.images);

    // Generate presigned URLs for images
    // If images array is empty, try the hardcoded S3 pattern from http-server (all 5 images)
    let imagesToFetch = property.images;
    if (!imagesToFetch || imagesToFetch.length === 0) {
      // Use the same pattern as http-server: images/{propertyId}/first.jpeg, second.jpeg, etc.
      imagesToFetch = [
        `images/${property.id}/first.jpeg`,
        `images/${property.id}/second.jpeg`,
        `images/${property.id}/third.jpeg`,
        `images/${property.id}/fourth.jpeg`,
        `images/${property.id}/fifth.jpeg`,
      ];
      console.log('📸 Using hardcoded S3 pattern for all 5 images:', imagesToFetch);
    }

    const signedImages = await getPresignedUrls(imagesToFetch);
    console.log('✅ Generated presigned URLs:', signedImages);

    const propertyWithUrls = {
      ...property,
      images: signedImages,
      verifiedBy: property.verifications[0]?.employee 
        ? `${property.verifications[0].employee.firstName} ${property.verifications[0].employee.lastName}`
        : null,
      verificationNotes: property.verifications[0]?.verificationNotes || null,
    };

    await logActivity(
      req.admin!.id,
      'VIEWED_PROPERTY_DETAILS',
      'PROPERTY',
      id,
      `Viewed property: ${property.title}`
    );

    res.json({ property: propertyWithUrls });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

export const updateProperty = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.ownerId;
    delete updateData.createdAt;

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    await logActivity(
      req.admin!.id,
      'UPDATED_PROPERTY',
      'PROPERTY',
      id,
      `Updated property: ${property.title}`
    );

    res.json({ message: 'Property updated successfully', property });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
};

export const verifyProperty = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { verified, notes } = req.body;

    const verificationStatus = verified ? 'VERIFIED' : 'NOT_VERIFIED';
    const verifiedAt = verified ? new Date() : null;
    
    // Set expiry to 3 months from now if verified
    const verificationExpiry = verified 
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) 
      : null;

    const property = await prisma.property.update({
      where: { id },
      data: {
        verificationStatus,
        isVerified: verified,
        verifiedAt,
        verificationExpiry,
      },
    });

    // Update verification request if exists
    const verificationRequest = await prisma.verificationRequest.findFirst({
      where: { 
        propertyId: id,
        status: { in: ['UNDER_REVIEW', 'PAYMENT_COMPLETED'] },
      },
    });

    if (verificationRequest) {
      await prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: {
          status: verified ? 'APPROVED' : 'REJECTED',
          reviewedBy: req.admin!.id,
          reviewedAt: new Date(),
          reviewNotes: notes,
          validFrom: verified ? new Date() : undefined,
          validUntil: verificationExpiry,
        },
      });
    }

    await logActivity(
      req.admin!.id,
      verified ? 'VERIFIED_PROPERTY' : 'REJECTED_PROPERTY',
      'PROPERTY',
      id,
      `${verified ? 'Verified' : 'Rejected'} property: ${property.title}. Notes: ${notes || 'None'}`
    );

    res.json({ 
      message: `Property ${verified ? 'verified' : 'rejected'} successfully`, 
      property 
    });
  } catch (error) {
    console.error('Verify property error:', error);
    res.status(500).json({ error: 'Failed to verify property' });
  }
};

export const deleteProperty = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await prisma.property.delete({ where: { id } });

    await logActivity(
      req.admin!.id,
      'DELETED_PROPERTY',
      'PROPERTY',
      id,
      `Deleted property: ${property.title}`
    );

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};

export const getPropertyStats = async (req: AdminAuthRequest, res: Response) => {
  try {
    const stats = await prisma.property.groupBy({
      by: ['verificationStatus'],
      _count: true,
    });

    const cityStats = await prisma.property.groupBy({
      by: ['city'],
      _count: true,
      orderBy: {
        _count: {
          city: 'desc',
        },
      },
    });

    const typeStats = await prisma.property.groupBy({
      by: ['propertyType'],
      _count: true,
    });

    res.json({
      verificationStats: stats,
      cityStats,
      typeStats,
    });
  } catch (error) {
    console.error('Property stats error:', error);
    res.status(500).json({ error: 'Failed to fetch property stats' });
  }
};
