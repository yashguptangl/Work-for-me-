import { Router } from 'express';
import * as employeesController from '../controllers/admin.employees.controllers';
import { authenticateAdmin, requireMainAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

// Define the POST route for creating an employee
router.post('/', requireMainAdmin, employeesController.createEmployee);

// Define the GET route for fetching all employees
router.get('/', employeesController.getAllEmployees);

// Define other routes as needed
// Example: router.get('/', employeesController.getAllEmployees);

export default router;