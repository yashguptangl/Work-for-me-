"use client";
import { useEffect, useState } from "react";
import { Home, Loader2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadProperties();
  }, [page]);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getAllProperties(page, 20);
      if (response.success) {
        setProperties(response.data.properties);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete property: ${title}?`)) return;

    try {
      await adminApi.deleteProperty(propertyId);
      toast.success("Property deleted successfully");
      loadProperties();
    } catch (error) {
      toast.error("Failed to delete property");
    }
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "PENDING_VERIFICATION":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Properties Management</h1>
              <p className="text-sm text-gray-600">Manage all property listings</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search properties by title, address, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Properties Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No properties found
                        </td>
                      </tr>
                    ) : (
                      filteredProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {property.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {property.address}, {property.city}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {property.owner?.firstName} {property.owner?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{property.owner?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.propertyType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            ₹{property.rentAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                property.verificationStatus
                              )}`}
                            >
                              {property.verificationStatus?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                property.isAvailable
                                  ? "bg-green-100 text-green-800"
                                  : property.isDraft
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {property.isDraft ? "Draft" : property.isAvailable ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => handleDelete(property.id, property.title)}
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
                  {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} properties
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