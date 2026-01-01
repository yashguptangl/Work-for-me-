import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [usersCount, ownersCount, propertiesStats, verificationStats] = await Promise.all([
      prisma.user.count(),
      prisma.owner.count(),
      prisma.property.aggregate({
        _count: {
          id: true,
        },
        where: {
          isAvailable: true,
        },
      }),
      prisma.verificationRequest.count({
        where: {
          status: "UNDER_REVIEW",
        },
      }),
    ]);

    const allPropertiesCount = await prisma.property.count();
    const draftPropertiesCount = await prisma.property.count({
      where: { isDraft: true },
    });
    const verifiedPropertiesCount = await prisma.property.count({
      where: { verificationStatus: "VERIFIED" },
    });

    return res.status(200).json({
      success: true,
      data: {
        users: { total: usersCount },
        owners: { total: ownersCount },
        properties: {
          total: allPropertiesCount,
          active: propertiesStats._count.id,
          draft: draftPropertiesCount,
          verified: verifiedPropertiesCount,
        },
        verifications: { pending: verificationStats },
      },
    });
  } catch (error: any) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard stats",
    });
  }
};

// Get All Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isVerified: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

// Get All Owners
export const getAllOwners = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [owners, totalCount] = await Promise.all([
      prisma.owner.findMany({
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: { properties: true },
          },
        },
      }),
      prisma.owner.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        owners,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get all owners error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get owners",
    });
  }
};

// Get All Properties
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          propertyType: true,
          rent: true,
          isAvailable: true,
          isDraft: true,
          verificationStatus: true,
          createdAt: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.property.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get all properties error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get properties",
    });
  }
};

// Get Verification Requests
export const getVerificationRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.verificationRequest.findMany({
      where: {
        status: { in: ["PENDING_PAYMENT", "UNDER_REVIEW"] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            images: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (error: any) {
    console.error("Get verification requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get verification requests",
    });
  }
};

// Approve Verification
export const approveVerification = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { reviewNotes } = req.body;
    const adminId = req.admin?.id;

    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found",
      });
    }

    // Update verification request
    await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || "Approved",
      },
    });

    // Update property verification status
    const verificationExpiry = new Date();
    verificationExpiry.setFullYear(verificationExpiry.getFullYear() + 1); // 1 year validity

    await prisma.property.update({
      where: { id: request.propertyId },
      data: {
        verificationStatus: "VERIFIED",
        verificationExpiry: verificationExpiry,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Verification approved successfully",
    });
  } catch (error: any) {
    console.error("Approve verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve verification",
    });
  }
};

// Reject Verification
export const rejectVerification = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { reviewNotes } = req.body;
    const adminId = req.admin?.id;

    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found",
      });
    }

    await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || "Rejected",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Verification rejected",
    });
  } catch (error: any) {
    console.error("Reject verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject verification",
    });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// Delete Owner
export const deleteOwner = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;

    await prisma.owner.delete({
      where: { id: ownerId },
    });

    return res.status(200).json({
      success: true,
      message: "Owner deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete owner error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete owner",
    });
  }
};

// Delete Property
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    await prisma.property.delete({
      where: { id: propertyId },
    });

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete property error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
};