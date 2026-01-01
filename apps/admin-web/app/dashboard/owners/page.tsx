"use client";
import { useEffect, useState } from "react";
import { Users, Loader2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

export default function OwnersPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadOwners();
  }, [page]);

  const loadOwners = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getAllOwners(page, 20);
      if (response.success) {
        setOwners(response.data.owners);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error("Failed to load owners");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (ownerId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete owner: ${email}?`)) return;

    try {
      await adminApi.deleteOwner(ownerId);
      toast.success("Owner deleted successfully");
      loadOwners();
    } catch (error) {
      toast.error("Failed to delete owner");
    }
  };

  const filteredOwners = owners.filter(
    (owner) =>
      owner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owners Management</h1>
              <p className="text-sm text-gray-600">Manage property owners</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search owners by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Owners Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading owners...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Properties
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOwners.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No owners found
                        </td>
                      </tr>
                    ) : (
                      filteredOwners.map((owner) => (
                        <tr key={owner.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {owner.firstName} {owner.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{owner.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {owner.phone || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {owner._count?.properties || 0} Properties
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                owner.isVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {owner.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(owner.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => handleDelete(owner.id, owner.email)}
                              className="text-red-600 hover:text-red-900 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} owners
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}