se client";
import React, { useState, useMemo } from "react";
import { useOwnerData } from "@/hooks/useOwnerData";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Home, Loader2, Edit, Eye, EyeOff, Upload, MapPin, Building2, MessageSquare, Phone, User as UserIcon, FileText, Trash, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import LoadingSkeleton from "../LoadingSkeleton";
import VerificationModal from "../VerificationModal";

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    owner, 
    properties, 
    contacts, 
    mutateOwnerProperties,
    toggleAvailability,
    deleteProperty,
    deleteContact,
    requestVerification
  } = useOwnerData(user?.userId);
  
  const [verificationProperty, setVerificationProperty] = useState<any>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  console.log('OwnerDashboard - Owner:', owner);
  console.log('OwnerDashboard - Properties:', properties);  
  console.log('OwnerDashboard - Error:', error);

  const initials = useMemo(() => {
    if (!owner?.firstName) return 'RD'
    const first = owner.firstName[0] || ''
    const last = owner.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'RD'
  }, [owner?.firstName, owner?.lastName]);

  const draftCount = properties.filter(p => p.isDraft).length;
  const publishedCount = properties.filter(p => !p.isDraft && p.isAvailable).length;
  const hasLoadedData = Array.isArray(properties) && properties.length > 0;

  if (isLoading && !hasLoadedData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
            <p className="text-center text-gray-600 mt-4">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
              <p className="text-gray-600 mb-4">
                {error?.message || 'Something went wrong while loading your dashboard.'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Incomplete</h2>
            <p className="text-gray-600">Please complete your owner profile to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggleAvailability = async (propertyId: string) => {
    try {
      await toggleAvailability(propertyId);
      toast.success("Success", {
        description: "Property availability updated successfully"
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to update property availability"
      });
    } finally {
      // Refresh data
    }
  };

  const handleDeleteContact = async (contactId: string, leadName: string) => {
    if (!confirm(\`Are you sure you want to delete the contact from \${leadName}?\`)) {
      return;
    }
    
    try {
      await deleteContact(contactId);
      toast.success("Contact deleted", {
        description: "Contact has been removed from your leads"
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to delete contact"
      });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProperty(propertyId);
      toast.success("Property deleted", {
        description: "Property has been removed successfully"
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to delete property"
      });
    }
  };

  const handleRequestVerification = async (propertyId: string) => {
    await requestVerification(propertyId);
  };

  const getVerificationStatusBadge = (verificationStatus?: string) => {
    if (!verificationStatus || verificationStatus === "NOT_VERIFIED") {
      return null;
    }
    
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING_PAYMENT: { label: "Payment Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      PENDING_VERIFICATION: { label: "Under Review", className: "bg-blue-100 text-blue-800 border-blue-300" },
      VERIFIED: { label: "Verified", className: "bg-green-100 text-green-800 border-green-300" },
      EXPIRED: { label: "Expired", className: "bg-red-100 text-red-800 border-red-300" },
    };

    const config = statusConfig[verificationStatus];
    if (!config) return null;

    return (
      <Badge variant="secondary" className={\`\${config.className} text-[10px] sm:text-xs h-5 sm:h-6\`}>
        {config.label}
      </Badge>
    );
  };

  const handleDirectEdit = (property: any) => {
    // Direct edit without restrictions
    window.location.href = \`/owner/edit-property/\${property.id}\`;
  };

  const openVerificationModal = (property: any) => {
    setVerificationProperty(property);
    setShowVerificationModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 md:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 md:gap-8 px-2 sm:px-3 md:px-4 lg:px-0">
        {/* Owner Header */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16">
                <AvatarImage src={undefined} alt={owner.firstName + ' ' + owner.lastName} />
                <AvatarFallback className="bg-slate-100 text-sm sm:text-base md:text-lg font-semibold text-slate-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5 sm:space-y-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">
                  {owner.firstName} {owner.lastName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">{owner.email}</p>
                <p className="text-xs sm:text-sm text-slate-600">{owner.phone}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/list-property'}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                List Property
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700">{properties.length}</div>
              <div className="text-xs sm:text-sm md:text-base text-blue-600">Total Properties</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700">{publishedCount}</div>
              <div className="text-xs sm:text-sm md:text-base text-green-600">Published</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-700">{draftCount}</div>
              <div className="text-xs sm:text-sm md:text-base text-yellow-600">Drafts</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-700">{contacts.length}</div>
              <div className="text-xs sm:text-sm md:text-base text-purple-600">Leads</div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Your Properties
            </CardTitle>
            <CardDescription>Manage your listed properties</CardDescription>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="text-center py-8">
                <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first property listing</p>
                <Button onClick={() => window.location.href = '/list-property'}>
                  <Upload className="mr-2 h-4 w-4" />
                  List Your First Property
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="relative group">
                    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg border-gray-200">
                      <div className="relative">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={property.images?.[0] || "/placeholder-property.jpg"}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1.5 sm:gap-2">
                          {property.isDraft && (
                            <Badge variant="secondary" className="bg-orange-500 text-white text-[10px] sm:text-xs h-5 sm:h-6">Draft</Badge>
                          )}
                          {getVerificationStatusBadge(property.verificationStatus)}
                        </div>
                      </div>
                      
                      <CardContent className="p-3 sm:p-4 space-y-2">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">{property.title}</h3>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">{property.address}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Building2 className="h-3 w-3" />
                            <span>{property.propertyType}</span>
                          </div>
                          <div className="text-sm font-bold text-blue-600">
                            ₹{property.rentAmount?.toLocaleString()}/month
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex gap-1">
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDirectEdit(property)}
                              className="h-7 px-2 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAvailability(property.id)}
                              className={\`h-7 px-2 text-xs \${property.isAvailable ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}\`}
                            >
                              {property.isAvailable ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Live
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Hidden
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <div className="flex gap-1">
                            {property.verificationStatus !== "VERIFIED" && !property.isDraft && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openVerificationModal(property)}
                                className="h-7 px-2 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verify
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProperty(property.id)}
                              className="h-7 px-2 text-xs border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Leads ({contacts.length})
            </CardTitle>
            <CardDescription>People interested in your properties</CardDescription>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                <p className="text-gray-500">Leads will appear here when people contact you about your properties</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{contact.name}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{contact.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            <span className="truncate">{contact.propertyTitle}</span>
                          </div>
                        </div>
                        
                        {contact.message && (
                          <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                              <span>{contact.message}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString()} at {new Date(contact.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                        className="ml-4 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {contacts.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">
                      View All Leads ({contacts.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Modal */}
      {verificationProperty && (
        <VerificationModal
          property={{
            id: verificationProperty.id,
            title: verificationProperty.title,
            verificationStatus: verificationProperty.verificationStatus || "NOT_VERIFIED",
            verificationExpiry: verificationProperty.verificationExpiry,
          }}
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationProperty(null);
          }}
          onRequestVerification={handleRequestVerification}
        />
      )}
    </div>
  );
};

export default OwnerDashboardPage;