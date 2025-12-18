"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, Upload, X, Home, Building2, DoorClosed } from "lucide-react";
import { citiesData } from "@/lib/cities";
import Link from "next/link";
import Image from "next/image";
import ComboBox from "@/components/ui/ComboBox";

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

const insideAmenitiesOptions = [
  "WiFi", "AC", "Geyser", "TV", "Fridge", "Washing Machine", "Microwave", 
  "Bed", "Wardrobe", "Study Table", "Chair", "Attached Bathroom"
];

const outsideAmenitiesOptions = [
  "Gym", "Swimming Pool", "Garden", "Park", "Security", "CCTV",
  "Lift", "Club House", "Play Area", "Visitor Parking"
];

const EditPropertyPage = () => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({
    insideAmenities: [],
    outsideAmenities: [],
    preferredTenants: [],
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    if (form.city && citiesData[form.city]) {
      setAvailableAreas(citiesData[form.city] ?? []);
    } else {
      setAvailableAreas([]);
    }
  }, [form.city]);

  const fetchProperty = async () => {
    try {
      const response = await apiClient.getPropertyById(propertyId);
      if (response.success && response.data) {
        setForm({
          ...response.data,
          insideAmenities: response.data.insideAmenities || [],
          outsideAmenities: response.data.outsideAmenities || [],
          preferredTenants: response.data.preferredTenants || [],
        });
        if (response.data.imageUrls && response.data.imageUrls.length > 0) {
          setExistingImages(response.data.imageUrls);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load property",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + images.length + files.length;
    
    if (totalImages > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images",
        variant: "destructive",
      });
      return;
    }

    setImages([...images, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const urlToRevoke = imagePreviews[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    const newExisting = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExisting);
  };

  const toggleAmenity = (amenity: string, type: 'inside' | 'outside') => {
    const key = type === 'inside' ? 'insideAmenities' : 'outsideAmenities';
    setForm((prev: any) => ({
      ...prev,
      [key]: prev[key].includes(amenity)
        ? prev[key].filter((a: string) => a !== amenity)
        : [...prev[key], amenity]
    }));
  };

  const toggleTenant = (tenant: string) => {
    setForm((prev: any) => ({
      ...prev,
      preferredTenants: prev.preferredTenants.includes(tenant)
        ? prev.preferredTenants.filter((t: string) => t !== tenant)
        : [...prev.preferredTenants, tenant]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Update property details
      const updateData = {
        ...form,
        imageUrls: existingImages,
        rent: form.rent.toString(),
        security: form.security?.toString() || "0",
        maintenance: form.maintenance?.toString() || "0",
        bhk: form.bhk.toString(),
        totalFloors: form.totalFloors?.toString() || "1",
        totalUnits: form.totalUnits?.toString() || "1",
        noticePeriod: form.noticePeriod?.toString() || "30",
      };

      const response = await apiClient.updateProperty(propertyId, updateData);

      if (response.success) {
        // If new images, upload them
        if (images.length > 0) {
          const ownerData = JSON.parse(localStorage.getItem("roomsdekho:owner") || "{}");
          const ownerId = ownerData.id;
          
          const uploadResponse = await apiClient.uploadPropertyImages(propertyId, ownerId);
          
          if (uploadResponse.data?.presignedUrls) {
            const presignedUrls = uploadResponse.data.presignedUrls;
            const imageCategories = ["first", "second", "third", "fourth", "fifth"] as const;
            
            const uploadPromises = images.slice(0, 5).map(async (file, index) => {
              const category = imageCategories[index];
              if (!category) return null;
              const presignedUrl = presignedUrls[category];
              
              if (presignedUrl) {
                await fetch(presignedUrl, {
                  method: "PUT",
                  body: file,
                  headers: { "Content-Type": file.type || "image/jpeg" },
                });
              }
            });
            
            await Promise.all(uploadPromises);
          }
        }

        toast({
          title: "Success",
          description: "Property updated successfully!",
        });
        
        router.push("/owner/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const mainCities = Object.keys(citiesData);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/owner/dashboard">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Property</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Type */}
            <div className="space-y-2">
              <Label>Property Type *</Label>
              <div className="grid grid-cols-3 gap-4">
                {propertyTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      form.propertyType === type.value
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setForm({ ...form, propertyType: type.value })}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <type.icon className="h-8 w-8 mb-2" />
                      <span className="font-medium">{type.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Basic Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g., 2BHK Flat in Sector 62"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent (₹) *</Label>
                <Input
                  id="rent"
                  type="number"
                  value={form.rent || ""}
                  onChange={(e) => setForm({ ...form, rent: e.target.value })}
                  required
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select value={form.city} onValueChange={(value) => setForm({ ...form, city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Town/Sector *</Label>
                <ComboBox
                  options={availableAreas}
                  placeholder="Select area"
                  onChange={(value: string) => setForm({ ...form, townSector: value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="colony">Colony/Locality</Label>
                <Input
                  id="colony"
                  value={form.colony || ""}
                  onChange={(e) => setForm({ ...form, colony: e.target.value })}
                  placeholder="DLF Phase 2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                placeholder="House/Flat No, Street Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                value={form.landmark || ""}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                placeholder="Near Metro Station"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Describe your property..."
              />
            </div>

            {/* Property Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bhk">BHK *</Label>
                <Select value={form.bhk?.toString()} onValueChange={(value) => setForm({ ...form, bhk: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 BHK</SelectItem>
                    <SelectItem value="2">2 BHK</SelectItem>
                    <SelectItem value="3">3 BHK</SelectItem>
                    <SelectItem value="4">4 BHK</SelectItem>
                    <SelectItem value="5">5+ BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="furnished">Furnished Status *</Label>
                <Select value={form.furnished} onValueChange={(value) => setForm({ ...form, furnished: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {furnishedOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accommodation">Accommodation</Label>
                <Input
                  id="accommodation"
                  value={form.accommodation || ""}
                  onChange={(e) => setForm({ ...form, accommodation: e.target.value })}
                  placeholder="2-3 persons"
                />
              </div>
            </div>

            {/* Pricing Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="security">Security Deposit (₹)</Label>
                <Input
                  id="security"
                  type="number"
                  value={form.security || ""}
                  onChange={(e) => setForm({ ...form, security: e.target.value })}
                  placeholder="20000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance">Maintenance (₹/month)</Label>
                <Input
                  id="maintenance"
                  type="number"
                  value={form.maintenance || ""}
                  onChange={(e) => setForm({ ...form, maintenance: e.target.value })}
                  placeholder="1000"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="negotiable"
                  checked={form.negotiable}
                  onCheckedChange={(checked) => setForm({ ...form, negotiable: !!checked })}
                />
                <Label htmlFor="negotiable">Rent Negotiable</Label>
              </div>
            </div>

            {/* Amenities */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Power Backup</Label>
                <Select value={form.powerBackup} onValueChange={(value) => setForm({ ...form, powerBackup: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {powerBackupOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Water Supply</Label>
                <Select value={form.waterSupply} onValueChange={(value) => setForm({ ...form, waterSupply: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {waterSupplyOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Parking</Label>
                <Select value={form.parking} onValueChange={(value) => setForm({ ...form, parking: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {parkingOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Inside Amenities */}
            <div className="space-y-2">
              <Label>Inside Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {insideAmenitiesOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`inside-${amenity}`}
                      checked={form.insideAmenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity, 'inside')}
                    />
                    <Label htmlFor={`inside-${amenity}`} className="text-sm font-normal">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Outside Amenities */}
            <div className="space-y-2">
              <Label>Outside Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {outsideAmenitiesOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`outside-${amenity}`}
                      checked={form.outsideAmenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity, 'outside')}
                    />
                    <Label htmlFor={`outside-${amenity}`} className="text-sm font-normal">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender Preference</Label>
                <Select value={form.genderPreference} onValueChange={(value) => setForm({ ...form, genderPreference: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="noticePeriod">Notice Period (days)</Label>
                <Input
                  id="noticePeriod"
                  type="number"
                  value={form.noticePeriod || ""}
                  onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })}
                  placeholder="30"
                />
              </div>
            </div>

            {/* Preferred Tenants */}
            <div className="space-y-2">
              <Label>Preferred Tenants</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tenantOptions.map((tenant) => (
                  <div key={tenant} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tenant-${tenant}`}
                      checked={form.preferredTenants.includes(tenant)}
                      onCheckedChange={() => toggleTenant(tenant)}
                    />
                    <Label htmlFor={`tenant-${tenant}`} className="text-sm font-normal">
                      {tenant}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={form.contactName || ""}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNo">WhatsApp Number</Label>
                <Input
                  id="whatsappNo"
                  value={form.whatsappNo || ""}
                  onChange={(e) => setForm({ ...form, whatsappNo: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <Label>Property Images ({existingImages.length + images.length}/5)</Label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Existing Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={img}
                          alt={`Existing ${index + 1}`}
                          width={200}
                          height={150}
                          unoptimized
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">New Images (will be uploaded)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={preview}
                          alt={`New ${index + 1}`}
                          width={200}
                          height={150}
                          unoptimized
                          className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {(existingImages.length + images.length) < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label htmlFor="image-upload-edit" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">Add more images</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Property"
                )}
              </Button>
              <Link href="/owner/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPropertyPage;
