import { Response } from 'express';
import { prisma } from '@repo/db';
import { AdminAuthRequest, logActivity } from '../middleware/auth';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

const getPresignedUrls = async (images: string[]): Promise<string[]> => {
  try {
    const urlPromises = images.map(async (imageKey) => {
      if (imageKey.startsWith('http')) return imageKey;
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: imageKey,
      });
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    });
    return await Promise.all(urlPromises);
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    return images;
  }
};

export const getAllVerificationRequests = async (req: AdminAuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const city = req.query.city as string;

    const where: any = {};

    if (status) where.status = status;
    if (city) where.propertyCity = city;

    // Employees can only see requests assigned to them or unassigned
    if (req.admin?.role === 'EMPLOYEE') {
      where.OR = [
        { assignedTo: req.admin.id },
        { assignedTo: null },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.verificationRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              propertyType: true,
              listingType: true,
              bhk: true,
              images: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      }),
      prisma.verificationRequest.count({ where }),
    ]);

    // Generate presigned URLs for property images and verification photos
    const requestsWithUrls = await Promise.all(
      requests.map(async (request) => ({
        ...request,
        property: {
          ...request.property,
          images: await getPresignedUrls(request.property.images),
        },
        verificationPhotos: await getPresignedUrls(request.verificationPhotos),
      }))
    );

    await logActivity(
      req.admin!.id,
      'VIEWED_VERIFICATION_REQUESTS',
      'VERIFICATION_REQUEST',
      undefined,
      `Viewed verification requests (page ${page})`
    );

    res.json({
      requests: requestsWithUrls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get verification requests error:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
};

export const getVerificationRequestById = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const request = await prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        property: {
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
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    // Check if employee has access
    if (req.admin?.role === 'EMPLOYEE' && request.assignedTo !== req.admin.id && request.assignedTo !== null) {
      return res.status(403).json({ error: 'You do not have access to this request' });
    }

    // Generate presigned URLs
    const requestWithUrls = {
      ...request,
      property: {
        ...request.property,
        images: await getPresignedUrls(request.property.images),
      },
      verificationPhotos: await getPresignedUrls(request.verificationPhotos),
    };

    await logActivity(
      req.admin!.id,
      'VIEWED_VERIFICATION_REQUEST',
      'VERIFICATION_REQUEST',
      id,
      `Viewed verification request for property: ${request.property.title}`
    );

    res.json({ request: requestWithUrls });
  } catch (error) {
    console.error('Get verification request error:', error);
    res.status(500).json({ error: 'Failed to fetch verification request' });
  }
};

export const assignVerificationRequest = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    // Verify employee exists and is active
    const employee = await prisma.admin.findUnique({
      where: { id: employeeId },
      include: { permissions: true },
    });

    if (!employee || !employee.isActive) {
      return res.status(400).json({ error: 'Invalid or inactive employee' });
    }

    if (!employee.permissions?.canVerifyProperties) {
      return res.status(400).json({ error: 'Employee does not have verification permission' });
    }

    const request = await prisma.verificationRequest.update({
      where: { id },
      data: {
        assignedTo: employeeId,
        assignedAt: new Date(),
        status: 'UNDER_REVIEW',
      },
    });

    await logActivity(
      req.admin!.id,
      'ASSIGNED_VERIFICATION',
      'VERIFICATION_REQUEST',
      id,
      `Assigned verification request to ${employee.firstName} ${employee.lastName}`
    );

    res.json({ message: 'Verification request assigned successfully', request });
  } catch (error) {
    console.error('Assign verification error:', error);
    res.status(500).json({ error: 'Failed to assign verification request' });
  }
};

export const reviewVerificationRequest = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approved, notes } = req.body;

    const request = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    // Check if employee has access
    if (req.admin?.role === 'EMPLOYEE' && request.assignedTo !== req.admin.id) {
      return res.status(403).json({ error: 'You can only review requests assigned to you' });
    }

    const status = approved ? 'APPROVED' : 'REJECTED';
    const validFrom = approved ? new Date() : undefined;
    const validUntil = approved ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined; // 1 month = 30 days

    // Update verification request
    const updatedRequest = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: req.admin!.id,
        reviewedAt: new Date(),
        reviewNotes: notes,
        validFrom,
        validUntil,
      },
    });

    // Update property verification status
    await prisma.property.update({
      where: { id: request.propertyId },
      data: {
        verificationStatus: approved ? 'VERIFIED' : 'NOT_VERIFIED',
        isVerified: approved,
        verifiedAt: approved ? new Date() : null,
        verificationExpiry: validUntil,
      },
    });

    // Create verification history record if approved
    if (approved) {
      await prisma.propertyVerification.create({
        data: {
          propertyId: request.propertyId,
          verifiedBy: req.admin!.id,
          verificationPhotos: request.verificationPhotos,
          verificationNotes: notes,
          validUntil: validUntil!,
        },
      });
    }

    await logActivity(
      req.admin!.id,
      approved ? 'APPROVED_VERIFICATION' : 'REJECTED_VERIFICATION',
      'VERIFICATION_REQUEST',
      id,
      `${approved ? 'Approved' : 'Rejected'} verification for ${request.property.title}. Notes: ${notes || 'None'}`
    );

    res.json({ 
      message: `Verification request ${approved ? 'approved' : 'rejected'} successfully`, 
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Review verification error:', error);
    res.status(500).json({ error: 'Failed to review verification request' });
  }
};

export const getVerificationStats = async (req: AdminAuthRequest, res: Response) => {
  try {
    const stats = await prisma.verificationRequest.groupBy({
      by: ['status'],
      _count: true,
    });

    const cityStats = await prisma.verificationRequest.groupBy({
      by: ['propertyCity'],
      _count: true,
      orderBy: {
        _count: {
          propertyCity: 'desc',
        },
      },
    });

    res.json({
      statusStats: stats,
      cityStats,
    });
  } catch (error) {
    console.error('Verification stats error:', error);
    res.status(500).json({ error: 'Failed to fetch verification stats' });
  }
};
