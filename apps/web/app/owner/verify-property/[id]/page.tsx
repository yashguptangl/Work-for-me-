"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, MapPin, CheckCircle, AlertTriangle, Shield, CreditCard } from "lucide-react";
import axios from "axios";

interface VerificationRequest {
  id: string;
  propertyId: string;
  amount: number;
  paymentStatus: string;
  status: string;
  verificationLatitude?: number;
  verificationLongitude?: number;
  verificationAddress?: string;
}

export default function VerifyPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const propertyId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [step, setStep] = useState<'init' | 'payment' | 'location' | 'complete'>('init');
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [capturedLocation, setCapturedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        toast.error("Authentication required", {
          description: "Please login to verify your property",
        });
        router.push('/login?type=owner');
        return;
      }

      console.log('Fetching property with ID:', propertyId);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Full URL:', `${process.env.NEXT_PUBLIC_API_URL}/owner/property/${propertyId}`);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/owner/property/${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Property response:', response.data);
      setProperty(response.data.property);
      
      // Check if there's an existing verification request
      try {
        const statusResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/owner/verification/status/${propertyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Verification status response:', statusResponse.data);
        
        if (statusResponse.data.latestRequest) {
          const request = statusResponse.data.latestRequest;
          setVerificationRequest(request);
          
          // Determine step based on request status
          if (request.status === 'PENDING_PAYMENT' && request.paymentStatus === 'PENDING') {
            setStep('payment');
          } else if (request.status === 'PAYMENT_COMPLETED' && !request.verificationLatitude) {
            setStep('location');
          } else if (request.status === 'UNDER_REVIEW') {
            setStep('complete');
          } else if (request.status === 'APPROVED' || request.status === 'REJECTED' || request.status === 'EXPIRED') {
            // Allow re-verification for expired/approved requests
            setStep('init');
          }
        }
      } catch (statusError: any) {
        // It's okay if verification status doesn't exist yet
        console.log('No existing verification request:', statusError.response?.data?.message);
      }
    } catch (error: any) {
      console.error('Fetch property error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to load property details",
      });
      
      // If property not found or unauthorized, redirect to dashboard after a delay
      if (error.response?.status === 404 || error.response?.status === 403) {
        setTimeout(() => {
          router.push('/owner/dashboard');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const initiateVerification = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/owner/verification/initiate`,
        { propertyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setVerificationRequest(response.data.request);
      setStep('payment');
      toast.success("Verification request initiated!");
    } catch (error: any) {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to initiate verification",
      });
    } finally {
      setProcessing(false);
    }
  };

  const simulatePayment = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      
      // Simulate payment with a mock payment ID
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/owner/verification/payment/complete`,
        {
          requestId: verificationRequest?.id,
          paymentId: paymentId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setVerificationRequest(response.data.request);
      setStep('location');
      
      // Show popup immediately after payment
      setTimeout(() => {
        setShowLocationPopup(true);
      }, 500);
      
      toast.success("Payment completed successfully!");
    } catch (error: any) {
      toast.error("Error", {
        description: error.response?.data?.message || "Payment failed",
      });
    } finally {
      setProcessing(false);
    }
  };

  const captureLocation = async () => {
    setProcessing(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setProcessing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        try {
          // Get address from Google Geocoding API
          const geocodeResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          
          const address = geocodeResponse.data.results[0]?.formatted_address || 'Address not found';
          
          setCapturedLocation({ latitude, longitude, address });
          setLocationCaptured(true);
          setShowLocationPopup(false);
          
          // Submit location to backend
          const token = localStorage.getItem("authToken");
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/owner/verification/capture-location`,
            {
              requestId: verificationRequest?.id,
              latitude,
              longitude,
              address,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setVerificationRequest(response.data.request);
          setStep('complete');
          
          toast.success("Location captured successfully! Your request is now under review.");
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/owner/dashboard');
          }, 2000);
        } catch (error: any) {
          console.error("Location capture error:", error);
          toast.error("Error", {
            description: error.response?.data?.message || "Failed to capture location",
          });
        } finally {
          setProcessing(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Error", {
          description: "Failed to get your location. Please ensure location services are enabled.",
        });
        setProcessing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-10 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">Property not found</p>
            <Button onClick={() => router.push('/owner/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/owner/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle>Property Verification</CardTitle>
                <CardDescription>Verify your property to gain trust from potential tenants/buyers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Details */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{property.title}</h3>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.address}, {property.city}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${step === 'init' || step === 'payment' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'init' || step === 'payment' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  {step !== 'init' && step !== 'payment' ? <CheckCircle className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${step === 'location' || step === 'complete' ? 'bg-blue-600' : 'bg-slate-200'}`} />
              
              <div className={`flex items-center gap-2 ${step === 'location' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-slate-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'location' ? 'bg-blue-100' : step === 'complete' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {step === 'complete' ? <CheckCircle className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                </div>
                <span className="text-sm font-medium">Location</span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${step === 'complete' ? 'bg-blue-600' : 'bg-slate-200'}`} />
              
              <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-green-600' : 'text-slate-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'complete' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Review</span>
              </div>
            </div>

            {/* Step Content */}
            {step === 'init' && (
              <div className="space-y-4">
                {property.verificationStatus === 'EXPIRED' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">⏰ Verification Expired</h4>
                    <p className="text-sm text-orange-800">
                      Your previous verification has expired. Renew your verification to regain the verified badge and boost your listing&apos;s credibility.
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Why get verified?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Build trust with potential tenants/buyers</li>
                    <li>✓ Get 3x more inquiries</li>
                    <li>✓ Stand out from competitors</li>
                    <li>✓ Verified badge for 1 month</li>
                  </ul>
                </div>
                
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">₹199</div>
                  <div className="text-sm text-slate-600">
                    {property.verificationStatus === 'EXPIRED' ? '1 month renewal' : '1 month validity'}
                  </div>
                </div>

                <Button
                  onClick={initiateVerification}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    property.verificationStatus === 'EXPIRED' ? 'Renew Verification' : 'Start Verification Process'
                  )}
                </Button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600">Verification Fee</span>
                    <span className="text-2xl font-bold">₹199</span>
                  </div>
                  <div className="text-xs text-slate-500">Valid for 1 month from verification date</div>
                </div>

                <Button
                  onClick={simulatePayment}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ₹199
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-slate-500">
                  Secure payment powered by Razorpay/Stripe
                </p>
              </div>
            )}

            {step === 'location' && (
              <div className="space-y-4">
                {!locationCaptured ? (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">📍 Location Verification Required</h4>
                      <p className="text-sm text-yellow-800">
                        For genuine verification, please ensure you are inside the property before capturing location.
                      </p>
                    </div>

                    <Button
                      onClick={() => setShowLocationPopup(true)}
                      className="w-full"
                      size="lg"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Capture Location
                    </Button>
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Location Captured</h4>
                    </div>
                    <p className="text-sm text-green-800">
                      <strong>Address:</strong> {capturedLocation?.address}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Lat: {capturedLocation?.latitude.toFixed(6)}, Lon: {capturedLocation?.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-green-900 text-lg mb-2">Verification Request Submitted!</h4>
                  <p className="text-sm text-green-800">
                    Your property verification request is now under review by our admin team. 
                    You will receive a notification once it&apos;s approved.
                  </p>
                </div>

                <Button
                  onClick={() => router.push('/owner/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Popup */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-white">
            <CardHeader className="bg-white">
              <CardTitle>Location Verification</CardTitle>
              <CardDescription>
                For genuine verification, please ensure you are inside the property before proceeding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Make sure you are physically present at the property location. 
                  We will capture your exact GPS coordinates and address.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLocationPopup(false)}
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={captureLocation}
                  className="flex-1"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    'I\'m at Property'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
