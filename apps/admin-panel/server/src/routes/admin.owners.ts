import { Router } from 'express';
import * as ownersController from '../controllers/admin.owners.controllers';
import { authenticateAdmin, checkPermission } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

router.get('/', checkPermission('canViewOwners'), ownersController.getAllOwners);
router.get('/:id', checkPermission('canViewOwners'), ownersController.getOwnerById);
router.put('/:id', checkPermission('canHandleOwners'), ownersController.updateOwner);
router.delete('/:id', checkPermission('canHandleOwners'), ownersController.deleteOwner);

export default router;
