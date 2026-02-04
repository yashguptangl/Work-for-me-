'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import {
  ArrowLeft,
  MapPin,
  Edit,
  CheckCircle,
  Home,
  Bed,
  Sofa,
  DollarSign,
  User,
  Phone,
  Mail,
  Building,
  Ruler,
  Zap,
  Droplet,
  Car,
  Shield,
  Calendar,
  Package,
  Compass,
  Layers,
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  /* ================= FETCH PROPERTY ================= */
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', params.id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/properties/${params.id}`);
      return res.data.property;
    },
  });

  /* ================= UPDATE PROPERTY ================= */
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.put(`/admin/properties/${params.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', params.id] });
      setIsEditing(false);
      alert('Property updated successfully');
    },
  });

  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  const handleEdit = () => {
    setEditData({
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      listingType: property.listingType,
      rent: property.rent,
      salePrice: property.salePrice,
      security: property.security,
      maintenance: property.maintenance,
      bhk: property.bhk,
      furnished: property.furnished,
      accommodation: property.accommodation,
      floorNumber: property.floorNumber,
      totalFloors: property.totalFloors,
      carpetArea: property.carpetArea,
      builtUpArea: property.builtUpArea,
      propertyAge: property.propertyAge,
      facingDirection: property.facingDirection,
      possession: property.possession,
      address: property.address,
      city: property.city,
      townSector: property.townSector,
      colony: property.colony,
      landmark: property.landmark,
      latitude: property.latitude,
      longitude: property.longitude,
      apiAddress: property.apiAddress,
      powerBackup: property.powerBackup,
      waterSupply: property.waterSupply,
      parking: property.parking,
      contactName: property.contactName,
      whatsappNo: property.whatsappNo,
      isAvailable: property.isAvailable,
      verificationStatus: property.verificationStatus,
    });
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h1 className="text-2xl font-semibold mt-1">{property.title}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {property.address}, {property.city}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                property.verificationStatus === 'VERIFIED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {property.verificationStatus}
            </span>

            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* ================= EDIT FORM ================= */}
      {isEditing && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Property Details</h2>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      className="w-full border rounded-md p-2"
                      placeholder="Property Title"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={editData.propertyType}
                      onChange={(e) => setEditData({ ...editData, propertyType: e.target.value })}
                    >
                      <option value="ROOM">Room</option>
                      <option value="PG">PG</option>
                      <option value="FLAT">Flat</option>
                      <option value="HOUSE">House</option>
                      <option value="VILLA">Villa</option>
                      <option value="PLOT">Plot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={editData.listingType}
                      onChange={(e) => setEditData({ ...editData, listingType: e.target.value })}
                    >
                      <option value="RENT">Rent</option>
                      <option value="SALE">Sale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
                    <input
                      type="number"
                      className="w-full border rounded-md p-2"
                      value={editData.bhk}
                      onChange={(e) => setEditData({ ...editData, bhk: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Furnished</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={editData.furnished}
                      onChange={(e) => setEditData({ ...editData, furnished: e.target.value })}
                    >
                      <option value="FULLY">Fully Furnished</option>
                      <option value="SEMI">Semi Furnished</option>
                      <option value="NONE">Unfurnished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation</label>
                    <input
                      className="w-full border rounded-md p-2"
                      placeholder="e.g., Family, Bachelor"
                      value={editData.accommodation || ''}
                      onChange={(e) => setEditData({ ...editData, accommodation: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full border rounded-md p-2"
                      rows={4}
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editData.listingType === 'RENT' ? 'Monthly Rent' : 'Sale Price'}
                    </label>
                    <input
                      className="w-full border rounded-md p-2"
                      placeholder="Amount"
                      value={editData.listingType === 'RENT' ? editData.rent : editData.salePrice}
                      onChange={(e) => setEditData({ 
                        ...editData, 
                        [editData.listingType === 'RENT' ? 'rent' : 'salePrice']: e.target.value 
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                    <input
                      className="w-full border rounded-md p-2"
                      placeholder="Security"
                      value={editData.security || ''}
                      onChange={(e) => setEditData({ ...editData, security: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance</label>
                    <input
                      className="w-full border rounded-md p-2"
                      placeholder="Maintenance"
                      value={editData.maintenance || ''}
                      onChange={(e) => setEditData({ ...editData, maintenance: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Property Measurements */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                    <input
                      type="number"
                      className="w-full border rounded-md p-2"
                      value={editData.floorNumber || ''}
                      onChange={(e) => setEditData({ ...editData, floorNumber: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                    <input
                      type="number"
                      className="w-full border rounded-md p-2"
                      value={editData.totalFloors}
                      onChange={(e) => setEditData({ ...editData, totalFloors: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carpet Area (sqft)</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.carpetArea || ''}
                      onChange={(e) => setEditData({ ...editData, carpetArea: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Built-up Area (sqft)</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.builtUpArea || ''}
                      onChange={(e) => setEditData({ ...editData, builtUpArea: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Age</label>
                    <input
                      className="w-full border rounded-md p-2"
                      placeholder="e.g., New, 1-5 years"
                      value={editData.propertyAge || ''}
                      onChange={(e) => setEditData({ ...editData, propertyAge: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facing Direction</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={editData.facingDirection || ''}
                      onChange={(e) => setEditData({ ...editData, facingDirection: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="North-East">North-East</option>
                      <option value="North-West">North-West</option>
                      <option value="South-East">South-East</option>
                      <option value="South-West">South-West</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Possession</label>
                    <input
                      className="w-full border rounded-md p-2"
                      placeholder="e.g., Ready to move"
                      value={editData.possession || ''}
                      onChange={(e) => setEditData({ ...editData, possession: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.city}
                      onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Town/Sector</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.townSector || ''}
                      onChange={(e) => setEditData({ ...editData, townSector: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Colony</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.colony || ''}
                      onChange={(e) => setEditData({ ...editData, colony: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.landmark || ''}
                      onChange={(e) => setEditData({ ...editData, landmark: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full border rounded-md p-2"
                      value={editData.latitude || ''}
                      onChange={(e) => setEditData({ ...editData, latitude: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full border rounded-md p-2"
                      value={editData.longitude || ''}
                      onChange={(e) => setEditData({ ...editData, longitude: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Address (Geocoded)</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.apiAddress || ''}
                      onChange={(e) => setEditData({ ...editData, apiAddress: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Utilities */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Utilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Power Backup</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.powerBackup}
                      onChange={(e) => setEditData({ ...editData, powerBackup: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Water Supply</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.waterSupply}
                      onChange={(e) => setEditData({ ...editData, waterSupply: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.parking}
                      onChange={(e) => setEditData({ ...editData, parking: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.contactName}
                      onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input
                      className="w-full border rounded-md p-2"
                      value={editData.whatsappNo}
                      onChange={(e) => setEditData({ ...editData, whatsappNo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={editData.isAvailable ? 'true' : 'false'}
                      onChange={(e) => setEditData({ ...editData, isAvailable: e.target.value === 'true' })}
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={editData.verificationStatus}
                      onChange={(e) => setEditData({ ...editData, verificationStatus: e.target.value })}
                    >
                      <option value="NOT_VERIFIED">Not Verified</option>
                      <option value="PENDING_PAYMENT">Pending Payment</option>
                      <option value="PENDING_VERIFICATION">Pending Verification</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => updateMutation.mutate(editData)}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {property.images?.length > 0 && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.images.map((img: string, i: number) => (
                  <img
                    key={i}
                    src={img}
                    className="h-40 w-full object-cover rounded-lg"
                    alt=""
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-gray-600 text-sm">{property.description}</p>
          </div>

          {/* Basic Details */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-4">Basic Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Detail icon={<Home />} label="Type" value={property.propertyType} />
              <Detail icon={<Package />} label="Listing" value={property.listingType} />
              <Detail icon={<Bed />} label="BHK" value={property.bhk} />
              <Detail icon={<Sofa />} label="Furnished" value={property.furnished} />
              <Detail icon={<Building />} label="Floor" value={`${property.floorNumber || 'N/A'} / ${property.totalFloors}`} />
              <Detail
                icon={<CheckCircle />}
                label="Available"
                value={property.isAvailable ? 'Yes' : 'No'}
              />
              {property.propertyAge && (
                <Detail icon={<Calendar />} label="Age" value={property.propertyAge} />
              )}
              {property.facingDirection && (
                <Detail icon={<Compass />} label="Facing" value={property.facingDirection} />
              )}
            </div>
          </div>

          {/* Area & Measurements */}
          {(property.carpetArea || property.builtUpArea) && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold mb-4">Area & Measurements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {property.carpetArea && (
                  <Detail icon={<Ruler />} label="Carpet Area" value={`${property.carpetArea} sqft`} />
                )}
                {property.builtUpArea && (
                  <Detail icon={<Layers />} label="Built-up Area" value={`${property.builtUpArea} sqft`} />
                )}
              </div>
            </div>
          )}

          {/* Utilities */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-4">Utilities & Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Detail icon={<Zap />} label="Power Backup" value={property.powerBackup} />
              <Detail icon={<Droplet />} label="Water Supply" value={property.waterSupply} />
              <Detail icon={<Car />} label="Parking" value={property.parking} />
            </div>
          </div>

          {/* Amenities */}
          {((property.insideAmenities && property.insideAmenities.length > 0) || 
            (property.outsideAmenities && property.outsideAmenities.length > 0)) && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold mb-4">Amenities</h2>
              {property.insideAmenities && property.insideAmenities.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Inside Property</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.insideAmenities.map((amenity: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {property.outsideAmenities && property.outsideAmenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Building/Society Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.outsideAmenities.map((amenity: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location Details */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-4">Location Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Address</p>
                <p className="font-medium">{property.address}</p>
              </div>
              {property.landmark && (
                <div>
                  <p className="text-gray-500 mb-1">Landmark</p>
                  <p className="font-medium">{property.landmark}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 mb-1">City</p>
                <p className="font-medium">{property.city}</p>
              </div>
              {property.townSector && (
                <div>
                  <p className="text-gray-500 mb-1">Town/Sector</p>
                  <p className="font-medium">{property.townSector}</p>
                </div>
              )}
              {property.colony && (
                <div>
                  <p className="text-gray-500 mb-1">Colony</p>
                  <p className="font-medium">{property.colony}</p>
                </div>
              )}
              {property.apiAddress && (
                <div>
                  <p className="text-gray-500 mb-1">API Address (Geocoded)</p>
                  <p className="font-medium text-xs">{property.apiAddress}</p>
                </div>
              )}
              {property.latitude && property.longitude && (
                <div>
                  <p className="text-gray-500 mb-1">Coordinates</p>
                  <div className="flex gap-4">
                    <div className="bg-blue-50 px-3 py-2 rounded-lg flex-1">
                      <p className="text-xs text-gray-600">Latitude</p>
                      <p className="font-mono font-semibold text-sm">{property.latitude}</p>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg flex-1">
                      <p className="text-xs text-gray-600">Longitude</p>
                      <p className="font-mono font-semibold text-sm">{property.longitude}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                  >
                    <MapPin className="h-3 w-3" />
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Pricing Details */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-4">Pricing</h2>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">
                  {property.listingType === 'RENT' ? 'Monthly Rent' : 'Sale Price'}
                </p>
                <p className="text-2xl font-bold text-indigo-600">
                  ₹{(property.rent || property.salePrice || 0).toLocaleString('en-IN')}
                </p>
              </div>
              {property.security && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Security Deposit</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{property.security.toLocaleString('en-IN')}
                  </p>
                </div>
              )}
              {property.maintenance && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Maintenance</p>
                  <p className="text-xl font-bold text-orange-600">
                    ₹{property.maintenance.toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-4">Contact Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="font-medium">{property.contactName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <p>{property.whatsappNo}</p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          {property.verifications && property.verifications.length > 0 && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold mb-4">Verification Info</h2>
              <div className="space-y-3 text-sm">
                {property.verifications[0].verifiedAt && (
                  <div>
                    <p className="text-gray-500 mb-1">Verified On</p>
                    <p className="font-medium">
                      {new Date(property.verifications[0].verifiedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}
                {property.verifications[0].employee && (
                  <div>
                    <p className="text-gray-500 mb-1">Verified By</p>
                    <p className="font-medium">
                      {property.verifications[0].employee.firstName} {property.verifications[0].employee.lastName}
                    </p>
                  </div>
                )}
                {property.verifications[0].validUntil && (
                  <div>
                    <p className="text-gray-500 mb-1">Valid Until</p>
                    <p className="font-medium">
                      {new Date(property.verifications[0].validUntil).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}
                {property.verifications[0].verificationNotes && (
                  <div>
                    <p className="text-gray-500 mb-1">Notes</p>
                    <p className="text-xs text-gray-700">{property.verifications[0].verificationNotes}</p>
                  </div>
                )}
                {property.verifications[0].verificationPhotos && property.verifications[0].verificationPhotos.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-2">Verification Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {property.verifications[0].verificationPhotos.map((photo: string, idx: number) => (
                        <img 
                          key={idx}
                          src={photo}
                          alt={`Verification ${idx + 1}`}
                          className="w-full h-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Requests */}
          {property.verificationRequests && property.verificationRequests.length > 0 && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold mb-4">Verification Requests</h2>
              <div className="space-y-4">
                {property.verificationRequests.map((request: any) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          request.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {request.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Payment: ₹{request.amount}</p>
                        <p className={`text-xs ${request.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {request.paymentStatus}
                        </p>
                      </div>

                      {request.verificationLatitude && request.verificationLongitude && (
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-gray-600 font-medium mb-1">Location Captured</p>
                          <p className="text-xs text-gray-700 break-all">{request.verificationAddress}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            {request.verificationLatitude.toFixed(6)}, {request.verificationLongitude.toFixed(6)}
                          </p>
                          <a
                            href={`https://www.google.com/maps?q=${request.verificationLatitude},${request.verificationLongitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                          >
                            View on Map
                          </a>
                        </div>
                      )}

                      {request.verificationPhotos && request.verificationPhotos.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Photos:</p>
                          <div className="grid grid-cols-3 gap-1">
                            {request.verificationPhotos.map((photo: string, idx: number) => (
                              <img 
                                key={idx}
                                src={photo}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-16 object-cover rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {request.reviewNotes && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Review Notes:</p>
                          <p className="text-xs text-gray-700">{request.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner Details */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-4">Owner Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Name</p>
                <p className="font-medium">
                  {property.owner.firstName} {property.owner.lastName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <p className="text-xs break-all">{property.owner.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <p>{property.owner.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Plan Type</p>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {property.owner.planType}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER ================= */
function Detail({ label, value, icon }: any) {
  return (
    <div className="border rounded-lg p-3 flex gap-2 items-center">
      <div className="text-indigo-600">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
