import { Request, Response } from 'express';
import { prisma } from '@repo/db/prisma';
import getDistance from '../utils/geoUtils';
import { getObjectURL } from '../utils/s3client';
import axios from 'axios';

// Google Maps API Key (store in environment variables)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const getAddressFromCoordinates = async (latitude : any, longitude : any) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }

    console.warn("Geocode API returned:", response.data.status);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};


export const nearMeController = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, type } = req.query as {
            latitude?: string;
            longitude?: string;
            type?: string;
        };

        if (!latitude || !longitude || !type) {
            return res.status(400).json({ error: 'Latitude, longitude, and property type are required' });
        }

        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);

        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({ error: 'Invalid latitude or longitude' });
        }

        // Adjust field names/types as per your schema
        const properties = await prisma.property.findMany({
            where: {
                isAvailable: true,
                isDraft: false,
                propertyType: type as any, // Cast to expected enum/type if you are sure it's valid
            },
        });

        const nearbyProperties = await Promise.all(
            properties
                .filter(property => {
                    const propLat = parseFloat(property.latitude as any);
                    const propLng = parseFloat(property.longitude as any);
                    if (isNaN(propLat) || isNaN(propLng)) return false;
                    const distance = getDistance(userLat, userLng, propLat, propLng);
                    return distance <= 15;
                })
                .map(async property => {
                    const propertyType = property.propertyType
                    let imageKey = `images/${propertyType}/${property.id}/inside.jpeg`;
                    let imageUrl: string | null = null;
                    try {
                        imageUrl = await getObjectURL(imageKey);
                    } catch {
                        imageUrl = null;
                    }
                    return {
                        ...property,
                        propertyType,
                        image: imageUrl,
                    };
                })
        );

        return res.status(200).json({ nearbyProperties, message: "Listing fetched successfully" });
    } catch (error) {
        console.error('Error in near-me endpoint:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const reverseGeocodeController = async (req: Request, res: Response) => {
try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
      return;
    }

    // Check if Google Maps API key is available
    if (!GOOGLE_MAPS_API_KEY) {
      res.status(503).json({
        success: false,
        message: 'Reverse geocoding service unavailable - API key not configured'
      });
      return;
    }

    const address = await getAddressFromCoordinates(parseFloat(latitude), parseFloat(longitude));

    if (!address) {
      res.status(400).json({
        success: false,
        message: 'Unable to get address for provided coordinates'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
