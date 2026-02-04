import { Request, Response } from 'express';
import { prisma } from '@repo/db/prisma';
import { sendRentAgreementEmail } from '../utils/emailService';
import { generateRentAgreementPDF } from '../utils/pdfGenerator';

// Create new rent agreement
export const createRentAgreement = async (req: Request, res: Response) => {
  try {
    const {
      createdBy,
      creatorPhone,
      ownerFullName,
      ownerEmail,
      ownerPhone,
      ownerAddress,
      tenantFullName,
      tenantEmail,
      tenantPhone,
      tenantPermanentAddress,
      propertyAddress,
      annexures,
      rentAmount,
      securityDeposit,
      agreementDuration,
      noticePeriod,
      rentStartDate,
    } = req.body;

    // Get user ID from auth middleware if user is logged in
    const creatorUserId = req.user?.userId || null;

    // Validate required fields
    if (
      !createdBy ||
      !creatorPhone ||
      !ownerFullName ||
      !ownerEmail ||
      !ownerPhone ||
      !ownerAddress ||
      !tenantFullName ||
      !tenantEmail ||
      !tenantPhone ||
      !tenantPermanentAddress ||
      !propertyAddress ||
      !rentAmount ||
      !securityDeposit ||
      !agreementDuration ||
      !noticePeriod ||
      !rentStartDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Create rent agreement
    const rentAgreement = await prisma.rentAgreement.create({
      data: {
        createdBy,
        creatorPhone,
        creatorUserId,
        ownerFullName,
        ownerEmail,
        ownerPhone,
        ownerAddress,
        tenantFullName,
        tenantEmail,
        tenantPhone,
        tenantPermanentAddress,
        propertyAddress,
        annexures: annexures || null,
        rentAmount,
        securityDeposit,
        agreementDuration,
        noticePeriod,
        rentStartDate: new Date(rentStartDate),
        paymentStatus: 'PENDING',
      },
    });

    // Send email to recipient (owner or tenant based on who created)
    const recipientEmail = createdBy === 'owner' ? ownerEmail : tenantEmail;
    const recipientName = createdBy === 'owner' ? ownerFullName : tenantFullName;
    
    // Send email asynchronously (don't wait for it to complete)
    sendRentAgreementEmail(recipientEmail, recipientName, {
      ownerFullName,
      ownerEmail,
      ownerPhone,
      ownerAddress,
      tenantFullName,
      tenantEmail,
      tenantPhone,
      tenantPermanentAddress,
      propertyAddress,
      annexures: annexures || null,
      rentAmount,
      securityDeposit,
      agreementDuration,
      noticePeriod,
      rentStartDate,
    }).catch(error => {
      console.error('Failed to send email:', error);
      // Don't fail the request if email fails
    });

    res.status(201).json({
      success: true,
      message: 'Rent agreement created successfully. Email will be sent shortly.',
      data: rentAgreement,
    });
  } catch (error) {
    console.error('Error creating rent agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rent agreement',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all rent agreements for logged-in user
export const getUserRentAgreements = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userPhone = req.user?.phone;

    if (!userId && !userPhone) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Find agreements where user is creator, owner, or tenant
    const rentAgreements = await prisma.rentAgreement.findMany({
      where: {
        OR: [
          { creatorUserId: userId },
          { creatorPhone: userPhone },
          { ownerPhone: userPhone },
          { tenantPhone: userPhone },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: rentAgreements,
      count: rentAgreements.length,
    });
  } catch (error) {
    console.error('Error fetching rent agreements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rent agreements',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get specific rent agreement by ID
export const getRentAgreementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.userId;
    const userPhone = req.user?.phone;

    const rentAgreement = await prisma.rentAgreement.findUnique({
      where: { id },
    });

    if (!rentAgreement) {
      return res.status(404).json({
        success: false,
        message: 'Rent agreement not found',
      });
    }

    // Check if user has access to this agreement
    const hasAccess =
      rentAgreement.creatorUserId === userId ||
      rentAgreement.creatorPhone === userPhone ||
      rentAgreement.ownerPhone === userPhone ||
      rentAgreement.tenantPhone === userPhone;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this agreement',
      });
    }

    res.status(200).json({
      success: true,
      data: rentAgreement,
    });
  } catch (error) {
    console.error('Error fetching rent agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rent agreement',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { paymentStatus, paymentAmount, paymentId } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required',
      });
    }

    const rentAgreement = await prisma.rentAgreement.update({
      where: { id },
      data: {
        paymentStatus,
        paymentAmount: paymentAmount || null,
        paymentDate: paymentStatus === 'COMPLETED' ? new Date() : null,
        paymentId: paymentId || null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: rentAgreement,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update document status and URL
export const updateDocumentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { documentUrl } = req.body;

    if (!documentUrl) {
      return res.status(400).json({
        success: false,
        message: 'Document URL is required',
      });
    }

    const agreementId = id as string;
    const rentAgreement = await prisma.rentAgreement.update({
      where: { id: agreementId },
      data: {
        documentGenerated: true,
        documentUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Document status updated successfully',
      data: rentAgreement,
    });
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete rent agreement (soft delete by setting status)
export const deleteRentAgreement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.userId;
    const userPhone = req.user?.phone;

    const rentAgreement = await prisma.rentAgreement.findUnique({
      where: { id },
    });

    if (!rentAgreement) {
      return res.status(404).json({
        success: false,
        message: 'Rent agreement not found',
      });
    }

    // Only creator can delete
    const isCreator =
      rentAgreement.creatorUserId === userId ||
      rentAgreement.creatorPhone === userPhone;

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can delete this agreement',
      });
    }

    await prisma.rentAgreement.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Rent agreement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting rent agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rent agreement',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Download rent agreement PDF
export const downloadRentAgreementPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userPhone = req.user?.phone;

    if (!userId && !userPhone) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Find the rent agreement
    const agreementId = id as string;
    const rentAgreement = await prisma.rentAgreement.findUnique({
      where: { id: agreementId },
    });

    if (!rentAgreement) {
      return res.status(404).json({
        success: false,
        message: 'Rent agreement not found',
      });
    }

    // Check if user has access to this agreement
    const hasAccess =
      rentAgreement.creatorUserId === userId ||
      rentAgreement.creatorPhone === userPhone ||
      rentAgreement.ownerPhone === userPhone ||
      rentAgreement.tenantPhone === userPhone;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this agreement',
      });
    }

    // Generate PDF
    const pdfBuffer = await generateRentAgreementPDF({
      ownerFullName: rentAgreement.ownerFullName,
      ownerEmail: rentAgreement.ownerEmail,
      ownerPhone: rentAgreement.ownerPhone,
      ownerAddress: rentAgreement.ownerAddress,
      tenantFullName: rentAgreement.tenantFullName,
      tenantEmail: rentAgreement.tenantEmail,
      tenantPhone: rentAgreement.tenantPhone,
      tenantPermanentAddress: rentAgreement.tenantPermanentAddress,
      propertyAddress: rentAgreement.propertyAddress,
      annexures: rentAgreement.annexures,
      rentAmount: rentAgreement.rentAmount,
      securityDeposit: rentAgreement.securityDeposit,
      agreementDuration: rentAgreement.agreementDuration,
      noticePeriod: rentAgreement.noticePeriod,
      rentStartDate: rentAgreement.rentStartDate.toISOString(),
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Rent_Agreement_${rentAgreement.ownerFullName}_${rentAgreement.tenantFullName}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading rent agreement PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
