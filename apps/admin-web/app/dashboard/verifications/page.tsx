"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

export default function VerificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getVerificationRequests();
      if (response.success) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      toast.error("Failed to load verification requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm("Are you sure you want to approve this verification request?")) return;

    try {
      await adminApi.approveVerification(requestId, reviewNotes);
      toast.success("Verification approved successfully");
      setReviewingId(null);
      setReviewNotes("");
      loadVerificationRequests();
    } catch (error) {
      toast.error("Failed to approve verification");
    }
  };

  const handleReject = async (requestId: string) => {
    const notes = prompt("Please provide a reason for rejection:");
    if (!notes) return;

    try {
      await adminApi.rejectVerification(requestId, notes);
      toast.success("Verification rejected");
      loadVerificationRequests();
    } catch (error) {
      toast.error("Failed to reject verification");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING_VERIFICATION":
        return "bg-blue-100 text-blue-800";
      case "VERIFIED":
        return "bg-green-100 text-green-800";
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
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Verification Requests</h1>
              <p className="text-sm text-gray-600">Review and approve property verifications</p>
            </div>
          </div>
        </div>

        {/* Verification Requests */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading verification requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">All verification requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.property?.title}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      📍 {request.property?.address}, {request.property?.city}
                    </p>
                    <p className="text-sm text-gray-600">
                      👤 Owner: {request.owner?.firstName} {request.owner?.lastName} •{" "}
                      {request.owner?.email} • {request.owner?.phone}
                    </p>
                    {request.paymentAmount && (
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        💳 Payment: ₹{request.paymentAmount}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested on: {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Property Images */}
                {request.property?.images && request.property.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Property Images:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {request.property.images.slice(0, 5).map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Property ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Notes Input */}
                {reviewingId === request.id && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes (Optional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      rows={3}
                      placeholder="Add any notes about this verification..."
                    />
                  </div>
                )}

                {/* Actions */}
                {request.status === "PENDING_VERIFICATION" && (
                  <div className="flex gap-3">
                    {reviewingId === request.id ? (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <Check className="w-4 h-4" />
                          Confirm Approval
                        </button>
                        <button
                          onClick={() => {
                            setReviewingId(null);
                            setReviewNotes("");
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setReviewingId(request.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}

                {request.status === "PENDING_PAYMENT" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⏳ Waiting for payment confirmation (₹149)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}