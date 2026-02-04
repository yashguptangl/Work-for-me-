import { Response } from 'express';
import { prisma } from '@repo/db';
import { AdminAuthRequest, logActivity } from '../middleware/auth';

// Get all rent agreements
export const getAllRentAgreements = async (req: AdminAuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const paymentStatus = req.query.paymentStatus as string;

    const where: any = {};

    if (search) {
      where.OR = [
        { ownerFullName: { contains: search, mode: 'insensitive' } },
        { tenantFullName: { contains: search, mode: 'insensitive' } },
        { ownerPhone: { contains: search } },
        { tenantPhone: { contains: search } },
      ];
    }

    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [agreements, total] = await Promise.all([
      prisma.rentAgreement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdBy: true,
          creatorPhone: true,
          ownerFullName: true,
          ownerPhone: true,
          tenantFullName: true,
          tenantPhone: true,
          propertyAddress: true,
          rentAmount: true,
          securityDeposit: true,
          agreementDuration: true,
          rentStartDate: true,
          paymentStatus: true,
          paymentId: true,
          documentGenerated: true,
          documentUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.rentAgreement.count({ where }),
    ]);

    await logActivity(
      req.admin!.id,
      'VIEWED_RENT_AGREEMENTS',
      'RENT_AGREEMENT',
      undefined,
      `Viewed rent agreements list (page ${page})`
    );

    res.json({
      agreements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get rent agreements error:', error);
    res.status(500).json({ error: 'Failed to fetch rent agreements' });
  }
};

// Get rent agreement by ID with full details
export const getRentAgreementById = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const agreement = await prisma.rentAgreement.findUnique({
      where: { id },
    });

    if (!agreement) {
      return res.status(404).json({ error: 'Rent agreement not found' });
    }

    await logActivity(
      req.admin!.id,
      'VIEWED_RENT_AGREEMENT_DETAILS',
      'RENT_AGREEMENT',
      id,
      `Viewed rent agreement for ${agreement.tenantFullName}`
    );

    res.json({ agreement });
  } catch (error) {
    console.error('Get rent agreement error:', error);
    res.status(500).json({ error: 'Failed to fetch rent agreement' });
  }
};

// Update rent agreement payment status
export const updatePaymentStatus = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentId, paymentAmount } = req.body;

    if (!['PENDING', 'COMPLETED', 'FAILED'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const updateData: any = {
      paymentStatus,
    };

    if (paymentId) updateData.paymentId = paymentId;
    if (paymentAmount) updateData.paymentAmount = paymentAmount;
    if (paymentStatus === 'COMPLETED') updateData.paymentDate = new Date();

    const agreement = await prisma.rentAgreement.update({
      where: { id },
      data: updateData,
    });

    await logActivity(
      req.admin!.id,
      'UPDATED_RENT_AGREEMENT_PAYMENT',
      'RENT_AGREEMENT',
      id,
      `Updated payment status to ${paymentStatus} for ${agreement.tenantFullName}`
    );

    res.json({ 
      message: 'Payment status updated successfully', 
      agreement 
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

// Update rent agreement document status
export const updateDocumentStatus = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { documentGenerated, documentUrl } = req.body;

    if (typeof documentGenerated !== 'boolean') {
      return res.status(400).json({ error: 'Invalid document status' });
    }

    const updateData: any = {
      documentGenerated,
    };

    if (documentUrl) updateData.documentUrl = documentUrl;

    const agreement = await prisma.rentAgreement.update({
      where: { id },
      data: updateData,
    });

    await logActivity(
      req.admin!.id,
      'UPDATED_RENT_AGREEMENT_DOCUMENT',
      'RENT_AGREEMENT',
      id,
      `Updated document status to ${documentGenerated ? 'Generated' : 'Not Generated'} for ${agreement.tenantFullName}`
    );

    res.json({ 
      message: 'Document status updated successfully', 
      agreement 
    });
  } catch (error) {
    console.error('Update document status error:', error);
    res.status(500).json({ error: 'Failed to update document status' });
  }
};

// Delete rent agreement
export const deleteRentAgreement = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const agreement = await prisma.rentAgreement.findUnique({ 
      where: { id },
      select: { tenantFullName: true, ownerFullName: true }
    });

    if (!agreement) {
      return res.status(404).json({ error: 'Rent agreement not found' });
    }

    await prisma.rentAgreement.delete({ where: { id } });

    await logActivity(
      req.admin!.id,
      'DELETED_RENT_AGREEMENT',
      'RENT_AGREEMENT',
      id,
      `Deleted rent agreement between ${agreement.ownerFullName} and ${agreement.tenantFullName}`
    );

    res.json({ message: 'Rent agreement deleted successfully' });
  } catch (error) {
    console.error('Delete rent agreement error:', error);
    res.status(500).json({ error: 'Failed to delete rent agreement' });
  }
};

// Get rent agreement statistics
export const getRentAgreementStats = async (req: AdminAuthRequest, res: Response) => {
  try {
    const paymentStats = await prisma.rentAgreement.groupBy({
      by: ['paymentStatus'],
      _count: true,
    });

    const documentStats = await prisma.rentAgreement.groupBy({
      by: ['documentGenerated'],
      _count: true,
    });

    const totalAgreements = await prisma.rentAgreement.count();
    
    // Get all completed payments and manually sum since rentAmount is String
    const completedAgreements = await prisma.rentAgreement.findMany({
      where: { paymentStatus: 'COMPLETED' },
      select: { paymentAmount: true },
    });

    const totalRevenue = completedAgreements.reduce((sum, agreement) => {
      const amount = parseFloat(agreement.paymentAmount || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    res.json({
      totalAgreements,
      totalRevenue,
      paymentStats,
      documentStats,
    });
  } catch (error) {
    console.error('Rent agreement stats error:', error);
    res.status(500).json({ error: 'Failed to fetch rent agreement stats' });
  }
};
