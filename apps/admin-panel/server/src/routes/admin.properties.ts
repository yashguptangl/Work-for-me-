import { Router } from 'express';
import * as propertiesController from '../controllers/admin.properties.controllers';
import { authenticateAdmin, checkPermission } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

router.get('/', checkPermission('canViewProperties'), propertiesController.getAllProperties);
router.get('/stats', checkPermission('canViewProperties'), propertiesController.getPropertyStats);
router.get('/:id', checkPermission('canViewProperties'), propertiesController.getPropertyById);
router.put('/:id', checkPermission('canEditProperties'), propertiesController.updateProperty);
router.post('/:id/verify', checkPermission('canVerifyProperties'), propertiesController.verifyProperty);
router.delete('/:id', checkPermission('canEditProperties'), propertiesController.deleteProperty);

export default router;
