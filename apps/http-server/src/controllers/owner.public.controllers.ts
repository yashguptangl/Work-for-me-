import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";
import { getObjectURL } from "../utils/s3client";

// Public: Get owner profile by ID (no auth)
export const getPublicOwnerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const owner = await prisma.owner.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
      },
    });
    if (!owner) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }
    res.status(200).json({ success: true, data: owner });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Public: Get all public properties for an owner (no auth)
export const getPublicOwnerProperties = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const properties = await prisma.property.findMany({
      where: {
        ownerId: id,
        isDraft: false,
        isAvailable: true,
      },
      select: {
        id: true,
        title: true,
        city: true,
        rent: true,
        salePrice: true,
        listingType: true,
        isAvailable: true,
        isVerified: true,
      },
      orderBy: { createdAt: "desc" },
    });
    // Only fetch the first S3 image (first.jpeg) for each property
    const propertiesWithImage = await Promise.all(properties.map(async (p) => {
      let propertyImage;
      try {
        propertyImage = await getObjectURL(`images/${p.id}/first.jpeg`);
      } catch {}
      return {
        ...p,
        propertyImage,
      };
    }));
    res.status(200).json({ success: true, data: propertiesWithImage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
