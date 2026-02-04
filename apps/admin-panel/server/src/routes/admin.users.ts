import { Router } from 'express';
import * as usersController from '../controllers/admin.users.controllers';
import { authenticateAdmin, checkPermission } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

router.get('/', checkPermission('canViewUsers'), usersController.getAllUsers);
router.get('/:id', checkPermission('canViewUsers'), usersController.getUserById);
router.put('/:id', checkPermission('canHandleUsers'), usersController.updateUser);
router.delete('/:id', checkPermission('canHandleUsers'), usersController.deleteUser);

export default router;
