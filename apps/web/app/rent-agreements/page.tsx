'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Calendar, 
  Home, 
  User, 
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Download,
  Eye,
  X
} from 'lucide-react';

interface RentAgreement {
  id: string;
  createdBy: string;
  creatorPhone: string;
  ownerFullName: string;
  ownerPhone: string;
  ownerAddress: string;
  tenantFullName: string;
  tenantPhone: string;
  tenantPermanentAddress: string;
  propertyAddress: string;
  rentAmount: string;
  securityDeposit: string;
  agreementDuration: string;
  noticePeriod: string;
  rentStartDate: string;
  paymentStatus: string;
  createdAt: string;
  annexures?: string | null;
}

export default function RentAgreementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<RentAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgreement, setSelectedAgreement] = useState<RentAgreement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary');
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const fetchAgreements = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rent-agreements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agreements');
      }

      const data = await response.json();
      if (data.success) {
        setAgreements(data.data);
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAgreements();
  }, [user, router, fetchAgreements]);

  const handleDownloadPDF = async () => {
    if (!selectedAgreement) return;

    try {
      setDownloadingPDF(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please login to download agreement');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rent-agreements/${selectedAgreement.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rent_Agreement_${selectedAgreement.ownerFullName}_${selectedAgreement.tenantFullName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('PDF downloaded successfully! ✅');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Completed</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm font-medium">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Pending</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-medium">
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleViewDetails = (agreement: RentAgreement) => {
    setSelectedAgreement(agreement);
    setViewMode('summary');
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-3">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-gray-600">Loading your rent agreements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-4 sm:py-6 md:py-8 lg:py-12 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start md:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">My Rent Agreements</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 line-clamp-2">
                {user?.role === 'OWNER' 
                  ? 'Manage your rental agreements as a property owner' 
                  : 'Manage your rental agreements as a tenant'}
              </p>
              {user?.phone && (
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-600 mt-1 truncate">
                  📱 Showing: {user.phone}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/rent-agreement')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base font-medium flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Create New</span>
            </button>
          </div>
        </div>

        {/* Agreements Count */}
        {agreements.length > 0 && (
          <div className="mb-3 sm:mb-4 md:mb-6 px-0.5">
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              Found <span className="font-semibold text-blue-600">{agreements.length}</span> agreement{agreements.length > 1 ? 's' : ''} linked to your account
            </p>
          </div>
        )}

        {/* Agreements List */}
        {agreements.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 text-center">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-2 sm:mb-3 md:mb-4" />
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1.5 sm:mb-2">No Rent Agreements Yet</h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-5 md:mb-6 max-w-md mx-auto">
              You haven&apos;t created any rent agreements with your mobile number yet.
              <br className="hidden sm:block" />
              Create your first rent agreement to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {agreements.map((agreement) => {
              // Determine user's role in this agreement
              const isOwner = agreement.ownerPhone === user?.phone;
              const isTenant = agreement.tenantPhone === user?.phone;
              // const isCreator = agreement.creatorPhone === user?.phone;
              
              return (
                <div
                  key={agreement.id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-100"
                >
                  {/* Status Badge and Role */}
                  <div className="flex justify-between items-start mb-2.5 sm:mb-3 md:mb-4">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
                    <div className="flex flex-col items-end gap-1 sm:gap-1.5 md:gap-2">
                      {getStatusBadge(agreement.paymentStatus)}
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium whitespace-nowrap">
                        {isOwner ? '👤 Owner' : isTenant ? '🏠 Tenant' : '📝 Creator'}
                      </span>
                    </div>
                  </div>

                  {/* Property Address */}
                  <div className="mb-2.5 sm:mb-3 md:mb-4">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-900 line-clamp-2">
                        {agreement.propertyAddress}
                      </p>
                    </div>
                  </div>

                  {/* Owner & Tenant */}
                  <div className="space-y-1 sm:space-y-1.5 md:space-y-2 mb-2.5 sm:mb-3 md:mb-4">
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">Owner:</span>
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 truncate">{agreement.ownerFullName}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">Tenant:</span>
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 truncate">{agreement.tenantFullName}</span>
                    </div>
                  </div>

                  {/* Rent Amount */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 md:mb-4 p-2 sm:p-2.5 md:p-3 bg-blue-50 rounded-lg">
                    <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-600">Monthly Rent</p>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-blue-600 truncate">₹{agreement.rentAmount}</p>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-2.5 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm text-gray-500">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">Created {formatDate(agreement.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleViewDetails(agreement)}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap"
                    >
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-3 md:p-4 z-[9999] overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col my-4">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 md:p-5 z-10 flex-shrink-0">
              <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold truncate">
                      {viewMode === 'summary' ? 'Agreement Summary' : 'Full Agreement Document'}
                    </h2>
                    <p className="text-blue-100 text-[10px] sm:text-xs truncate">ID: {selectedAgreement.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setViewMode('summary');
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setViewMode('summary')}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    viewMode === 'summary'
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  Summary View
                </button>
                <button
                  onClick={() => setViewMode('full')}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    viewMode === 'full'
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  Full Agreement
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1">
              {viewMode === 'summary' ? (
                <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5">
                  {/* Status */}
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 p-2.5 sm:p-3 md:p-4 bg-gray-50 rounded-lg">
                    <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">Payment Status</span>
                    {getStatusBadge(selectedAgreement.paymentStatus)}
                  </div>

                  {/* Property Details */}
                  <div className="border-l-4 border-blue-500 pl-2.5 sm:pl-3 md:pl-4 bg-blue-50 bg-opacity-30 py-2 rounded-r-lg">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">Property Details</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Address</p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-900 leading-relaxed break-words">{selectedAgreement.propertyAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner Details */}
                  <div className="border-l-4 border-purple-500 pl-2.5 sm:pl-3 md:pl-4 bg-purple-50 bg-opacity-30 py-2 rounded-r-lg">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">Owner Details</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Name</p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-900 break-words">{selectedAgreement.ownerFullName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Phone</p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-900 break-all">{selectedAgreement.ownerPhone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Address</p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-900 leading-relaxed break-words">{selectedAgreement.ownerAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tenant Details */}
                  <div className="border-l-4 border-pink-500 pl-2.5 sm:pl-3 md:pl-4 bg-pink-50 bg-opacity-30 py-2 rounded-r-lg">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">Tenant Details</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Name</p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-900 break-words">{selectedAgreement.tenantFullName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Phone</p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-900 break-all">{selectedAgreement.tenantPhone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">Permanent Address</p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-900 leading-relaxed break-words">{selectedAgreement.tenantPermanentAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="border-l-4 border-green-500 pl-2.5 sm:pl-3 md:pl-4 bg-green-50 bg-opacity-30 py-2 rounded-r-lg">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">Financial Terms</h3>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                      <div className="bg-white p-2 sm:p-2.5 md:p-3 rounded-lg">
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium mb-0.5 sm:mb-1">Monthly Rent</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold text-green-600">₹{selectedAgreement.rentAmount}</p>
                      </div>
                      <div className="bg-white p-2 sm:p-2.5 md:p-3 rounded-lg">
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium mb-0.5 sm:mb-1">Security Deposit</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold text-blue-600">₹{selectedAgreement.securityDeposit}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Terms */}
                  <div className="border-l-4 border-yellow-500 pl-2.5 sm:pl-3 md:pl-4 bg-yellow-50 bg-opacity-30 py-2 rounded-r-lg">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">Agreement Terms</h3>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                      <div className="bg-white p-2 sm:p-2.5 md:p-3 rounded-lg">
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium mb-0.5 sm:mb-1">Duration</p>
                        <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{selectedAgreement.agreementDuration} months</p>
                      </div>
                      <div className="bg-white p-2 sm:p-2.5 md:p-3 rounded-lg">
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium mb-0.5 sm:mb-1">Notice Period</p>
                        <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{selectedAgreement.noticePeriod} days</p>
                      </div>
                      <div className="col-span-1 xs:col-span-2 bg-white p-2 sm:p-2.5 md:p-3 rounded-lg">
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium mb-0.5 sm:mb-1">Start Date</p>
                        <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{formatDate(selectedAgreement.rentStartDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-2.5 sm:p-3 md:p-4 rounded-lg border border-blue-200">
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium mb-1">Created by</p>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 capitalize break-words">{selectedAgreement.createdBy}</p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 break-all">{selectedAgreement.creatorPhone}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-1.5">on {formatDate(selectedAgreement.createdAt)}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Download Button in Full Agreement View */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 z-10 shadow-sm">
                    <div className="max-w-4xl mx-auto">
                      {selectedAgreement.paymentStatus === 'COMPLETED' ? (
                        <button
                          onClick={handleDownloadPDF}
                          disabled={downloadingPDF}
                          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-lg transition-all text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl ${
                            downloadingPDF
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                          }`}
                        >
                          {downloadingPDF ? (
                            <>
                              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                              Generating PDF...
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                              <span className="text-black">Download Agreement PDF</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="w-full px-4 py-3 sm:py-3.5 bg-yellow-50 border-2 border-yellow-300 text-yellow-800 rounded-lg text-center text-sm sm:text-base font-medium">
                          <p className="flex items-center justify-center gap-2">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>PDF will be available after payment is completed</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Full Agreement Content */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div 
                      className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto"
                      style={{ userSelect: 'text' }}
                    >
                      <div className="text-center mb-3 sm:mb-4 md:mb-6">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 underline">RENTAL AGREEMENT</h2>
                      </div>

                      <div className="text-[11px] sm:text-xs md:text-sm text-gray-800 space-y-2 sm:space-y-3 md:space-y-4 leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                        <p>
                          THIS RENTAL AGREEMENT is executed at {selectedAgreement.propertyAddress.split(',').slice(-2).join(',').trim() || 'Location'} on {new Date(selectedAgreement.rentStartDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })} by and between <strong>{selectedAgreement.ownerFullName.toUpperCase()}</strong>, resident of {selectedAgreement.ownerAddress} (hereinafter jointly and severally called the &quot;LANDLORD&quot;, which expression shall include their heirs, legal representatives, successors and assigns of the one part).
                        </p>

                        <p>
                          AND <strong>{selectedAgreement.tenantFullName.toUpperCase()}</strong>, having permanent address at {selectedAgreement.tenantPermanentAddress}, and having (hereinafter called the &quot;TENANT&quot;, which expression shall include its legal representatives, successors and assigns of the other part).
                        </p>

                        <p>
                          WHEREAS the Landlord is the absolute owner of {selectedAgreement.propertyAddress}, consisting inbuilt fittings & fixtures and inventory of the equipments as detailed in Annexure-I, hereinafter referred to as &quot;Demised Premises&quot;.
                        </p>

                        <p className="font-bold">THIS DEED WITNESSETH AS FOLLOWS:</p>

                        <ol className="space-y-3" style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
                          <li>
                            The rent in respect of the &quot;Demised Premises&quot; shall commence from {new Date(selectedAgreement.rentStartDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })} and shall be valid till {new Date(new Date(selectedAgreement.rentStartDate).setMonth(new Date(selectedAgreement.rentStartDate).getMonth() + parseInt(selectedAgreement.agreementDuration || '11'))).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })} (hereinafter &quot;Rent Period&quot;). Thereafter, the same may be extended further on mutual consent of both the parties.
                          </li>
                          
                          <li>
                            That the Tenant shall pay to the Landlord a monthly rent of Rs. {selectedAgreement.rentAmount}/-. (hereinafter &quot;Rent&quot;). The rent shall be paid in advance monthly on or before 10th of every month. If the rent remains unpaid for one month and the Tenant does not pay the same despite service of a notice by the Landlord, the Landlord shall be entitled to immediately terminate this Agreement and take back possession of the Demised Premises immediately.
                          </li>
                          
                          <li>
                            That during the Rent period, in addition to the rental amount payable to the Landlord, the Tenant shall pay for the use of electricity, water and any other utilities as per actual bills received from the authorities concerned directly. Before vacating the Demised Premises on {new Date(new Date(selectedAgreement.rentStartDate).setMonth(new Date(selectedAgreement.rentStartDate).getMonth() + parseInt(selectedAgreement.agreementDuration || '11'))).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })}, Tenant must ensure that all dues of any utilities are cleared and no amounts remain unpaid. Dues of electricity and water before the Rent Period shall be paid and cleared by the Landlord.
                          </li>
                          
                          <li>
                            Servicing & repair of any appliances or fixtures provided by the Landlord will be the responsibility of the Tenant. Any Landlord provided appliances which have been damaged by Tenant will be replaced by the Tenant.
                          </li>
                          
                          <li>
                            The Tenant shall pay to the Landlord an interest-free refundable security deposit of Rs. {selectedAgreement.securityDeposit}/- (hereinafter &quot;Security Deposit&quot;). The said Security Deposit shall be refunded by the Landlord to the Tenant at the time of handing back possession of the Demised Premises by the Tenant on expiry or sooner termination of this Agreement. Landlord shall be entitled to adjust any dues of Rent, utilities or cost of damage to the Demised Premises caused by the Tenant except for normal wear & tear in the ordinary course of usage.
                          </li>
                          
                          <li>
                            That the Tenant shall not sublet, assign or part with the Demised Premises in whole or part thereof to any person in any circumstances whatsoever and the same shall be used for the bonafide residential purposes of the Tenant or the Tenant&apos;s family guests only.
                          </li>
                          
                          <li>
                            That the day-to-day minor repairs will be the responsibility of the Tenant at his/her own expense. However, any structural or major repairs, if so required, shall be carried out by the Landlord.
                          </li>
                          
                          <li>
                            That no structural additions or alterations shall be made by the Tenant to the Demised Premises without the prior written consent of the Landlord. However, the Tenant can install air-conditioners in the space provided and other electrical gadgets and make such changes for the purposes as may be necessary, at his own cost. The Landlord represents that the Premises possesses the adequate electrical infrastructure to cater for the electrical appliances including the air-conditioners. On termination or expiry of the tenancy or earlier, the Tenant will be entitled to remove such equipments and should restore the premises if any.
                          </li>
                          
                          <li>
                            That the Landlord shall have the right to visit or enter the Demised Premises in person or through his authorized agent(s), servants, workmen etc., for inspection (not exceeding once in a month) or to carry out repairs / construction, as and when required, by giving a 24 hours notice to the Tenant.
                          </li>
                          
                          <li>
                            That the Tenant shall comply with all the rules and regulations of the local authority or the resident welfare association as applicable to the Demised Premises.
                          </li>
                          
                          <li>
                            The Landlord shall pay for all property or other taxes/cesses levied on the Demised Premises by the local or government authorities. Further, any other payment in the nature of subscription or periodic fee to the welfare association shall be paid by the Landlord.
                          </li>
                          
                          <li>
                            That the Landlord will keep the Demised Premises free and harmless from any liens, claims, proceedings, demands or actions on his account and subject to payment of monthly rent and compliance with the terms of this Agreement the Tenant shall be entitled to enjoy peaceful possession of the Demised Premises.
                          </li>
                          
                          <li>
                            That this Rent Agreement cannot be terminated by either party for a period of {Math.floor(parseInt(selectedAgreement.agreementDuration || '11') / 30)} month(s) from the {new Date(selectedAgreement.rentStartDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })} (hereinafter &quot;Lock-in Period&quot;). If any party intends to terminate this Agreement during the Lock-in Period, it must pay the other Party, as compensation, an amount equal to the Rent for the remainder of the Lock-in Period. After the completion of lock-in-period, the Tenant can terminate the Rent Agreement by giving {Math.floor(parseInt(selectedAgreement.noticePeriod || '30') / 30)} month&apos;s notice to the Landlord or the rent in lieu of. After the completion of Lock-in-Period, the Landlord can also terminate the Rent Agreement by giving {Math.floor(parseInt(selectedAgreement.noticePeriod || '30') / 30)} month&apos;s notice to the Tenant. It is clarified that in the event of non-payment of rent by the Tenant during the lock-in period being in arrears for 2 consecutive months, then the Landlord shall have the right to terminate the Rent Agreement with immediate effect and take back possession of the Demised Premises.
                          </li>
                          
                          <li>
                            In the event the Landlord transfers, alienates or encumbers or otherwise disposes or deals with Demised Premises, the Landlord shall intimate the Tenant about the same in writing and shall ensure that the purchaser/transferee shall honor the terms of this Rent Agreement. Landlord shall provide undertaking to the Tenant from the said purchaser/transferee to that effect.
                          </li>
                          
                          <li>
                            The Landlord shall acknowledge and give valid receipts for each payment made by the Tenant to the Landlord, which shall be treated as conclusive proof of such payments.
                          </li>
                          
                          <li>
                            The Landlord confirms that in case for any reason whatsoever the premises is unfit for residence or any part thereof cannot be used for residential purposes because of any earthquake, civil commotion, or due to any natural calamity of Premises is acquired compulsorily by any authority, over which the Landlord has no control, the Tenant shall have the right to terminate this Agreement forthwith and vacate the premises and the Landlord shall refund the security deposit or the rent received in advance to the Tenant without any deductions whatsoever.
                          </li>
                          
                          <li>
                            That the Tenant will keep the Landlord harmless and keep it exonerated from all losses (whether financial or life), damage, liability or expense occasioned or claimed by reasons of acts or neglects of the Tenant or his visitors, employees, whether in the Demised Premises or elsewhere in the building, unless caused by the negligent acts of the Landlord.
                          </li>
                          
                          <li>
                            The Tenant shall maintain the Demised Premises in good and tenable condition and all the minor repairs such as leakage in the sanitary fittings, water taps and electrical usage etc. shall be carried out by the Tenant at his own expense. That it shall be the responsibility of the Tenant to hand over the vacant and peaceful possession of the demised premises on expiry of the Rent period, or on its early termination, as stated hereinabove in the same condition subject to natural wear and tear.
                          </li>
                          
                          <li>
                            That in case, where the Premises are not vacated by the Tenant, at the termination of the Rent period, the Tenant will pay damages calculated at two times the rent for any period of occupation commencing from the expiry of the Rent period. The payment of damages as aforesaid will not preclude the Landlord from initiating legal proceedings against the Tenant for recovery possession of premises or for any other purpose.
                          </li>
                          
                          <li>
                            That both the parties shall observe and adhere to the terms and conditions contained hereinabove.
                          </li>
                          
                          <li>
                            That the Tenant and Landlord represent and warrant that they are fully empowered and competent to make this Rent.
                          </li>
                          
                          <li>
                            If required, the Rent Agreement will be registered in front of registrar and the charges towards stamp duty, court fee & lawyer/coordinator will be equally borne by the Landlord & Tenant.
                          </li>
                        </ol>

                        <p className="font-bold mt-6">IN WITNESS WHEREOF</p>
                        <p>The parties hereto have executed these presents on the day and year first above written.</p>

                        <div className="mt-8 space-y-4">
                          <div>
                            <p className="font-bold">LANDLORD SIGNATURE:</p>
                            <p className="mt-2">{selectedAgreement.ownerFullName}</p>
                          </div>
                          
                          <div>
                            <p className="font-bold">TENANT SIGNATURE:</p>
                            <p className="mt-2">{selectedAgreement.tenantFullName}</p>
                          </div>
                          
                          <div>
                            <p className="font-bold">WITNESS ONE:</p>
                            <p className="text-gray-500 text-xs mt-1">Name & Address</p>
                          </div>
                          
                          <div>
                            <p className="font-bold">WITNESS TWO:</p>
                            <p className="text-gray-500 text-xs mt-1">Name & Address</p>
                          </div>
                        </div>

                        {selectedAgreement.annexures && (
                          <div className="mt-8 pt-6 border-t-2 border-gray-400">
                            <p className="font-bold text-base mb-3">ANNEXURE-I</p>
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b border-gray-400">
                                  <th className="text-left py-2 px-2 font-bold">Item Name</th>
                                  <th className="text-left py-2 px-2 font-bold">Item Count</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedAgreement.annexures.split('\n').filter((line) => line.trim()).map((line, idx) => {
                                  let itemName = line.trim();
                                  let itemCount = '1';
                                  
                                  const numberFirstMatch = line.match(/^(\d+)\s+(.+)$/);
                                  if (numberFirstMatch && numberFirstMatch[1] && numberFirstMatch[2]) {
                                    itemCount = numberFirstMatch[1].trim();
                                    itemName = numberFirstMatch[2].trim();
                                  } 
                                  else if (line.includes('-')) {
                                    const splitParts = line.split('-');
                                    if (splitParts.length >= 2 && splitParts[0] && splitParts[1]) {
                                      itemName = splitParts[0].trim();
                                      itemCount = splitParts[1].trim().replace(/\D/g, '') || '1';
                                    }
                                  } 
                                  else if (line.includes(':')) {
                                    const splitParts = line.split(':');
                                    if (splitParts.length >= 2 && splitParts[0] && splitParts[1]) {
                                      itemName = splitParts[0].trim();
                                      itemCount = splitParts[1].trim().replace(/\D/g, '') || '1';
                                    }
                                  } 
                                  else if (line.includes(',')) {
                                    const splitParts = line.split(',');
                                    if (splitParts.length >= 2) {
                                      const lastPart = splitParts[splitParts.length - 1];
                                      if (lastPart && /^\d+$/.test(lastPart.trim())) {
                                        itemCount = lastPart.trim();
                                        itemName = splitParts.slice(0, -1).join(',').trim();
                                      }
                                    }
                                  }
                                  
                                  return (
                                    <tr key={idx} className="border-b border-gray-300">
                                      <td className="py-2 px-2">{itemName}</td>
                                      <td className="py-2 px-2">{itemCount}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
