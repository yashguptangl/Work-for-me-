import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";
import { getObjectURL } from "../utils/s3client";
import getDistance from "../utils/geoUtils";

// Define the allowed values for looking_for
type LookingFor = "PG" | "FLAT" | "ROOM";


// Helper to get image URLs for a listing
const getListingImageUrls = async (listingId: string, categories: string[]) => {
    return Promise.all(
        categories.map(async (category) => {
            const key = `images/${listingId}/${category}.jpeg`;
            return await getObjectURL(key);
        })
    );
};

export const searchListings = async (req: Request, res: Response) => {
    const looking_for = req.query.looking_for as LookingFor | undefined;
    const city = req.query.city as string;
    const townSector = req.query.townSector as string;
    const allResidential = req.query.allResidential as string;

    // city and townSector are REQUIRED, but looking_for is optional if allResidential is true
    if (!city || !townSector) {
        return res.status(400).json({ 
            success: false, 
            message: "city and townSector are required" 
        });
    }

    // If not searching all residential, looking_for is required
    if (!allResidential && !looking_for) {
        return res.status(400).json({ 
            success: false, 
            message: "looking_for (property type) is required when not searching all residential properties" 
        });
    }

    try {
        // Build the where clause
        const whereClause: any = {
            city,
            townSector,
            isAvailable: true,
            isDraft: false,
        };

        // Only add propertyType filter if not searching all residential
        if (!allResidential && looking_for) {
            whereClause.propertyType = looking_for;
        }

        // Fetch properties based on filters
        const listings = await prisma.property.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        // Get images for all listings
        const imageCategories = ["first", "second", "third", "fourth", "fifth"];
        const listingsWithImages = await Promise.all(
            listings.map(async (listing) => {
                const imageUrls = await getListingImageUrls(listing.id, imageCategories);
                const rentValue = parseFloat(listing.rent || "0");
                
                return {
                    ...listing,
                    rentValue,
                    coverImage: imageUrls[0] || null,
                    imageUrls,
                };
            })
        );

        return res.json({ 
            success: true, 
            message: "Properties fetched successfully", 
            data: listingsWithImages 
        });
    } catch (error) {
        console.error("Error fetching listings:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const getPropertyById = async (req: Request, res: Response) => {
    const propertyId = req.params.id;
    
    if (!propertyId) {
        return res.status(400).json({ 
            success: false, 
            message: "Property ID is required" 
        });
    }
    
    try {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        });
        
        if (!property) {
            return res.status(404).json({ 
                success: false, 
                message: "Property not found" 
            });
        }

        // Get image URLs
        const categories = ["first", "second", "third", "fourth", "fifth"];
        const imageUrls = await getListingImageUrls(propertyId, categories);
        const rentValue = parseFloat(property.rent || "0");

        return res.json({ 
            success: true, 
            message: "Property fetched successfully",
            data: { 
                ...property, 
                rentValue,
                coverImage: imageUrls[0] || null,
                imageUrls 
            } 
        });
    } catch (error) {
        console.error("Error fetching property:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const filterProperties = async (req: Request, res: Response) => {
    try {
        const {
            propertyType,
            budget,
            city,
            townSector,
            genderPreference,
            preferredTenants,
            insideAmenities,
            outsideAmenities,
            allResidential,
        } = req.query;

        const where: any = {
            isAvailable: true,
            isDraft: false,
        };

        // Only add propertyType filter if not searching all residential
        if (!allResidential && propertyType) where.propertyType = propertyType;
        if (city) where.city = city;
        if (townSector) where.townSector = townSector;
        if (genderPreference) where.genderPreference = genderPreference;
        if (preferredTenants) {
            const tenants = (preferredTenants as string).split(",");
            where.preferredTenants = { hasSome: tenants };
        }

        if (budget) {
            const [min, max] = (budget as string).split("-").map(Number);
            if (!isNaN(min as number) && !isNaN(max as number)) {
                where.AND = [
                    { minPrice: { gte: String(min) } },
                    { maxPrice: { lte: String(max) } },
                ];
            } else if (!isNaN(min as number)) {
                where.maxPrice = { lte: String(min) };
            }
        }

        if (insideAmenities) {
            const amenities = (insideAmenities as string).split(",");
            where.insideAmenities = { hasEvery: amenities };
        }

        if (outsideAmenities) {
            const amenities = (outsideAmenities as string).split(",");
            where.outsideAmenities = { hasEvery: amenities };
        }

        const listings = await prisma.property.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        res.json({ listings });
    } catch (error) {
        console.error("Error in /filters:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Near Me - Search properties within 10km radius
export const searchNearMe = async (req: Request, res: Response) => {
    const { latitude, longitude, propertyType, radius = 10 } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
        return res.status(400).json({ 
            success: false, 
            message: "latitude and longitude are required for Near Me search" 
        });
    }

    const userLat = parseFloat(latitude as string);
    const userLon = parseFloat(longitude as string);
    const searchRadius = parseFloat(radius as string);

    if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid latitude or longitude" 
        });
    }

    try {
        // Build where clause
        const where: any = {
            isAvailable: true,
            isDraft: false,
            latitude: { not: null },
            longitude: { not: null },
        };

        if (propertyType) {
            where.propertyType = propertyType;
        }

        // Fetch all properties with coordinates
        const allProperties = await prisma.property.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        // Filter by distance
        const nearbyProperties = allProperties.filter((property) => {
            if (!property.latitude || !property.longitude) return false;
            
            const distance = getDistance(
                userLat,
                userLon,
                parseFloat(String(property.latitude)),
                parseFloat(String(property.longitude))
            );
            
            return distance <= searchRadius;
        });

        // Get images for nearby properties
        const imageCategories = ["first", "second", "third", "fourth", "fifth"];
        const propertiesWithImages = await Promise.all(
            nearbyProperties.map(async (property) => {
                const imageUrls = await getListingImageUrls(property.id, imageCategories);
                const rentValue = parseFloat(property.rent || "0");
                
                // Calculate distance from user
                const distance = getDistance(
                    userLat,
                    userLon,
                    parseFloat(String(property.latitude)),
                    parseFloat(String(property.longitude))
                );
                
                return {
                    ...property,
                    rentValue,
                    coverImage: imageUrls[0] || null,
                    imageUrls,
                    distance: parseFloat(distance.toFixed(2)), // Distance in km
                };
            })
        );

        // Sort by distance (closest first)
        propertiesWithImages.sort((a, b) => a.distance - b.distance);

        return res.json({ 
            success: true, 
            message: `Found ${propertiesWithImages.length} properties within ${searchRadius}km`,
            data: propertiesWithImages,
            userLocation: { latitude: userLat, longitude: userLon },
            searchRadius: searchRadius
        });
    } catch (error) {
        console.error("Error in Near Me search:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};
