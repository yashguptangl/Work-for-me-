"use client";
import React, { useState, useMemo } from "react";
import { useOwnerData } from "@/hooks/useOwnerData";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Home, Loader2, Edit, Eye, EyeOff, Upload, MapPin, Building2, MessageSquare, Phone, User as UserIcon, FileText, Trash } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Link from "next/link";

import ImageUploadModal from "./owner/ImageUploadModal";

import Image from "next/image";
import heroProperty from '@/assets/hero-property.jpg';

const OwnerDashboardPage = () => {
  const { owner, user } = useAuth();
  const { properties, leads, isLoading, error, loadProperties, togglePropertyAvailability, deleteContact } = useOwnerData();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [togglingProperty, setTogglingProperty] = useState<string | null>(null);
  const [deletingContact, setDeletingContact] = useState<string | null>(null);

  // Debug logging
  console.log('OwnerDashboard - User:', user);
  console.log('OwnerDashboard - Owner:', owner);
  console.log('OwnerDashboard - Properties:', properties);
  console.log('OwnerDashboard - IsLoading:', isLoading);
  console.log('OwnerDashboard - Error:', error);

  const initials = useMemo(() => {
    if (typeof window === 'undefined') return 'RD'
    if (!owner?.firstName) return 'RD'
    const first = owner.firstName[0] || ''
    const last = owner.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'RD'
  }, [owner?.firstName, owner?.lastName])

  const draftCount = properties.filter(p => p.isDraft).length;
  const publishedCount = properties.filter(p => !p.isDraft && p.isAvailable).length;
  const hasLoadedData = Array.isArray(properties) && properties.length > 0;

  if (isLoading && !hasLoadedData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-slate-500">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-0">
          <Card className="border border-rose-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
              <p className="text-lg font-semibold text-slate-900 mb-2">{error}</p>

              <p className="text-sm text-slate-600 mb-4">User ID: {user?.id || 'Not found'}</p>
              <p className="text-sm text-slate-600 mb-4">Auth Token: {typeof window !== 'undefined' && localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={loadProperties} variant="outline">
                  Retry
                </Button>
                <Link href="/login?type=owner">
                  <Button>Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-0">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-slate-600 mb-4">No owner data found.</p>
              <Link href="/login?type=owner">
                <Button>Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleToggleAvailability = async (propertyId: string) => {
    setTogglingProperty(propertyId);
    try {
      await togglePropertyAvailability(propertyId);
      toast.success("Success", {
        description: "Property visibility updated successfully"
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to update property visibility"
      });
    } finally {
      setTogglingProperty(null);
    }
  };

  const handleDeleteContact = async (contactId: string, leadName: string) => {
    if (!confirm(`Are you sure you want to delete the contact from ${leadName}?`)) {
      return;
    }
    
    setDeletingContact(contactId);
    try {
      await deleteContact(contactId);
      toast.success("Contact deleted", {
        description: "Contact has been removed successfully"
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to delete contact"
      });
    } finally {
      setDeletingContact(null);
    }
  };

  const handleCompleteListingClick = (propertyId: string) => {
    setSelectedProperty(propertyId);
    setShowImageUpload(true);
  };

  const handleEditClick = (property: any) => {
    // Direct edit without restrictions
    window.location.href = `/owner/edit-property/${property.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 md:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 md:gap-8 px-2 sm:px-3 md:px-6 lg:px-0">
        {/* Welcome Card */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16">
                <AvatarImage src={undefined} alt={owner.firstName + ' ' + owner.lastName} />
                <AvatarFallback className="bg-slate-100 text-sm sm:text-base md:text-lg font-semibold text-slate-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg md:text-2xl font-semibold text-slate-900 truncate">
                  Welcome, {owner.firstName}
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs md:text-sm text-slate-500 hidden sm:block line-clamp-1">
                  Manage your listings
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button 
                onClick={loadProperties} 
                variant="outline" 
                className="w-full sm:w-auto text-xs sm:text-sm" 
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : null}
                Refresh Data
              </Button>
              <Link href="/list-property">
                <Button className="w-full sm:w-auto text-xs sm:text-sm" size="sm">
                  <Home className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Add Property
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards - Hidden on mobile */}
        <div className="hidden sm:grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Total Properties</CardTitle>
              <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
              <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900">{properties.length}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                All listed properties
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Drafts</CardTitle>
              <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
              <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900">{draftCount}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                Pending review
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Published</CardTitle>
              <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-violet-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
              <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900">{publishedCount}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                Live now
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Draft Properties Warning */}
        {draftCount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-6 gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm md:text-base text-orange-900">
                    {draftCount} draft {draftCount === 1 ? 'property' : 'properties'}
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-orange-700 mt-0.5 line-clamp-2">
                    Upload images to complete listings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
          {/* Properties Section */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-sm sm:text-base md:text-lg text-slate-900">
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-violet-500 flex-shrink-0" /> 
                    <span className="line-clamp-1">Properties</span>
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-0.5 hidden sm:block">
                    Manage listings
                  </CardDescription>
                </div>
                {draftCount > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 text-[10px] sm:text-xs flex-shrink-0 h-4 sm:h-5">
                    {draftCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 p-3 sm:p-4 md:p-6">
              {isLoading ? (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                  {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex animate-pulse flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="h-48 w-full rounded bg-slate-200" />
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="flex gap-2">
                      <div className="h-9 flex-1 rounded bg-slate-200" />
                      <div className="h-9 flex-1 rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                <Building2 className="mx-auto mb-3 h-8 w-8 text-violet-300" />
                <p className="font-medium text-slate-600">No properties listed yet</p>
                <p className="mt-2 text-sm">Start building your portfolio by adding your first property.</p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-400">User ID: {user?.id || 'Not found'}</p>
                  <p className="text-xs text-slate-400">Auth: {typeof window !== 'undefined' && localStorage.getItem('authToken') ? 'Authenticated' : 'Not authenticated'}</p>
                  <p className="text-xs text-slate-400">Properties loaded: {hasLoadedData ? 'Yes' : 'No'}</p>
                </div>
                <Link href="/list-property">
                  <Button className="mt-5">
                    <Home className="mr-2 h-4 w-4" />
                    Add New Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                {properties.map((property) => {
                  const displayImage = property.images?.[0] || property.image;
                  
                  return (
                    <div key={property.id} className="flex flex-col gap-2 sm:gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-slate-200">
                      <div className="relative h-40 sm:h-48 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={displayImage || heroProperty}
                          alt={property.title}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = heroProperty.src || '/placeholder.svg';
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-1.5 sm:gap-2">
                          {property.isDraft && (
                            <Badge variant="secondary" className="bg-orange-500 text-white text-[10px] sm:text-xs h-5 sm:h-6">Draft</Badge>
                          )}
                          {property.isVerified && !property.isDraft && (
                            <Badge variant="default" className="bg-emerald-600 text-[10px] sm:text-xs h-5 sm:h-6">Verified</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        <div>
                          <p className="font-medium text-sm sm:text-base text-slate-900 line-clamp-1">{property.title}</p>
                          <p className="mt-0.5 sm:mt-1 flex items-center gap-1 text-xs sm:text-sm text-slate-500">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{property.location}</span>
                          </p>
                        </div>
                        <span className="rounded-full bg-violet-50 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-violet-600 w-fit">
                          ₹{property.rent.toLocaleString()}
                        </span>
                      </div>

                      {property.isDraft && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                          <p className="text-orange-800 font-medium">
                            ⚠️ Complete listing first
                          </p>
                          <p className="text-orange-600 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                            Upload images to publish
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-auto">
                        {property.isDraft && (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => handleCompleteListingClick(property.id)}
                          >
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Complete Listing
                          </Button>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => handleEditClick(property)}
                            title="Edit property"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => handleToggleAvailability(property.id)}
                            disabled={togglingProperty === property.id || property.isDraft}
                            title={property.isDraft ? "Complete listing first to publish" : ""}
                          >
                            {togglingProperty === property.id ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            ) : property.isAvailable ? (
                              <>
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                Live
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                Hidden
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

          {/* Recent Contacts Section */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-sm sm:text-base md:text-lg text-slate-900">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-sky-500" /> Contacts
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs md:text-sm text-slate-500 hidden sm:block">
                Track inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 p-3 sm:p-4 md:p-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex animate-pulse flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="h-3 w-1/2 rounded bg-slate-200" />
                      <div className="h-3 w-1/3 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : !Array.isArray(leads) || leads.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                  <MessageSquare className="mx-auto mb-3 h-8 w-8 text-sky-400" />
                  <p className="font-medium text-slate-600">No contacts yet</p>
                  <p className="mt-2 text-sm">When renters contact you about properties, they'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                  {leads.slice(0, 10).map(lead => (
                    <div key={lead.id} className="space-y-2 sm:space-y-3 rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm hover:border-slate-200 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                            <p className="font-medium text-sm sm:text-base text-slate-900 line-clamp-1">{lead.seekerName}</p>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">
                            {lead.propertyTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                            lead.status === 'NEW' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : lead.status === 'CONTACTED' 
                              ? 'bg-sky-50 text-sky-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {lead.status}
                          </span>
                          <button
                            onClick={() => handleDeleteContact(lead.id, lead.seekerName)}
                            disabled={deletingContact === lead.id}
                            className="flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-md bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            title="Delete contact"
                          >
                            {deletingContact === lead.id ? (
                              <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                            ) : (
                              <Trash className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-sky-500 flex-shrink-0" />
                          <span className="font-medium">{lead.seekerPhone}</span>
                        </div>
                        {lead.message && (
                          <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 mt-0.5 sm:mt-1">
                            {lead.message}
                          </p>
                        )}
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {leads.length > 10 && (
                    <p className="text-center text-xs sm:text-sm text-slate-500 py-1.5 sm:py-2">
                      Showing 10 of {leads.length} contacts
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => {
          setShowImageUpload(false);
          setSelectedProperty(null);
        }}
        propertyId={selectedProperty || ""}
        onSuccess={() => {
          loadProperties();
          setShowImageUpload(false);
          setSelectedProperty(null);
        }}
      />
    </div>
  );
};

export default OwnerDashboardPage;