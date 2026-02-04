"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, IndianRupee, Calendar } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface VerificationModalProps {
  property: {
    id: string;
    title: string;
    verificationStatus: string;
    verificationExpiry?: Date;
  };
  isOpen: boolean;
  onClose: () => void;
  onRequestVerification: (propertyId: string) => Promise<void>;
}

export default function VerificationModal({ 
  property, 
  isOpen, 
  onClose,
  onRequestVerification 
}: VerificationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "NOT_VERIFIED":
        return {
          icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
          label: "Not Verified",
          color: "bg-orange-100 text-orange-800 border-orange-300",
          description: "This property is not verified yet. Get verified to build trust with potential tenants."
        };
      case "PENDING_PAYMENT":
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          label: "Pending Payment",
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          description: "Complete the payment to proceed with verification."
        };
      case "PENDING_VERIFICATION":
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          label: "Under Review",
          color: "bg-blue-100 text-blue-800 border-blue-300",
          description: "Your verification request is being reviewed by our team."
        };
      case "VERIFIED":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          label: "Verified",
          color: "bg-green-100 text-green-800 border-green-300",
          description: "Your property is verified and trusted by tenants."
        };
      case "EXPIRED":
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          label: "Expired",
          color: "bg-red-100 text-red-800 border-red-300",
          description: "Your verification has expired. Renew to continue enjoying verified status."
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          label: "Unknown",
          color: "bg-gray-100 text-gray-800 border-gray-300",
          description: ""
        };
    }
  };

  const statusInfo = getStatusInfo(property.verificationStatus);
  const canRequestVerification = ["NOT_VERIFIED", "EXPIRED"].includes(property.verificationStatus);

  const handleRequestVerification = async () => {
    setIsProcessing(true);
    try {
      await onRequestVerification(property.id);
      toast.success("Success", {
        description: "Verification request created successfully"
      });
      onClose();
    } catch (error) {
      toast.error("Error", {
        description: "Failed to create verification request"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatExpiryDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Property Verification
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {property.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              {statusInfo.icon}
              <div>
                <p className="text-sm font-medium text-slate-900">Current Status</p>
                <Badge variant="secondary" className={`${statusInfo.color} mt-1`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm text-slate-600">{statusInfo.description}</p>
          </div>

          {/* Expiry Date for Verified Properties */}
          {property.verificationStatus === "VERIFIED" && property.verificationExpiry && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Calendar className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-xs font-medium text-green-900">Valid Until</p>
                <p className="text-sm font-semibold text-green-700">
                  {formatExpiryDate(property.verificationExpiry)}
                </p>
              </div>
            </div>
          )}

          {/* Verification Benefits */}
          {canRequestVerification && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-900">Benefits of Verification</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Build trust with potential tenants</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Get higher visibility in search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Verified badge on your listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Valid for 1 year from approval</span>
                </li>
              </ul>
            </div>
          )}

          {/* Pricing */}
          {canRequestVerification && (
            <div className="flex items-center justify-between p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-violet-900">Verification Fee</p>
                <p className="text-xs text-violet-600 mt-0.5">One-time payment, valid for 1 year</p>
              </div>
              <div className="flex items-center gap-1 text-2xl font-bold text-violet-700">
                <IndianRupee className="h-5 w-5" />
                <span>199</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            {canRequestVerification && (
              <Button
                onClick={handleRequestVerification}
                disabled={isProcessing}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <IndianRupee className="h-4 w-4 mr-2" />
                    Request Verification
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Info Note */}
          {property.verificationStatus === "PENDING_VERIFICATION" && (
            <p className="text-xs text-center text-slate-500">
              Our team typically reviews verification requests within 24-48 hours.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
