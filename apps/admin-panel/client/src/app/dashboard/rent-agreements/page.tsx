'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2
} from 'lucide-react';

export default function RentAgreementsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    paymentStatus: '',
  });
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rent-agreements', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters,
      });
      const response = await apiClient.get(`/admin/rent-agreements?${params}`);
      return response.data;
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, paymentStatus, paymentTransactionId }: any) => {
      await apiClient.patch(`/admin/rent-agreements/${id}/payment`, { 
        paymentStatus, 
        paymentTransactionId 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-agreements'] });
      alert('Payment status updated successfully');
      setSelectedAgreement(null);
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, documentStatus }: any) => {
      await apiClient.patch(`/admin/rent-agreements/${id}/document`, { documentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-agreements'] });
      alert('Document status updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/rent-agreements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-agreements'] });
      alert('Rent agreement deleted successfully');
    },
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'SENT':
        return 'bg-purple-100 text-purple-800';
      case 'GENERATED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rent Agreements</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage all rent agreements on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search by owner, tenant, or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agreements List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agreement Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.agreements?.map((agreement: any) => (
                  <tr key={agreement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-10 w-10 text-indigo-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {agreement.agreementDuration} months
                          </div>
                          <div className="text-sm text-gray-500">
                            Start: {new Date(agreement.rentStartDate).toLocaleDateString('en-IN')}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {agreement.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {agreement.ownerFullName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {agreement.ownerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {agreement.tenantFullName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {agreement.tenantPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{parseInt(agreement.rentAmount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Deposit: ₹{parseInt(agreement.securityDeposit).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(agreement.paymentStatus)}`}>
                        {agreement.paymentStatus}
                      </span>
                      {agreement.paymentTransactionId && (
                        <div className="text-xs text-gray-400 mt-1">
                          TXN: {agreement.paymentTransactionId.slice(0, 12)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocumentStatusColor(agreement.documentStatus)}`}>
                        {agreement.documentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedAgreement(agreement)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this rent agreement?')) {
                              deleteMutation.mutate(agreement.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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

        {/* Pagination */}
        {data?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{data.pagination.totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Agreement Details</h2>
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Owner Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedAgreement.ownerFullName}</p>
                      <p><span className="font-medium">Phone:</span> {selectedAgreement.ownerPhone}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Address:</span> {selectedAgreement.ownerAddress}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Tenant Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedAgreement.tenantFullName}</p>
                      <p><span className="font-medium">Phone:</span> {selectedAgreement.tenantPhone}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Address:</span> {selectedAgreement.tenantPermanentAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Property & Financial Details */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Property Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedAgreement.propertyAddress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Monthly Rent</p>
                    <p className="text-xl font-bold text-indigo-600">
                      ₹{parseInt(selectedAgreement.rentAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Security Deposit</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{parseInt(selectedAgreement.securityDeposit).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <p className="text-xl font-bold text-purple-600">
                      {selectedAgreement.agreementDuration} months
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Notice Period</p>
                    <p className="text-xl font-bold text-orange-600">
                      {selectedAgreement.noticePeriod} months
                    </p>
                  </div>
                </div>

                {/* Annexures */}
                {selectedAgreement.annexures && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Annexures (Items Included)</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedAgreement.annexures}</p>
                    </div>
                  </div>
                )}

                {/* Update Payment Status */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Payment Status</h3>
                  <div className="flex gap-3">
                    <select
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedAgreement.paymentStatus}
                      onChange={(e) => setSelectedAgreement({
                        ...selectedAgreement,
                        paymentStatus: e.target.value
                      })}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="FAILED">Failed</option>
                    </select>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Transaction ID (optional)"
                      value={selectedAgreement.paymentTransactionId || ''}
                      onChange={(e) => setSelectedAgreement({
                        ...selectedAgreement,
                        paymentTransactionId: e.target.value
                      })}
                    />
                    <button
                      onClick={() => updatePaymentMutation.mutate({
                        id: selectedAgreement.id,
                        paymentStatus: selectedAgreement.paymentStatus,
                        paymentTransactionId: selectedAgreement.paymentTransactionId
                      })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Update Payment
                    </button>
                  </div>
                </div>

                {/* Update Document Status */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Document Status</h3>
                  <div className="flex gap-3">
                    <select
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedAgreement.documentStatus}
                      onChange={(e) => {
                        updateDocumentMutation.mutate({
                          id: selectedAgreement.id,
                          documentStatus: e.target.value
                        });
                      }}
                    >
                      <option value="GENERATED">Generated</option>
                      <option value="SENT">Sent</option>
                      <option value="SIGNED">Signed</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 border-t pt-4">
                  <p>Created: {new Date(selectedAgreement.createdAt).toLocaleString('en-IN')}</p>
                  <p>Updated: {new Date(selectedAgreement.updatedAt).toLocaleString('en-IN')}</p>
                  <p>Created By: {selectedAgreement.createdBy} ({selectedAgreement.creatorPhone})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
