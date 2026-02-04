'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { UserPlus, Edit, Trash2, Eye } from 'lucide-react';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const admin = useAuthStore((state) => state.admin);
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/employees?page=${page}&limit=20`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.post('/admin/employees', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowCreateModal(false);
      alert('Employee created successfully');
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: any }) => {
      await apiClient.put(`/admin/employees/${id}/permissions`, permissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setSelectedEmployee(null);
      alert('Permissions updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      alert('Employee deleted successfully');
    },
  });

  if (admin?.role !== 'MAIN_ADMIN') {
    return (
      <div className="p-8">
        <p className="text-red-600">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage employee accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Employees List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.employees?.map((employee: any) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email}</div>
                      <div className="text-sm text-gray-500">{employee.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.lastLogin 
                        ? new Date(employee.lastLogin).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Permissions"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this employee?')) {
                              deleteMutation.mutate(employee.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data: any) => createMutation.mutate(data)}
        />
      )}

      {/* Edit Permissions Modal */}
      {selectedEmployee && (
        <EditPermissionsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSubmit={(permissions: any) => 
            updatePermissionsMutation.mutate({ 
              id: selectedEmployee.id, 
              permissions 
            })
          }
        />
      )}
    </div>
  );
}

function CreateEmployeeModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    permissions: {
      canViewUsers: false,
      canViewOwners: false,
      canViewProperties: false,
      canEditProperties: false,
      canVerifyProperties: false,
      canHandleUsers: false,
      canHandleOwners: false,
      canViewReports: false,
    },
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-semibold mb-4">Create New Employee</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="First Name"
              className="px-3 py-2 border rounded-md"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="px-3 py-2 border rounded-md"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 border rounded-md"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              className="px-3 py-2 border rounded-md"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="px-3 py-2 border rounded-md col-span-2"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Permissions</h4>
            <div className="space-y-2">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, [key]: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPermissionsModal({ employee, onClose, onSubmit }: any) {
  const [permissions, setPermissions] = useState(employee.permissions || {});

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-semibold mb-4">
          Edit Permissions - {employee.firstName} {employee.lastName}
        </h3>
        <div className="space-y-2 mb-4">
          {Object.entries(permissions).map(([key, value]: [string, any]) => (
            key !== 'id' && key !== 'adminId' && key !== 'createdAt' && key !== 'updatedAt' && (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            )
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(permissions)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
