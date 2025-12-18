"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import imageCompression from 'browser-image-compression';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { citiesData } from "@/lib/cities";
import { ArrowLeft, Home, Building2, DoorClosed, MapPin, IndianRupee, Phone, User, Upload, X, CheckCircle, AlertCircle, Loader2, Shield } from "lucide-react";
import ComboBox from "@/components/ui/ComboBox";
import { toast } from "@/components/ui/sonner";

const propertyTypes = [
  { value: "ROOM", label: "Room", icon: DoorClosed },
  { value: "PG", label: "PG", icon: Building2 },
  { value: "FLAT", label: "Flat", icon: Home },
];

const furnishedOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];
const genderOptions = ["Any", "Male", "Female", "Family"];
const tenantOptions = ["Student", "Working Professional", "Family", "Bachelor"];
const parkingOptions = ["Available", "Not Available", "Paid"];
const waterSupplyOptions = ["24x7", "Limited Hours", "Tanker"];
const powerBackupOptions = ["Yes", "No", "Partial"];

const planLimits: Record<string, { listings: number, label: string }> = {
  FREE: { listings: 1, label: "Free" },
  SILVER: { listings: 5, label: "Silver" },
  GOLD: { listings: 10, label: "Gold" },
  PLATINUM: { listings: 20, label: "Platinum" },
};

const insideAmenitiesOptions = [
  "WiFi", "AC", "Geyser", "TV", "Fridge", "Washing Machine", "Microwave", 
  "Bed", "Wardrobe", "Study Table", "Chair", "Attached Bathroom"
];

const outsideAmenitiesOptions = [
  "Gym", "Swimming Pool", "Garden", "Park", "Security", "CCTV",
  "Lift", "Club House", "Play Area", "Visitor Parking"
];

interface PropertyForm {
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  townSector: string;
  colony: string;
  landmark: string;
  latitude?: number | null;
  longitude?: number | null;
  apiAddress?: string;
  rent: string;
  security: string;
  maintenance: string;
  negotiable: boolean;
  bhk: string;
  furnished: string;
  accommodation: string;
  totalFloors: string;
  totalUnits: string;
  powerBackup: string;
  waterSupply: string;
  parking: string;
  insideAmenities: string[];
  outsideAmenities: string[];
  genderPreference: string;
  preferredTenants: string[];
  noticePeriod: string;
  contactName: string;
  whatsappNo: string;
}

const ListPropertyPageContent = () => {
  const router = useRouter();
  const { user, owner, requireRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  const mainCities = Object.keys(citiesData);

  useEffect(() => {
    const u = requireRole(["OWNER"]);
    if (!u) router.replace("/login?type=owner");
  }, [requireRole, router]);

  useEffect(() => {
    console.log('OTP State changed:', { otpSent, otpVerified, otp: otp.length });
  }, [otpSent, otpVerified, otp]);

  const [form, setForm] = useState<PropertyForm>({
    title: "",
    description: "",
    propertyType: "",
    address: "",
    city: "",
    townSector: "",
    colony: "",
    landmark: "",
    latitude: null,
    longitude: null,
    apiAddress: "",
    rent: "",
    security: "",
    maintenance: "",
    negotiable: false,
    bhk: "",
    furnished: "",
    accommodation: "",
    totalFloors: "",
    totalUnits: "",
    powerBackup: "",
    waterSupply: "",
    parking: "",
    insideAmenities: [],
    outsideAmenities: [],
    genderPreference: "",
    preferredTenants: [],
    noticePeriod: "",
    contactName: "",
    whatsappNo: "",
  });

  useEffect(() => {
    if (form.city && citiesData[form.city]) {
      setAvailableAreas(citiesData[form.city] ?? []);
      setForm(prev => ({ ...prev, townSector: "" }));
    } else {
      setAvailableAreas([]);
    }
  }, [form.city]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - images.length);
    setImages(prev => [...prev, ...newFiles].slice(0, 5));

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = files;
      handleImageChange({ target: input } as any);
    }
  };

  const validateForm = (): boolean => {
    const required = [
      'title', 'description', 'propertyType', 'address', 'city', 
      'townSector', 'colony', 'rent', 'security', 'maintenance',
      'bhk', 'furnished', 'accommodation', 'totalFloors', 'totalUnits',
      'powerBackup', 'waterSupply', 'parking', 'genderPreference',
      'noticePeriod', 'contactName', 'whatsappNo'
    ];

    for (const field of required) {
      if (!form[field as keyof PropertyForm] || form[field as keyof PropertyForm] === '') {
        toast.error("Missing Information", {
          description: `Please fill ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
        });
        return false;
      }
    }

    if (form.preferredTenants.length === 0) {
      toast.error("Missing Information", {
        description: "Please select at least one preferred tenant type",
      });
      return false;
    }

    return true;
  };

  const detectLocation = async () => {
    return new Promise<void>((resolve) => {
      if (!('geolocation' in navigator)) {
        toast.error('Geolocation Unsupported', {
          description: 'Browser does not support location. Please enter address manually.'
        });
        return resolve();
      }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(prev => ({ ...prev, latitude, longitude }));
        try {
          const res = await apiClient.reverseGeocode(latitude, longitude);
          if (res.success && (res as any).data?.address) {
            setForm(prev => ({ ...prev, apiAddress: (res as any).data.address, address: prev.address || (res as any).data.address }));
            toast.success('Location Captured', { description: 'Address auto-filled from your location.' });
          }
        } catch (err: any) {
          console.warn('Reverse geocoding failed:', err.message);
          toast.success('Location Captured', { 
            description: 'Please enter your address manually as auto-fill is unavailable.' 
          });
        } finally {
          resolve();
        }
      }, () => {
        toast.error('Location Permission Denied', {
          description: 'Please allow location access or fill address manually.'
        });
        resolve();
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
    });
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const handleSendOTP = async () => {
    if (!form.whatsappNo || form.whatsappNo.trim() === '') {
      toast.error('📱 Phone Number Required', {
        description: 'Please enter your WhatsApp number to verify your listing'
      });
      return;
    }

    if (form.whatsappNo.length !== 10) {
      toast.error('📱 Invalid Phone Number', {
        description: 'Please enter a valid 10-digit mobile number (e.g., 9876543210)'
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.whatsappNo)) {
      toast.error('📱 Invalid Indian Mobile Number', {
        description: 'Mobile number must start with 6, 7, 8, or 9 and be 10 digits long'
      });
      return;
    }

    setSendingOtp(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        apiClient.setToken(token);
      }
      
      const response = await apiClient.sendOwnerListingOTP(form.whatsappNo);
      
      if (response.success) {
        setOtpSent(true);
        setOtp('');
        toast.success("✅ OTP Sent!", {
          description: `Verification code sent to ${form.whatsappNo}${response.data?.otp ? ` (Dev OTP: ${response.data.otp})` : ''}`
        });
      } else {
        toast.error("Error", {
          description: response.message || "Failed to send OTP"
        });
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to send OTP. Please try again."
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!form.whatsappNo || !otp) {
      toast.error("Error", {
        description: "Please enter the OTP"
      });
      return;
    }

    if (otp.length !== 4) {
      toast.error("Invalid OTP", {
        description: "OTP must be 4 digits"
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await apiClient.verifyOwnerListingOTP(form.whatsappNo, otp);
      
      if (response.success && response.data?.verified) {
        setOtpVerified(true);
        toast.success("✅ Verified Successfully!", {
          description: "You can now publish your property"
        });
      } else {
        toast.error("Verification Failed", {
          description: response.message || "Invalid OTP"
        });
      }
    } catch (error: any) {
      toast.error("Verification Failed", {
        description: error.message || "Invalid OTP. Please try again."
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const uploadPropertyImages = async (propertyId: string, imageFiles: File[]) => {
    try {
      console.log('🔍 DEBUG: Starting image upload process...');
      console.log('🔍 DEBUG: Property ID:', propertyId);
      console.log('🔍 DEBUG: Number of images:', imageFiles.length);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      console.log('🔍 DEBUG: Auth token exists:', !!token);
      console.log('🔍 DEBUG: Auth token (first 50 chars):', token?.substring(0, 50));
      
      if (token) {
        apiClient.setToken(token);
        console.log('✅ Token set on API client');
      }

      const ownerData = JSON.parse(localStorage.getItem("roomsdekho:owner") || "{}");
      const ownerId = owner?.id || ownerData?.id || user?.id || '';
      console.log('🔍 DEBUG: Owner ID:', ownerId);
      console.log('🔍 DEBUG: Owner data:', ownerData);
      
      if (!ownerId) throw new Error('Owner ID not found');

      console.log('📤 Getting presigned URLs for property:', propertyId);
      console.log('📤 API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');
      
      const uploadResponse = await apiClient.uploadPropertyImages(propertyId, ownerId);
      console.log('📦 Full upload response:', JSON.stringify(uploadResponse, null, 2));
      
      if (!uploadResponse.success || !uploadResponse.data?.presignedUrls) {
        throw new Error(uploadResponse.message || 'Failed to get presigned URLs');
      }
      
      const presignedUrls = uploadResponse.data.presignedUrls;
      console.log('✅ Received presigned URLs:', Object.keys(presignedUrls));
      console.log('🔍 DEBUG: Sample presigned URL:', Object.values(presignedUrls)[0]?.substring(0, 200));

      // Compression options
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg' as const
      };

      const imageCategories = ["first", "second", "third", "fourth", "fifth"] as const;
      const uploadPromises = imageFiles.slice(0, 5).map(async (file, index) => {
        const category = imageCategories[index];
        if (!category) {
          console.error(`❌ No category for index ${index}`);
          return null;
        }
        const presignedUrl = presignedUrls[category];
        
        if (!presignedUrl) {
          console.error(`❌ No presigned URL for ${category}`);
          return null;
        }

        try {
          // Compress image before upload
          console.log(`🗜️ Compressing ${category} image: ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
          const compressedFile = await imageCompression(file, compressionOptions);
          console.log(`✅ Compressed to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

          console.log(`📤 Uploading ${category} image to:`, presignedUrl.substring(0, 100) + '...');
          
          // Check if URL looks like a PUT URL (should not contain GetObject)
          if (presignedUrl.includes('GetObject')) {
            console.error('❌ ERROR: Received GET URL instead of PUT URL!');
            console.error('❌ Full URL:', presignedUrl);
            throw new Error('Invalid presigned URL - received GET URL instead of PUT URL');
          }
          
          const s3Response = await fetch(presignedUrl, {
            method: 'PUT',
            body: compressedFile,
            headers: { 
              'Content-Type': 'image/jpeg',
            },
          });

          console.log(`📦 S3 Response for ${category}:`, {
            status: s3Response.status,
            statusText: s3Response.statusText,
            ok: s3Response.ok,
            headers: Object.fromEntries(s3Response.headers.entries())
          });

          if (!s3Response.ok) {
            const errorText = await s3Response.text().catch(() => 'No error details');
            console.error(`❌ S3 upload failed for ${category}:`, errorText);
            throw new Error(`Failed to upload ${category} image: ${s3Response.status} ${s3Response.statusText}`);
          }
          
          console.log(`✅ ${category} image uploaded successfully`);
          return true;
        } catch (error: any) {
          console.error(`❌ Error uploading ${category}:`, error);
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      console.log('✅ All images uploaded successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Image upload error:', error);
      throw error;
    }
  };

    const handleSubmit = async () => {
    console.log('🔵 Submit button clicked');
    
    // Check form validation
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    console.log('✅ Form validation passed');

    // Check OTP verification
    if (!otpVerified) {
      console.log('❌ OTP not verified');
      toast.error("Verification Required", {
        description: "Please verify your mobile number first"
      });
      return;
    }
    console.log('✅ OTP verified');

    setIsSubmitting(true);
    console.log('🔵 isSubmitting set to true');
    
    try {
      // Ensure token is set
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      apiClient.setToken(token);
      console.log('✅ Auth token set');

      console.log('📝 Creating property as DRAFT...');
      console.log('Form data:', form);
      
      const response = await apiClient.createProperty({
        ...form,
        isDraft: true,
        isAvailable: true,
      });

      console.log('📦 Create property response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create property');
      }

      if (!response.data) {
        throw new Error('Property created but no data returned');
      }

      const propertyId = response.data.id || (response.data as any).property?.id || (response.data as any)._id;
      console.log('✅ Property created with ID:', propertyId);

      // Handle images if present
      if (images.length > 0) {
        console.log(`📤 Starting upload for ${images.length} images...`);
        
        try {
          await uploadPropertyImages(propertyId, images);
          console.log('✅ All images uploaded successfully');

          // Publish property after successful upload
          console.log('🚀 Publishing property...');
          try {
            const publishResponse = await apiClient.publishProperty(propertyId);
            console.log('📦 Publish response:', publishResponse);
            
            if (publishResponse.success) {
              console.log('✅ Property published successfully');
              toast.success("🎉 Property Listed Successfully!", {
                description: `Your property is now live and visible to potential tenants!`
              });
            } else {
              throw new Error(publishResponse.message || 'Publish failed');
            }
          } catch (publishErr: any) {
            console.warn('⚠️ Auto-publish failed:', publishErr);
            toast.success("📸 Images Uploaded Successfully!", {
              description: "Property saved as draft. Please publish from dashboard when ready."
            });
          }
        } catch (uploadError: any) {
          console.error('❌ Image upload error:', uploadError);
          toast.error("Property Saved as Draft", {
            description: `Property saved but images failed to upload: ${uploadError.message}`
          });
        }
      } else {
        console.log('ℹ️ No images to upload, property saved as draft');
        toast.success("📝 Property Saved as Draft", {
          description: "Your property is saved! Add images from dashboard to make it live."
        });
      }

      console.log('🔄 Redirecting to dashboard...');
      setTimeout(() => {
        router.push("/owner/dashboard");
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      toast.error("Error", {
        description: error.message || "Failed to create property listing"
      });
    } finally {
      console.log('🔵 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string, type: 'inside' | 'outside') => {
    const key = type === 'inside' ? 'insideAmenities' : 'outsideAmenities';
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(amenity)
        ? prev[key].filter(a => a !== amenity)
        : [...prev[key], amenity]
    }));
  };

  const toggleTenant = (tenant: string) => {
    setForm(prev => ({
      ...prev,
      preferredTenants: prev.preferredTenants.includes(tenant)
        ? prev.preferredTenants.filter(t => t !== tenant)
        : [...prev.preferredTenants, tenant]
    }));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              List Your Property
            </h1>
            <p className="text-gray-600 mt-1">Fill all details and verify mobile to publish</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Provide complete information about your property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="title">Property Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Spacious 2BHK Flat in Sector 62"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your property in detail..."
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm({...form, description: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="propertyType">Property Type *</Label>
                      <Select value={form.propertyType} onValueChange={(value) => setForm({...form, propertyType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black border border-gray-200 shadow-lg z-[100]">
                          {propertyTypes.map(type => (
                            <SelectItem key={type.value} value={type.value} className="bg-white text-black hover:bg-gray-100">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                      <Label htmlFor="city">City *</Label>
                      <ComboBox
                        options={mainCities}
                        placeholder="Select city"
                        onChange={(value) =>
                        setForm(prev => ({ ...prev, city: value, townSector: "" }))
                        }
                      />
                      </div>

                      <div>
                      <Label htmlFor="townSector">Town/Sector *</Label>
                      <ComboBox
                        options={form.city ? availableAreas : []}
                        placeholder={
                        form.city
                          ? availableAreas.length > 0
                          ? "Select area"
                          : "No areas available"
                          : "Choose city first"
                        }
                        onChange={(value) =>
                        setForm(prev => ({ ...prev, townSector: value }))
                        }
                      />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="colony">Colony/Society Name *</Label>
                      <Input
                        id="colony"
                        placeholder="e.g., Supertech Ecovillage"
                        value={form.colony}
                        onChange={(e) => setForm({...form, colony: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Full Address *</Label>
                      <Input
                        id="address"
                        placeholder="Complete address with house/flat number"
                        value={form.address}
                        onChange={(e) => setForm({...form, address: e.target.value})}
                      />
                      {form.apiAddress && (
                        <p className="text-xs text-gray-500 mt-1 truncate" title={form.apiAddress}>
                          Detected: {form.apiAddress}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
                          Use My Location
                        </Button>
                        {form.latitude && form.longitude && (
                          <span className="text-[10px] text-gray-500 self-center">
                            ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input
                        id="landmark"
                        placeholder="Nearby landmark (optional)"
                        value={form.landmark}
                        onChange={(e) => setForm({...form, landmark: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <IndianRupee className="h-5 w-5" />
                      Pricing
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="rent">Monthly Rent *</Label>
                        <Input
                          id="rent"
                          type="number"
                          placeholder="10000"
                          value={form.rent}
                          onChange={(e) => setForm({...form, rent: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="security">Security Deposit *</Label>
                        <Input
                          id="security"
                          type="number"
                          placeholder="20000"
                          value={form.security}
                          onChange={(e) => setForm({...form, security: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="maintenance">Maintenance *</Label>
                        <Input
                          id="maintenance"
                          type="number"
                          placeholder="1000"
                          value={form.maintenance}
                          onChange={(e) => setForm({...form, maintenance: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="negotiable"
                        checked={form.negotiable}
                        onCheckedChange={(checked) => setForm({...form, negotiable: checked as boolean})}
                      />
                      <Label htmlFor="negotiable" className="cursor-pointer">
                        Rent is negotiable
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Property Specifications</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bhk">BHK *</Label>
                        <Select value={form.bhk} onValueChange={(value) => setForm({...form, bhk: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['1 RK' , '2 RK' , '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map(bhk => (
                              <SelectItem key={bhk} value={bhk}>
                                {bhk} 
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="furnished">Furnished *</Label>
                        <Select value={form.furnished} onValueChange={(value) => setForm({...form, furnished: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {furnishedOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="accommodation">Accommodation *</Label>
                        <Input
                          id="accommodation"
                          placeholder="e.g., 2-3 persons"
                          value={form.accommodation}
                          onChange={(e) => setForm({...form, accommodation: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="totalFloors">Total Floors *</Label>
                        <Input
                          id="totalFloors"
                          type="number"
                          value={form.totalFloors}
                          onChange={(e) => setForm({...form, totalFloors: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="totalUnits">Total Units *</Label>
                        <Input
                          id="totalUnits"
                          type="number"
                          value={form.totalUnits}
                          onChange={(e) => setForm({...form, totalUnits: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Utilities & Amenities</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="powerBackup">Power Backup *</Label>
                        <Select value={form.powerBackup} onValueChange={(value) => setForm({...form, powerBackup: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {powerBackupOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="waterSupply">Water Supply *</Label>
                        <Select value={form.waterSupply} onValueChange={(value) => setForm({...form, waterSupply: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {waterSupplyOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="parking">Parking *</Label>
                        <Select value={form.parking} onValueChange={(value) => setForm({...form, parking: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {parkingOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Inside Amenities</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {insideAmenitiesOptions.map(amenity => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`inside-${amenity}`}
                              checked={form.insideAmenities.includes(amenity)}
                              onCheckedChange={() => toggleAmenity(amenity, 'inside')}
                            />
                            <Label htmlFor={`inside-${amenity}`} className="cursor-pointer text-sm">
                              {amenity}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Outside Amenities</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {outsideAmenitiesOptions.map(amenity => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`outside-${amenity}`}
                              checked={form.outsideAmenities.includes(amenity)}
                              onCheckedChange={() => toggleAmenity(amenity, 'outside')}
                            />
                            <Label htmlFor={`outside-${amenity}`} className="cursor-pointer text-sm">
                              {amenity}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tenant Preferences</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="genderPreference">Gender Preference *</Label>
                        <Select value={form.genderPreference} onValueChange={(value) => setForm({...form, genderPreference: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="noticePeriod">Notice Period *</Label>
                        <Input
                          id="noticePeriod"
                          placeholder="e.g., 1 month"
                          value={form.noticePeriod}
                          onChange={(e) => setForm({...form, noticePeriod: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Preferred Tenants *</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {tenantOptions.map(tenant => (
                          <div key={tenant} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tenant-${tenant}`}
                              checked={form.preferredTenants.includes(tenant)}
                              onCheckedChange={() => toggleTenant(tenant)}
                            />
                            <Label htmlFor={`tenant-${tenant}`} className="cursor-pointer">
                              {tenant}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactName">Contact Name *</Label>
                        <Input
                          id="contactName"
                          placeholder="Your name"
                          value={form.contactName}
                          onChange={(e) => setForm({...form, contactName: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="whatsappNo">WhatsApp Number *</Label>
                        <Input
                          id="whatsappNo"
                          placeholder="10-digit mobile number"
                          value={form.whatsappNo}
                          onChange={(e) => setForm({...form, whatsappNo: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className={`bg-white ${otpVerified ? "border-green-500" : otpSent ? "border-blue-500" : ""}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Mobile Verification
                  </CardTitle>
                  <CardDescription>
                    {form.whatsappNo ? `Verify ${form.whatsappNo}` : "Enter WhatsApp number first"}
                    {otpSent && !otpVerified && " - OTP Sent"}
                    {otpVerified && " - Verified ✓"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">                  
                  {!otpVerified ? (
                    <>
                      {!otpSent ? (
                        <Button 
                          onClick={handleSendOTP} 
                          disabled={sendingOtp || !form.whatsappNo}
                          className="w-full"
                        >
                          {sendingOtp ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send OTP"
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input
                              id="otp"
                              type="text"
                              maxLength={4}
                              placeholder="4-digit OTP"
                              value={otp}
                              onChange={(e) => {
                                const value = e.target.value.split('').filter(char => char >= '0' && char <= '9').join('');
                                setOtp(value);
                              }}
                              autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Enter the 4-digit code sent to {form.whatsappNo}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleVerifyOTP} 
                              disabled={verifyingOtp || otp.length !== 4}
                              className="flex-1"
                              size="sm"
                            >
                              {verifyingOtp ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                "Verify"
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={handleSendOTP}
                              disabled={sendingOtp}
                              size="sm"
                            >
                              {sendingOtp ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                "Resend"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium text-green-600">Verified Successfully!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Property Images</CardTitle>
                  <CardDescription>
                    Upload images to complete listing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleBrowse}
                  >
                    <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-gray-400">
                      ({images.length}/5 uploaded)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {images.length === 0 && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Property will be saved as draft without images</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !otpVerified}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {images.length > 0 ? "Publishing..." : "Saving Draft..."}
                  </>
                ) : (
                  images.length > 0 ? "Publish Property" : "Save as Draft"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ListPropertyPage = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <ListPropertyPageContent />
  </Suspense>
);

export default ListPropertyPage;