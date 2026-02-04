import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";
import { addMonths } from "date-fns";

// Initiate verification request with payment
export const initiateVerificationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.body;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login as owner.",
      });
      return;
    }

    if (!propertyId) {
      res.status(400).json({
        success: false,
        message: "Property ID is required",
      });
      return;
    }

    // Check if property exists and belongs to owner
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: ownerId,
      },
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: "Property not found or you don't have permission",
      });
      return;
    }

    // Check if verification has expired and update status
    if (property.verificationStatus === "VERIFIED" && property.verificationExpiry) {
      if (new Date() > property.verificationExpiry) {
        // Mark as expired
        await prisma.property.update({
          where: { id: propertyId },
          data: {
            verificationStatus: "EXPIRED",
            isVerified: false,
          },
        });
        property.verificationStatus = "EXPIRED";
      }
    }

    // Check if there's already a pending or active verification request
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        propertyId: propertyId,
        status: {
          in: ["PENDING_PAYMENT", "PAYMENT_COMPLETED", "UNDER_REVIEW"],
        },
      },
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message: "A verification request is already in progress for this property",
        request: existingRequest,
      });
      return;
    }

    // If property was previously verified and now expired, deactivate old verification
    if (property.verificationStatus === "EXPIRED") {
      await prisma.propertyVerification.updateMany({
        where: {
          propertyId: propertyId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Create new verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        propertyId: propertyId,
        ownerId: ownerId,
        propertyCity: property.city,
        amount: 199, // Updated to ₹199 for 1 month
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Verification request initiated. Please complete payment.",
      request: verificationRequest,
    });
  } catch (error) {
    console.error("Error initiating verification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Complete payment (simulate payment gateway)
export const completePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId, paymentId } = req.body;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login as owner.",
      });
      return;
    }

    if (!requestId || !paymentId) {
      res.status(400).json({
        success: false,
        message: "Request ID and Payment ID are required",
      });
      return;
    }

    // Find verification request
    const request = await prisma.verificationRequest.findFirst({
      where: {
        id: requestId,
        ownerId: ownerId,
      },
    });

    if (!request) {
      res.status(404).json({
        success: false,
        message: "Verification request not found",
      });
      return;
    }

    if (request.paymentStatus === "COMPLETED") {
      res.status(400).json({
        success: false,
        message: "Payment already completed",
      });
      return;
    }

    // Update payment status
    const updatedRequest = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        paymentStatus: "COMPLETED",
        paymentId: paymentId,
        paymentDate: new Date(),
        status: "PAYMENT_COMPLETED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment completed successfully. Please capture your location inside the property.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error completing payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Capture location and submit for verification
export const captureLocationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId, latitude, longitude, address } = req.body;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login as owner.",
      });
      return;
    }

    if (!requestId || !latitude || !longitude || !address) {
      res.status(400).json({
        success: false,
        message: "Request ID, latitude, longitude, and address are required",
      });
      return;
    }

    // Find verification request
    const request = await prisma.verificationRequest.findFirst({
      where: {
        id: requestId,
        ownerId: ownerId,
        paymentStatus: "COMPLETED",
      },
    });

    if (!request) {
      res.status(404).json({
        success: false,
        message: "Verification request not found or payment not completed",
      });
      return;
    }

    // Update location details and submit for review
    const updatedRequest = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        verificationLatitude: parseFloat(latitude),
        verificationLongitude: parseFloat(longitude),
        verificationAddress: address,
        locationCapturedAt: new Date(),
        status: "UNDER_REVIEW",
      },
    });

    // Update property status
    await prisma.property.update({
      where: { id: request.propertyId },
      data: {
        verificationStatus: "PENDING_VERIFICATION",
      },
    });

    res.status(200).json({
      success: true,
      message: "Location captured successfully. Your verification request is now under review by admin.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error capturing location:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get verification status for a property
export const getVerificationStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login as owner.",
      });
      return;
    }

    // Check if property belongs to owner
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: ownerId,
      },
      include: {
        verificationRequests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: "Property not found",
      });
      return;
    }

    // Check if verification is expired and update
    if (property.verificationStatus === "VERIFIED" && property.verificationExpiry) {
      if (new Date() > property.verificationExpiry) {
        // Expire the verification and deactivate old verification records
        await prisma.$transaction([
          prisma.property.update({
            where: { id: propertyId },
            data: {
              verificationStatus: "EXPIRED",
              isVerified: false,
            },
          }),
          prisma.propertyVerification.updateMany({
            where: {
              propertyId: propertyId,
              isActive: true,
            },
            data: {
              isActive: false,
            },
          }),
        ]);
        property.verificationStatus = "EXPIRED";
        property.isVerified = false;
      }
    }

    res.status(200).json({
      success: true,
      property: {
        id: property.id,
        title: property.title,
        verificationStatus: property.verificationStatus,
        isVerified: property.isVerified,
        verifiedAt: property.verifiedAt,
        verificationExpiry: property.verificationExpiry,
      },
      latestRequest: property.verificationRequests[0] || null,
    });
  } catch (error) {
    console.error("Error getting verification status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all verification requests for owner
export const getOwnerVerificationRequestsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login as owner.",
      });
      return;
    }

    const requests = await prisma.verificationRequest.findMany({
      where: {
        ownerId: ownerId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      requests: requests,
    });
  } catch (error) {
    console.error("Error getting verification requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
