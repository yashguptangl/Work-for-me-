import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";

export const userContactController = async (req: Request, res: Response) => {
    try {
        const { userName, userPhone, propertyId, message, contactType } = req.body;

        // Verify property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        const contact = await prisma.contact.create({
            data: {
                userName,
                userPhone,
                propertyId,
                message: message || `Interested in ${property.title}`,
                contactType: contactType || 'INQUIRY',
                status: 'NEW'
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        rent: true,
                        propertyType: true,
                        contactName: true,
                        whatsappNo: true
                    }
                }
            }
        });

        // Increment contact count on property
        await prisma.property.update({
            where: { id: propertyId },
            data: { contactCount: { increment: 1 } }
        });

        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: contact
        });
    } catch (error: any) {
        console.error("Error creating contact:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to create contact" 
        });
    }
};


export const userContactDeleted = async (req: Request, res: Response) => {
     try {
        const { id } = req.params as { id: string };

        const contactLog = await prisma.contact.findUnique({
            where: { id }
        });

        if (!contactLog) {
            return res.status(404).json({ 
                success: false, 
                message: "Contact not found" 
            });
        }

        await prisma.contact.update({
            where: { id },
            data: { userDeleted: true }
        });

        res.status(200).json({ 
            success: true, 
            message: "Contact deleted successfully" 
        });
    } catch (error: any) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to delete contact"
        });
    }
};


export const ownerContactDeleted = async (req : Request , res: Response) =>{
     try {
        const { id } = req.params as { id: string };

        const contactLog = await prisma.contact.findUnique({
            where: { id }
        });

        if (!contactLog) {
            return res.status(404).json({ 
                success: false, 
                message: "Contact not found" 
            });
        }

        await prisma.contact.update({
            where: { id },
            data: { ownerDeleted: true }
        });

        res.status(200).json({ 
            success: true, 
            message: "Contact deleted successfully" 
        });
    } catch (error: any) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to delete contact"
        });
    }
};

export const userContactFullDetails = async (req: Request, res: Response) => {
    try {
        // Get user info from auth middleware
        const userId = (req as any).user?.userId;
        const userPhone = (req as any).user?.phone;

        if (!userPhone) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User not found"
            });
        }

        const contacts = await prisma.contact.findMany({
            where: { 
                userPhone,
                userDeleted: false
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        townSector: true,
                        address: true,
                        rent: true,
                        salePrice: true,
                        listingType: true,
                        propertyType: true,
                        contactName: true,
                        whatsappNo: true,
                        isAvailable: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            data: contacts
        });

    } catch (error: any) {
        console.error("Error fetching user contacts:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch contacts"
        });
    }
};

export const ownerContactFullDetails = async (req: Request , res: Response) =>{
    try {
        // Get owner info from auth middleware
        const ownerId = (req as any).user?.userId;

        if (!ownerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Owner not found"
            });
        }

        // Get all contacts for properties owned by this owner
        const contacts = await prisma.contact.findMany({
            where: {
                property: {
                    ownerId: ownerId
                },
                ownerDeleted: false
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        townSector: true,
                        address: true,
                        rent: true,
                        salePrice: true,
                        listingType: true,
                        propertyType: true,
                        isAvailable: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            data: contacts
        });

    } catch(error: any) {
        console.error("Error fetching owner contacts:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch contacts"
        });
    }
};


export const generalContacts = async (req: Request , res: Response) =>{
    try {
        const {name , email , phone , message} = req.body;

        const contacts = await prisma.contactUs.create({
            data: {
                name,
                email,
                phone,
                message
            }
        });
        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error("Error fetching owner contacts:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts"
        });
    }
};