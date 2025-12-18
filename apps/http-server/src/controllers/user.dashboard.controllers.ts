import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";
import { differenceInDays } from "date-fns";
import { getObjectURL } from "../utils/s3client";

export const userDetails = async (req: Request, res: Response) => {
  try {
    const id = req.user?.userId; // from auth middleware
    if (!id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const addWishlist = async (req: Request, res: Response) => {
    try {
        const { userId, propertyId } = req.body;

        const wishlistItem = await prisma.wishlist.create({
            data: { userId, propertyId }
        });

        res.status(201).json({ success: true, message: "Added to wishlist", wishlistItem });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding to wishlist", error });
    }
};

export const deleteFromWishlist = async (req: Request, res: Response) => {
    try {
        const { userId, propertyId } = req.body;
        const wishlistItem = await prisma.wishlist.findFirst({
            where: { userId, propertyId },
        });

        if (!wishlistItem) {
            res.status(404).json({ success: false, message: "Wishlist item not found" });
            return;
        }

        await prisma.wishlist.delete({ where: { id: wishlistItem.id } });


        res.status(200).json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error removing wishlist item", error });
    }
};

export const getUserWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
             res.status(401).json({ success: false, message: "Unauthorized" });
             return;
        }

        // 1. Fetch all wishlist items for the user
        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc" } // Newest first
        });

        // 2. Fetch details for each property in wishlist
        const wishlistWithDetails = await Promise.all(
            wishlistItems.map(async (item : any) => {
                let property;
                
                try {
                    property = await prisma.property.findUnique({
                        where: { id: item.propertyId }
                    });

                    // Skip if property not found
                    if (!property) return null;

                    // Get image URL
                    let imageUrl = '';
                    try {
                        const key = `images/${item.propertyId}/first.jpeg`;
                        imageUrl = await getObjectURL(key);
                    } catch (error) {
                        console.error(`Error fetching image for ${item.propertyId}:`, error);
                    }

                    return {
                        id: item.propertyId.toString(),
                        property: {
                            ...property,
                            imageUrl: imageUrl || null
                        }
                    };
                } catch (error) {
                    console.error(`Error processing wishlist item ${item.id}:`, error);
                    return null;
                }
            })
        );

        // Filter out null values (deleted properties)
        const validWishlist = wishlistWithDetails.filter(item => item !== null);

        res.status(200).json({
            success: true,
            data: {
                wishlist: validWishlist,
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching dashboard data",
        });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { firstName, lastName, phone } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
      },
    });

    // Exclude password from the returned user object
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
    });
  }
};