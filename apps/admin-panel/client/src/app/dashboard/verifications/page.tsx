'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import Link from 'next/link';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

export default function VerificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['verification-requests', page, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedStatus && { status: selectedStatus }),
      });
      const response = await apiClient.get(`/admin/verifications?${params}`);
      return response.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, approved, notes }: { id: string; approved: boolean; notes: string }) => {
      await apiClient.post(`/admin/verifications/${id}/review`, { approved, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
      alert('Verification request reviewed successfully');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'PAYMENT_COMPLETED':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_PAYMENT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickReview = (id: string, approved: boolean) => {
    const notes = prompt(`Enter notes for ${approved ? 'approval' : 'rejection'}:`);
    if (notes !== null) {
      reviewMutation.mutate({ id, approved, notes });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage property verification requests
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <label className="block text-sm font-medium text-gray-700">
            Status Filter:
          </label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAYMENT_COMPLETED">Payment Completed</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.requests?.map((request: any) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {request.property.images?.[0] && (
                          <img
                            src={request.property.images[0]}
                            alt={request.property.title}
                            className="h-10 w-10 rounded-md object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.property.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.property.owner.firstName} {request.property.owner.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.property.owner.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {request.verificationLatitude && request.verificationLongitude ? (
                        <div className="text-sm">
                          <div className="text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Yes
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs truncate" title={request.verificationAddress}>
                            {request.verificationAddress}
                          </div>
                          <div className="text-xs text-gray-400">
                            {request.verificationLatitude.toFixed(6)}, {request.verificationLongitude.toFixed(6)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Not captured</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{request.amount}</div>
                      <div className={`text-xs ${
                        request.paymentStatus === 'COMPLETED' 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        {request.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/properties/${request.property.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        {request.status !== 'APPROVED' && request.status !== 'REJECTED' && (
                          <>
                            <button
                              onClick={() => handleQuickReview(request.id, true)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleQuickReview(request.id, false)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{data.pagination.totalPages}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
