import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '@repo/db/prisma';
import { authenticateAdmin, requirePermission } from '../middleware/auth.middleware';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Get all properties with filters
router.get('/', 
  requirePermission('VIEW_PROPERTIES'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PENDING', 'VERIFIED', 'REJECTED']),
    query('city').optional().isString().trim(),
    query('propertyType').optional().isIn(['ROOM', 'PG', 'FLAT']),
    query('search').optional().isString().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid query parameters', 
          details: errors.array() 
        });
      }

      const {
        page = 1,
        limit = 20,
        status,
        city,
        propertyType,
        search
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause
      const where: any = {
        ownerDeleted: false
      };

      if (status) {
        if (status === 'VERIFIED') {
          where.verificationStatus = 'VERIFIED';
        } else if (status === 'PENDING') {
          where.verificationStatus = { in: ['PENDING_PAYMENT', 'PENDING_VERIFICATION'] };
        } else if (status === 'REJECTED') {
          where.verificationStatus = 'REJECTED';
        } else if (status === 'ACTIVE') {
          where.isAvailable = true;
          where.isDraft = false;
        } else if (status === 'INACTIVE') {
          where.OR = [
            { isAvailable: false },
            { isDraft: true }
          ];
        }
      }

      if (city) {
        where.city = { contains: city as string, mode: 'insensitive' };
      }

      if (propertyType) {
        where.propertyType = propertyType;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { address: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isVerified: true
              }
            },
            _count: {
              select: {
                contacts: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.property.count({ where })
      ]);

      res.json({
        properties: properties.map(property => ({
          id: property.id,
          title: property.title,
          propertyType: property.propertyType,
          city: property.city,
          townSector: property.townSector,
          rent: property.rent,
          isAvailable: property.isAvailable,
          isDraft: property.isDraft,
          verificationStatus: property.verificationStatus || 'NOT_VERIFIED',
          verificationExpiry: property.verificationExpiry,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          contactsCount: property._count.contacts,
          owner: {
            id: property.owner.id,
            name: `${property.owner.firstName} ${property.owner.lastName}`,
            email: property.owner.email,
            phone: property.owner.phone,
            isVerified: property.owner.isVerified
          }
        })),
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
          limit: Number(limit)
        }
      });

    } catch (error: any) {
      console.error('Get properties error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single property details
router.get('/:id',
  requirePermission('VIEW_PROPERTIES'),
  [
    param('id').isUUID().withMessage('Valid property ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid property ID', 
          details: errors.array() 
        });
      }

      const property = await prisma.property.findUnique({
        where: { 
          id: req.params.id,
          ownerDeleted: false 
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isVerified: true,
              createdAt: true
            }
          },
          contacts: {
            select: {
              id: true,
              userName: true,
              userPhone: true,
              userEmail: true,
              createdAt: true,
              status: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Get property images
      const categories = ["first", "second", "third", "fourth", "fifth"];
      const bucket = process.env.AWS_BUCKET_NAME || '';
      const images = bucket
        ? categories.map(category => `https://${bucket}.s3.amazonaws.com/images/${property.id}/${category}.jpeg`)
        : [];

      res.json({
        ...property,
        images,
        owner: {
          id: property.owner.id,
          name: `${property.owner.firstName} ${property.owner.lastName}`,
          email: property.owner.email,
          phone: property.owner.phone,
          isVerified: property.owner.isVerified,
          joinDate: property.owner.createdAt
        }
      });

    } catch (error: any) {
      console.error('Get property details error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update property status
router.patch('/:id/status',
  requirePermission('EDIT_PROPERTIES'),
  [
    param('id').isUUID(),
    body('isAvailable').optional().isBoolean(),
    body('isDraft').optional().isBoolean(),
    body('verificationStatus').optional().isIn(['NOT_VERIFIED', 'PENDING_PAYMENT', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'EXPIRED'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: errors.array() 
        });
      }

      const { isAvailable, isDraft, verificationStatus } = req.body;
      const propertyId = req.params.id;

      const updateData: any = {};

      if (typeof isAvailable === 'boolean') {
        updateData.isAvailable = isAvailable;
      }

      if (typeof isDraft === 'boolean') {
        updateData.isDraft = isDraft;
      }

      if (verificationStatus) {
        updateData.verificationStatus = verificationStatus;
        
        if (verificationStatus === 'VERIFIED') {
          // Set verification expiry to 1 year from now
          updateData.verificationExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        } else if (verificationStatus === 'REJECTED') {
          updateData.verificationExpiry = null;
        }
      }

      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: updateData,
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: req.admin!.adminId,
          action: 'UPDATE_PROPERTY_STATUS',
          targetType: 'PROPERTY',
          targetId: propertyId,
          details: JSON.stringify({
            changes: updateData,
            propertyTitle: updatedProperty.title
          })
        }
      });

      res.json({
        message: 'Property updated successfully',
        property: {
          id: updatedProperty.id,
          title: updatedProperty.title,
          isAvailable: updatedProperty.isAvailable,
          isDraft: updatedProperty.isDraft,
          verificationStatus: updatedProperty.verificationStatus,
          verificationExpiry: updatedProperty.verificationExpiry
        }
      });

    } catch (error: any) {
      console.error('Update property status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Edit property details
router.patch('/:id',
  requirePermission('EDIT_PROPERTIES'),
  [
    param('id').isUUID(),
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isString().trim().isLength({ min: 1, max: 2000 }),
    body('rent').optional().isString().isLength({ min: 1 }),
    body('security').optional().isString(),
    body('maintenance').optional().isString(),
    body('address').optional().isString().trim().isLength({ min: 1, max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: errors.array() 
        });
      }

      const propertyId = req.params.id;
      const allowedFields = [
        'title', 'description', 'rent', 'security', 
        'maintenance', 'address', 'furnished', 'accommodation'
      ];

      const updateData: any = {};
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key) && req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const originalProperty = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { title: true, description: true, rent: true }
      });

      if (!originalProperty) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: updateData
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: req.admin!.adminId,
          action: 'EDIT_PROPERTY',
          targetType: 'PROPERTY',
          targetId: propertyId,
          details: JSON.stringify({
            originalData: originalProperty,
            changes: updateData
          })
        }
      });

      res.json({
        message: 'Property updated successfully',
        property: updatedProperty
      });

    } catch (error: any) {
      console.error('Edit property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete property (soft delete)
router.delete('/:id',
  requirePermission('DELETE_PROPERTIES'),
  [
    param('id').isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid property ID', 
          details: errors.array() 
        });
      }

      const propertyId = req.params.id;

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { title: true, ownerId: true }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Soft delete
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          ownerDeleted: true,
          deletedAt: new Date()
        }
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: req.admin!.adminId,
          action: 'DELETE_PROPERTY',
          targetType: 'PROPERTY',
          targetId: propertyId,
          details: JSON.stringify({
            propertyTitle: property.title,
            ownerId: property.ownerId
          })
        }
      });

      res.json({ message: 'Property deleted successfully' });

    } catch (error: any) {
      console.error('Delete property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;