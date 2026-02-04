"use client";
import React, { useState, useMemo } from "react";
import { Property, useOwnerData } from "@/hooks/useOwnerData";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Home, Loader2, Edit, Eye, EyeOff, Upload, MapPin, Building2, MessageSquare, Phone, User as UserIcon, FileText, Trash, Share2 } from "lucide-react";
import { toast } from "sonner";
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
    if (!owner?.firstName) return 'RD'
    const first = owner.firstName[0] || ''
    const last = owner.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'RD'
  }, [owner?.firstName, owner?.lastName])

  const draftCount = properties.filter(p => p.isDraft).length;
  const publishedCount = properties.filter(p => !p.isDraft && p.isAvailable).length;
  
  // Group properties by listing type
  const rentalProperties = properties.filter(p => p.listingType === 'RENT');
  const saleProperties = properties.filter(p => p.listingType === 'SALE');
  
  const rentalStats = {
    total: rentalProperties.length,
    active: rentalProperties.filter(p => p.isAvailable && !p.isDraft).length,
    draft: rentalProperties.filter(p => p.isDraft).length,
    paused: rentalProperties.filter(p => !p.isAvailable && !p.isDraft).length
  };
  
  const saleStats = {
    total: saleProperties.length,
    active: saleProperties.filter(p => p.isAvailable && !p.isDraft).length,
    draft: saleProperties.filter(p => p.isDraft).length,
    paused: saleProperties.filter(p => !p.isAvailable && !p.isDraft).length
  };
  
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
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update property visibility"
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
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete contact"
      });
    } finally {
      setDeletingContact(null);
    }
  };

  const handleCompleteListingClick = (propertyId: string) => {
    setSelectedProperty(propertyId);
    setShowImageUpload(true);
  };

  const handleEditClick = (property: Property) => {
    // Check if property can be edited (once a month restriction)
    if (property.updatedAt) {
      const lastUpdated = new Date(property.updatedAt);
      const now = new Date();
      const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate < 30) {
        const daysRemaining = 30 - daysSinceUpdate;
        toast.error("Update Restricted", {
          description: `You can only update once a month. Please wait ${daysRemaining} more day${daysRemaining > 1 ? 's' : ''} to edit this property.`,
        });
        return;
      }
    }
    
    // Navigate to edit page
    window.location.href = `/owner/edit-property/${property.id}`;
  };

  const handleDirectEdit = (property: Property) => {
    // Direct edit without restrictions
    window.location.href = `/owner/edit-property/${property.id}`;
  };

  // Render individual property card
  const renderPropertyCard = (property: any) => {
    const displayImage = property.images?.[0] || property.image;
    const price = property.listingType === 'SALE' ? property.salePrice : property.rent;
    const priceLabel = property.listingType === 'SALE' ? 'Price' : 'Rent';
    
    return (
      <div key={property.id} className="flex flex-col gap-2 sm:gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-slate-200">
        <div className="relative h-40 sm:h-48 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={displayImage || heroProperty}
            alt={property.title}
            fill
            unoptimized
            className={`object-cover transition-all duration-300 ${
              property.isAvailable ? '' : 'opacity-30'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Verified Badge - Top Left */}
          {property.verificationStatus === 'VERIFIED' && property.verificationExpiry && new Date(property.verificationExpiry) > new Date() && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg">
              <svg className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[10px] sm:text-xs font-bold">Verified</span>
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-1.5 sm:gap-2 flex-wrap">
            {property.isDraft && (
              <Badge variant="secondary" className="bg-orange-500 text-white text-[10px] sm:text-xs h-5 sm:h-6">Draft</Badge>
            )}
            {property.listingType === 'SALE' && (
              <Badge variant="secondary" className="bg-purple-500 text-white text-[10px] sm:text-xs h-5 sm:h-6">Sale</Badge>
            )}
            {property.listingType === 'RENT' && (
              <Badge variant="secondary" className="bg-blue-500 text-white text-[10px] sm:text-xs h-5 sm:h-6">Rent</Badge>
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
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-violet-50 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-violet-600">
              ₹{(price || 0).toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">{priceLabel}</span>
          </div>
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
          {/* Verification Badge - Active */}
          {property.verificationStatus === 'VERIFIED' && property.verificationExpiry && new Date(property.verificationExpiry) > new Date() && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 sm:p-2 md:p-3 text-[10px] sm:text-xs flex justify-between items-center">
              <p className="text-green-800 font-semibold flex items-center gap-1 sm:gap-1.5">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate">Verified Property</span>
              </p>
              <p className="text-green-600 text-[9px] sm:text-[10px] mt-0.5 sm:mt-1">
                Valid until {new Date(property.verificationExpiry).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {/* Verification Badge - Expired */}
          {(property.verificationStatus === 'EXPIRED' || (property.verificationStatus === 'VERIFIED' && property.verificationExpiry && new Date(property.verificationExpiry) <= new Date())) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-1.5 sm:p-2 md:p-3 text-[10px] sm:text-xs">
              <p className="text-orange-800 font-semibold flex items-center gap-1 sm:gap-1.5">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate">⏰ Verification Expired</span>
              </p>
              <p className="text-orange-600 text-[9px] sm:text-[10px] mt-0.5 sm:mt-1">
                Renew to regain verified badge
              </p>
            </div>
          )}
          
          {/* Verification Pending Badge - Single Line */}
          {property.verificationStatus === 'PENDING_VERIFICATION' && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg sm:rounded-xl p-1 sm:p-1.5 shadow-sm">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-yellow-500 animate-pulse flex-shrink-0"></div>
                  <p className="text-yellow-900 font-semibold text-[10px] sm:text-xs md:text-sm truncate">⏳ Verification Pending</p>
                </div>
                <span className="text-[9px] sm:text-[10px] md:text-xs text-yellow-700 bg-yellow-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap flex-shrink-0">Under Review</span>
              </div>
            </div>
          )}
          
          {property.isDraft && (
            <Button
              variant="default"
              size="sm"
              className="w-full bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm h-9 sm:h-10 font-medium"
              onClick={() => handleCompleteListingClick(property.id)}
            >
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Complete Listing
            </Button>
          )}
          
          {/* Get Verified Button - Modern Premium UI */}
          {!property.isDraft && 
           (property.verificationStatus === 'NOT_VERIFIED' || 
            property.verificationStatus === 'EXPIRED' ||
            (property.verificationStatus === 'VERIFIED' && property.verificationExpiry && new Date(property.verificationExpiry) <= new Date())) && 
           property.verificationStatus !== 'PENDING_VERIFICATION' && (
            <Link href={`/owner/verify-property/${property.id}`} className="w-full">
              <Button
                variant="default"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white text-[10px] sm:text-xs md:text-sm h-9 sm:h-10 md:h-11 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-blue-500/20"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="truncate">
                    {property.verificationStatus === 'EXPIRED' ? '🔄 Renew Verification' : '🛡️ Get Verified'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] md:text-xs font-normal bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">₹199</span>
                </div>
              </Button>
            </Link>
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
  };

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 md:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 md:gap-8 px-2 sm:px-3 md:px-6 lg:px-0">
        {/* Welcome Card */}
        <Card className="border border-slate-200 bg-white shadow-sm relative">
          <CardHeader className="p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
            {/* Share Icon Button - Top Right */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Share Profile"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 rounded-full p-2 hover:bg-blue-100 focus:bg-blue-200 transition z-10"
              onClick={async () => {
                try {
                  const url = `${window.location.origin}/owner/profile/${owner.id}`;
                  
                  if (navigator.share) {
                    await navigator.share({
                      title: `Owner Profile | roomkarts`,
                      text: `Check out my owner profile and listed properties on roomkarts!`,
                      url,
                    });
                    toast.success("Profile shared successfully!");
                  } else {
                    // Fallback for clipboard - create temp textarea
                    const textArea = document.createElement("textarea");
                    textArea.value = url;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                      document.execCommand('copy');
                      textArea.remove();
                      toast.success("Profile link copied!", { description: "Share it anywhere." });
                    } catch (err) {
                      textArea.remove();
                      throw err;
                    }
                  }
                } catch (err: any) {
                  // Ignore if user cancelled the share dialog
                  if (err.name === 'AbortError' || err.message?.includes('cancel')) {
                    return;
                  }
                  console.error('Share error:', err);
                  toast.error("Failed to share", { description: "Please try again." });
                }
              }}
            >
              <Share2 className="h-5 w-5 text-blue-600" />
            </Button>
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
                onClick={() => {
                  const contactSection = document.getElementById('contacted-users');
                  contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                variant="outline"
                className="w-full sm:w-auto text-xs sm:text-sm md:hidden" 
                size="sm"
              >
                <MessageSquare className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Jump to Contacts
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
        <div className="hidden sm:grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-5">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Total Properties</CardTitle>
              <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
              <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900">{properties.length}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                All properties
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Rental</CardTitle>
              <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
              <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900">{rentalStats.total}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                {rentalStats.active} active
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Buy/Sell</CardTitle>
              <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-purple-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
              <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900">{saleStats.total}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                {saleStats.active} active
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
              <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
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
          {/* Properties Section with Tabs */}
          <Card id="listed-properties" className="border border-slate-200 bg-white shadow-sm scroll-mt-20">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-sm sm:text-base md:text-lg text-slate-900">
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-violet-500 flex-shrink-0" /> 
                    <span className="line-clamp-1">My Properties</span>
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-0.5 hidden sm:block">
                    Manage your rental and sale listings
                  </CardDescription>
                </div>
                {draftCount > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 text-[10px] sm:text-xs flex-shrink-0 h-4 sm:h-5">
                    {draftCount} Draft
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              {isLoading ? (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex animate-pulse flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="h-48 w-full rounded bg-slate-200" />
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="h-3 w-1/2 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                  <Building2 className="mx-auto mb-3 h-8 w-8 text-violet-300" />
                  <p className="font-medium text-slate-600">No properties listed yet</p>
                  <p className="mt-2 text-sm">Start building your portfolio by adding your first property.</p>
                  <Link href="/list-property">
                    <Button className="mt-5">
                      <Home className="mr-2 h-4 w-4" />
                      Add New Property
                    </Button>
                  </Link>
                </div>
              ) : (
                <Tabs defaultValue="rental" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="rental" className="text-xs sm:text-sm">
                      Rental ({rentalStats.total})
                    </TabsTrigger>
                    <TabsTrigger value="sale" className="text-xs sm:text-sm">
                      Buy/Sell ({saleStats.total})
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Rental Properties Tab */}
                  <TabsContent value="rental" className="space-y-3">
                    {rentalProperties.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                        <Home className="mx-auto mb-2 h-6 w-6 text-green-300" />
                        <p className="text-sm">No rental properties yet</p>
                      </div>
                    ) : (
                      rentalProperties.map((property) => renderPropertyCard(property))
                    )}
                  </TabsContent>

                  {/* Sale Properties Tab */}
                  <TabsContent value="sale" className="space-y-3">
                    {saleProperties.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                        <Building2 className="mx-auto mb-2 h-6 w-6 text-purple-300" />
                        <p className="text-sm">No sale properties yet</p>
                      </div>
                    ) : (
                      saleProperties.map((property) => renderPropertyCard(property))
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Recent Contacts Section */}
          <Card id="contacted-users" className="border border-slate-200 bg-white shadow-sm scroll-mt-20">
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
                  <p className="mt-2 text-sm">When renters contact you about properties, they&apos;ll appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                  {leads.slice(0, 10).map(lead => (
                    <div key={lead.id} className="rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm hover:border-slate-200 transition">
                      {/* Row 1: Name + Badge + Status + Delete */}
                      <div className="flex items-start justify-between gap-2 ">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                          <p className="font-medium text-sm sm:text-base text-slate-900">{lead.seekerName}</p>
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] sm:text-xs h-4 sm:h-5 ${
                              lead.propertyListingType === 'SALE' 
                                ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                : 'bg-green-100 text-green-700 border-green-300'
                            }`}
                          >
                            {lead.propertyListingType === 'SALE' ? 'Buy/Sell' : 'Rent'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <span className={`rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium ${
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
                            className="flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-md bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      
                      {/* Row 2: Property Address/Title */}
                      <p className="text-xs sm:text-sm text-slate-600 mb-1">
                        {lead.propertyTitle}
                      </p>
                    
                      
                      {/* Row 4: Phone + Date */}
                      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
                        <a 
                          href={`tel:${lead.seekerPhone}`}
                          className="flex items-center gap-1.5 sm:gap-2 hover:text-sky-600 transition-colors cursor-pointer"
                        >
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-sky-500 flex-shrink-0" />
                          <span className="font-medium">{lead.seekerPhone}</span>
                        </a>
                        <span className="text-[10px] sm:text-xs text-slate-400">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
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