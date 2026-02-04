import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@repo/db';
import { AdminAuthRequest, logActivity } from '../middleware/auth';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  permissions: z.object({
    canViewUsers: z.boolean().optional(),
    canViewOwners: z.boolean().optional(),
    canViewProperties: z.boolean().optional(),
    canEditProperties: z.boolean().optional(),
    canVerifyProperties: z.boolean().optional(),
    canHandleUsers: z.boolean().optional(),
    canHandleOwners: z.boolean().optional(),
    canViewReports: z.boolean().optional(),
  }),
});

export const getAllEmployees = async (req: AdminAuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const active = req.query.active as string;

    const where: any = { role: 'EMPLOYEE' };
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const [employees, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          permissions: true,
        },
      }),
      prisma.admin.count({ where }),
    ]);

    res.json({
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        permissions: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get verification stats for this employee
    const verificationStats = await prisma.verificationRequest.groupBy({
      by: ['status'],
      where: {
        OR: [
          { assignedTo: id },
          { reviewedBy: id },
        ],
      },
      _count: true,
    });

    res.json({ 
      employee,
      verificationStats,
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: AdminAuthRequest, res: Response) => {
  try {
    const data = createEmployeeSchema.parse(req.body);

    // Check if employee already exists
    const existingEmployee = await prisma.admin.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const employee = await prisma.admin.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'EMPLOYEE',
        assignedBy: req.admin!.id,
        permissions: {
          create: {
            ...data.permissions,
            canViewDashboard: true,
          },
        },
      },
      include: {
        permissions: true,
      },
    });

    await logActivity(
      req.admin!.id,
      'CREATED_EMPLOYEE',
      'ADMIN',
      employee.id,
      `Created employee: ${employee.email}`
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: employee.id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        permissions: employee.permissions,
      },
    });
  } catch (error) {
    console.error('Create employee error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, isActive } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const employee = await prisma.admin.update({
      where: { id },
      data: updateData,
    });

    await logActivity(
      req.admin!.id,
      'UPDATED_EMPLOYEE',
      'ADMIN',
      id,
      `Updated employee: ${employee.email}`
    );

    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

export const updateEmployeePermissions = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const permissions = req.body;

    const employee = await prisma.admin.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (employee.role !== 'EMPLOYEE') {
      return res.status(400).json({ error: 'Cannot update permissions for non-employee' });
    }

    let updatedPermissions;
    if (employee.permissions) {
      updatedPermissions = await prisma.employeePermission.update({
        where: { adminId: id },
        data: permissions,
      });
    } else {
      updatedPermissions = await prisma.employeePermission.create({
        data: {
          adminId: id,
          ...permissions,
        },
      });
    }

    await logActivity(
      req.admin!.id,
      'UPDATED_EMPLOYEE_PERMISSIONS',
      'ADMIN',
      id,
      `Updated permissions for ${employee.email}`
    );

    res.json({ 
      message: 'Employee permissions updated successfully', 
      permissions: updatedPermissions 
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Failed to update employee permissions' });
  }
};

export const deleteEmployee = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.admin.findUnique({ where: { id } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (employee.role !== 'EMPLOYEE') {
      return res.status(400).json({ error: 'Cannot delete non-employee admin' });
    }

    await prisma.admin.delete({ where: { id } });

    await logActivity(
      req.admin!.id,
      'DELETED_EMPLOYEE',
      'ADMIN',
      id,
      `Deleted employee: ${employee.email}`
    );

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};
