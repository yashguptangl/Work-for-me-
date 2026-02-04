import { Request, Response } from "express";
import { putObject, getObjectURL } from "../utils/s3client";
import { prisma } from "@repo/db/prisma";
import { differenceInDays } from "date-fns";

// Property types enum
enum PropertyType {
  PG = "PG",
  FLAT = "FLAT",
  ROOM = "ROOM",
  HOUSE = "HOUSE",
  VILLA = "VILLA",
}



// Create a new property listing
export const createPropertyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      propertyType,
      listingType, // NEW: "RENT" or "SALE"
      address,
      city,
      townSector,
      colony,
      landmark,
      latitude,
      longitude,
      apiAddress,
      // Rental fields
      rent,
      security,
      maintenance,
      accommodation,
      genderPreference,
      preferredTenants,
      noticePeriod,
      // Sale fields (NEW)
      salePrice,
      carpetArea,
      builtUpArea,
      pricePerSqft,
      propertyAge,
      floorNumber,
      facingDirection,
      possession,
      furnishingDetails,
      // Common fields
      negotiable,
      bhk,
      furnished,
      totalFloors,
      totalUnits,
      powerBackup,
      waterSupply,
      parking,
      insideAmenities,
      outsideAmenities,
      contactName,
      whatsappNo,
      offer,
      type,
      isAvailable,
      isDraft,
    } = req.body;

    // Get ownerId from authenticated user (JWT middleware)
    const ownerId = req.user?.userId;

    // Validation
    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login as owner.",
      });
      return;
    }

    // Validate listing type
    if (!listingType || !['RENT', 'SALE'].includes(listingType)) {
      res.status(400).json({
        success: false,
        message: "Invalid listing type. Must be RENT or SALE",
      });
      return;
    }

    // Build required fields based on listing type
    let requiredFields: any = {
      title,
      description,
      propertyType,
      listingType,
      address,
      city,
      townSector,
      colony,
      bhk,
      furnished,
      totalFloors,
      totalUnits,
      powerBackup,
      waterSupply,
      parking,
      contactName,
      whatsappNo,
    };

    if (listingType === 'RENT') {
      // Additional required fields for rental properties
      requiredFields = {
        ...requiredFields,
        rent,
        security,
        maintenance,
        accommodation,
        genderPreference,
        preferredTenants,
        noticePeriod,
      };
    } else if (listingType === 'SALE') {
      // Additional required fields for sale properties
      requiredFields = {
        ...requiredFields,
        salePrice,
        carpetArea,
        builtUpArea,
        facingDirection,
        propertyAge,
        possession,
      };
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value && value !== 0 && value !== false)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    // Validate property type
    const validTypes = ['PG', 'FLAT', 'ROOM', 'HOUSE', 'VILLA'];
    if (!validTypes.includes(propertyType)) {
      res.status(400).json({
        success: false,
        message: "Invalid property type. Must be PG, FLAT, ROOM, HOUSE, or VILLA",
      });
      return;
    }

    // Check if owner exists
    const ownerRecord = await prisma.owner.findUnique({
      where: { id: ownerId },
    });

    if (!ownerRecord) {
      res.status(404).json({
        success: false,
        message: "Owner not found",
      });
      return;
    }

    const owner = ownerRecord;

    // Verify mobile number verification for non-draft listings
    if (!isDraft) {
      console.log('Checking verification for WhatsApp number:', whatsappNo);
      
      // Check if the WhatsApp number provided is verified
      const mobileVerification = await prisma.tempMobileVerification.findUnique({
        where: { mobile: whatsappNo },
      });

      console.log('Mobile verification record:', mobileVerification);

      if (!mobileVerification || !mobileVerification.verified) {
        res.status(403).json({
          success: false,
          message: "Please verify your WhatsApp number before publishing property listing",
          requiresVerification: true,
        });
        return;
      }

      console.log('Mobile verification passed for:', whatsappNo);
    }

    // Create property with lifetime availability (no restrictions)
    const newProperty = await prisma.property.create({
      data: {
        title,
        description,
        propertyType,
        listingType, // NEW
        address,
        city,
        townSector,
        colony,
        landmark: landmark || '',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        apiAddress: apiAddress || null,
        
        // Rental fields
        rent: listingType === 'RENT' ? rent?.toString() : null,
        security: listingType === 'RENT' ? security?.toString() : null,
        maintenance: listingType === 'RENT' ? maintenance?.toString() : null,
        accommodation: listingType === 'RENT' ? accommodation : null,
        genderPreference: listingType === 'RENT' ? genderPreference : null,
        preferredTenants: listingType === 'RENT' ? (preferredTenants || []) : [],
        noticePeriod: listingType === 'RENT' ? noticePeriod : null,
        
        // Sale fields (NEW)
        salePrice: listingType === 'SALE' ? salePrice?.toString() : null,
        carpetArea: listingType === 'SALE' ? carpetArea?.toString() : null,
        builtUpArea: listingType === 'SALE' ? builtUpArea?.toString() : null,
        pricePerSqft: listingType === 'SALE' ? pricePerSqft?.toString() : null,
        propertyAge: listingType === 'SALE' ? propertyAge : null,
        floorNumber: floorNumber ? parseInt(floorNumber) : null,
        facingDirection: listingType === 'SALE' ? facingDirection : null,
        possession: listingType === 'SALE' ? possession : null,
        furnishingDetails: listingType === 'SALE' ? furnishingDetails : null,
        
        // Common fields
        negotiable: negotiable !== undefined ? negotiable : false,
        bhk: parseInt(bhk),
        furnished,
        totalFloors: parseInt(totalFloors),
        totalUnits: parseInt(totalUnits),
        powerBackup,
        waterSupply,
        parking,
        insideAmenities: insideAmenities || [],
        outsideAmenities: outsideAmenities || [],
        contactName,
        whatsappNo,
        offer: offer || '',
        type: type || listingType,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        isDraft: isDraft !== undefined ? isDraft : false,
        isVerified: false, 
        ownerId,
      },
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
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully!",
      data: {
        property: newProperty,
        verificationStatus: "VERIFIED",
      },
    });
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating property",
    });
  }
};

// Upload Property Images - Generate presigned URLs
export const uploadImagesController = async (req: Request,res: Response): Promise<void> => {
  try {
    console.log('🔍 DEBUG: uploadImagesController called');
    console.log('🔍 DEBUG: Request body:', req.body);
    console.log('🔍 DEBUG: Request user:', req.user);
    
    const { propertyId, ownerId } = req.body;

    if (!propertyId || !ownerId) {
      console.log('❌ DEBUG: Missing propertyId or ownerId');
      res.status(400).json({
        success: false,
        message: "Property ID and Owner ID are required",
      });
      return;
    }

    console.log('🔍 DEBUG: propertyId:', propertyId);
    console.log('🔍 DEBUG: ownerId:', ownerId);

    // Define specific categories for images
    const categories = ["first", "second", "third", "fourth", "fifth"];
    const urls: { [key: string]: string } = {};

    console.log('🔍 DEBUG: Generating presigned URLs...');
    
    for (const category of categories) {
      // Generate presigned URL for each category using direct key
      const key = `images/${propertyId}/${category}.jpeg`;
      console.log(`🔍 DEBUG: Generating PUT URL for key: ${key}`);
      const presignedUrl = await putObject(key, "image/jpeg");
      console.log(`🔍 DEBUG: Generated URL for ${category}:`, presignedUrl.substring(0, 200));
      
      // Verify this is a PUT URL and not a GET URL
      if (presignedUrl.includes('GetObject')) {
        console.error('❌ ERROR: putObject returned a GET URL instead of PUT URL!');
        console.error('❌ Full URL:', presignedUrl);
      }
      
      urls[category] = presignedUrl;
    }
    
    console.log('🔍 DEBUG: All URLs generated successfully');
    console.log('🔍 DEBUG: Sample URL structure check:', Object.values(urls)[0]?.includes('PutObject') ? 'PUT URL ✅' : 'Not PUT URL ❌');
    
    await prisma.property.update({
      where: { id: propertyId },
      data: { isDraft: false }, // Update the isDraft field to false
    });
    
    console.log('🔍 DEBUG: Property updated to published');
    console.log('🔍 DEBUG: Sending response...');
    
    res.json({ 
      success: true,
      message: "Presigned URLs generated successfully",
      data: {
        presignedUrls: urls 
      }
    });
    return;
  } catch (error) {
    console.error("❌ Upload images error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while uploading images",
    });
  }
};

// Get owner's properties
export const getOwnerPropertiesController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get ownerId from authenticated user (JWT middleware)
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login as owner.",
      });
      return;
    }
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            isVerified: true,
            listings: true
          }
        },
        contacts: {
          select: {
            id: true,
            userName: true,
            userPhone: true,
            status: true,
            contactType: true,
            createdAt: true
          },
          where: {
            ownerDeleted: false
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Attach S3 image URLs to each property
    const categories = ["first", "second", "third", "fourth", "fifth"];
    const propertiesWithImages = await Promise.all(
      properties.map(async (property: any) => {
        // Generate signed URLs for images to work with private buckets
        const images = await Promise.all(
          categories.map((category) =>
            getObjectURL(`images/${property.id}/${category}.jpeg`)
          )
        );
        return {
          ...property,
          images,
          contactCount: property.contacts.length,
          recentContacts: property.contacts.slice(0, 3),
        };
      })
    );

    // Group properties by listing type
    const rentalProperties = propertiesWithImages.filter(p => p.listingType === 'RENT');
    const saleProperties = propertiesWithImages.filter(p => p.listingType === 'SALE');

    res.status(200).json({
      success: true,
      message: "Properties fetched successfully",
      data: propertiesWithImages,
      meta: {
        total: propertiesWithImages.length,
        rental: {
          total: rentalProperties.length,
          active: rentalProperties.filter(p => p.isAvailable && !p.isDraft).length,
          draft: rentalProperties.filter(p => p.isDraft).length,
          paused: rentalProperties.filter(p => !p.isAvailable && !p.isDraft).length
        },
        sale: {
          total: saleProperties.length,
          active: saleProperties.filter(p => p.isAvailable && !p.isDraft).length,
          draft: saleProperties.filter(p => p.isDraft).length,
          paused: saleProperties.filter(p => !p.isAvailable && !p.isDraft).length
        }
      }
    });

  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching owner properties'
    });
  }
};

// Get property by ID
export const getPropertyByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user?.userId;
  
  console.log('=== Get Property By ID ===');
  console.log('Property ID:', id);
  console.log('Owner ID from token:', ownerId);
  
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { 
        owner: { 
          select: { 
            id: true,
            firstName: true, 
            lastName: true, 
            phone: true,
            email: true,
            isVerified: true 
          } 
        },
        contacts: {
          where: {
            ownerDeleted: false
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    console.log('Property found:', property ? 'Yes' : 'No');
    
    if (!property) {
      console.log('Property not found in database');
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }
    
    console.log('Property owner ID:', property.ownerId);
    
    // Verify ownership if ownerId is provided (authenticated request)
    if (ownerId && property.ownerId !== ownerId) {
      console.log('Permission denied - Owner mismatch');
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this property"
      });
    }
    
    console.log('Permission granted - Sending property data');
    
    // Add image URLs
    const categories = ["first", "second", "third", "fourth", "fifth"];
    const bucket = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET || '';
    const images = bucket
      ? categories.map(category => `https://${bucket}.s3.amazonaws.com/images/${property.id}/${category}.jpeg`)
      : categories.map(category => `/placeholder/${category}.jpeg`);
    
    res.status(200).json({ 
      success: true,
      property: {
        ...property,
        images
      }
    });
  } catch (error) {
    console.error("Get property by ID error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error 
    });
  }
};

// Toggle property availability (available/unavailable)
export const togglePropertyAvailabilityController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        isAvailable: true,
        updatedAt: true
      }
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    if (property.ownerId !== ownerId) {
      res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
      return;
    }

    // Toggle availability while preserving the original updatedAt timestamp
    // This ensures that visibility changes don't affect the "last edited" date
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        isAvailable: !property.isAvailable,
        updatedAt: property.updatedAt  // Preserve original updatedAt
      }
    });

    res.status(200).json({
      success: true,
      message: `Property ${updatedProperty.isAvailable ? 'activated' : 'paused'}`,
      data: updatedProperty
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while toggling availability'
    });
  }
};

/**
 * Utility to check if property can be updated (form/images) based on 30-day restriction.
 */
export const canUpdateProperty = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { updatedAt: true },
  });

  if (!property) {
    return { allowed: false, message: "Property not found", daysLeft: null };
  }

  const now = new Date();
  const daysSinceUpdate = differenceInDays(now, property.updatedAt);

  if (daysSinceUpdate < 30) {
    return {
      allowed: false,
      message: `Update allowed only after ${30 - daysSinceUpdate} days`,
      daysLeft: 30 - daysSinceUpdate,
    };
  }

  return { allowed: true, message: "Update allowed", daysLeft: 0 };
};

/**
 * Utility to update the property's updatedAt timestamp.
 */
export const updatePropertyTimestamp = async (propertyId: string) => {
  await prisma.property.update({
    where: { id: propertyId },
    data: { updatedAt: new Date() },
  });
};

/**
 * Update property form and/or images (allowed only once every 30 days).
 * Only form data is updated here. For images, generate S3 presigned URLs and let client upload directly.
 * After either form or images update, reset the 30-day timer.
 */
export const updatePropertyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.userId;
    const formData = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: "Property ID is required" });
      return;
    }

    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please login as owner.' });
      return;
    }

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.ownerId !== ownerId) {
      res.status(403).json({ success: false, message: 'Not authorized to update this property' });
      return;
    }

    // Check 30-day restriction
    const updateCheck = await canUpdateProperty(id);
    if (!updateCheck.allowed) {
      res.status(403).json({
        success: false,
        message: updateCheck.message,
        daysLeft: updateCheck.daysLeft,
      });
      return;
    }

    let updatedProperty = null;

    // Update form data if provided
    if (formData && Object.keys(formData).length > 0) {
      updatedProperty = await prisma.property.update({
        where: { id },
        data: formData,
      });
      // Reset 30-day timer
      await updatePropertyTimestamp(id);
    }

    // If client requests presigned URLs for image upload
    if (formData.requestPresignedUrls && formData.ownerId) {
      const categories = ["first", "second", "third", "fourth", "fifth"];
      const urls: { [key: string]: string } = {};
      for (const category of categories) {
        const key = `images/${id}/${category}.jpeg`;
        urls[category] = await putObject(key, "image/jpeg");
      }
      // Reset 30-day timer
      await updatePropertyTimestamp(id);
      res.status(200).json({
        success: true,
        message: "Presigned URLs generated. Next update allowed after 30 days.",
        presignedUrls: urls,
        ...(updatedProperty ? { property: updatedProperty } : {}),
      });
      return;
    }

    if (updatedProperty) {
      res.status(200).json({
        success: true,
        message: "Property updated successfully. Next update allowed after 30 days.",
        data: updatedProperty,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No form data provided for update",
      });
    }
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating property",
    });
  }
};


// Delete property (soft delete)
export const deletePropertyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.ownerId !== ownerId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Soft delete - mark as unavailable and draft so it doesn't show in searches
    await prisma.property.update({
      where: { id },
      data: {
        isAvailable: false,
        isDraft: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Publish draft property (mark as not draft and available)
export const publishPropertyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login as owner.',
      });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.ownerId !== ownerId) {
      res.status(403).json({ success: false, message: 'Permission denied' });
      return;
    }

    // Update property to published state
    const updated = await prisma.property.update({
      where: { id },
      data: { isDraft: false, isAvailable: true }
    });

    res.status(200).json({ success: true, message: 'Published', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
