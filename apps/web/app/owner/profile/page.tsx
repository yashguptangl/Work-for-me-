"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOwnerData } from "@/hooks/useOwnerData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Calendar, Home, Shield, Loader2, Crown, Package, FileText } from "lucide-react";

const OwnerProfilePage = () => {
  const { owner, requireRole } = useAuth();
  const { propertyStats, isLoading: statsLoading } = useOwnerData();
  const router = useRouter();

  useEffect(() => {
    const u = requireRole(["OWNER"]);
    if (!u) router.replace("/login?type=owner");
  }, [requireRole, router]);

  if (!owner) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto py-3 sm:py-4 md:py-6 lg:py-8 px-2 sm:px-3 md:px-4 lg:px-6 max-w-7xl">
        {/* Header Card */}
        <Card className="mb-3 sm:mb-4 md:mb-6 shadow-lg border-2">
          <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3 sm:gap-4 md:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-4 border-white shadow-xl">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${owner.firstName} ${owner.lastName}`}
                  alt={`${owner.firstName} ${owner.lastName}`}
                />
                <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-br from-green-500 to-blue-600 text-white">
                  {owner.firstName?.[0]}{owner.lastName?.[1]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent break-words">
                    {owner.firstName} {owner.lastName}
                  </h1>
                  {owner.isVerified && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 text-sm mb-2 break-all">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate max-w-full">{owner.email}</span>
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    Property Owner
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Statistics Section - Full Width */}
        {propertyStats && (
          <Card className="mb-3 sm:mb-4 md:mb-6 shadow-lg border-2">
            <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Property Statistics
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs md:text-sm">
                Overview of your property listings
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {/* Total Properties */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
                    <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Total</CardTitle>
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{propertyStats.total}</div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                      All properties
                    </div>
                  </CardContent>
                </Card>

                {/* Rental Properties */}
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
                    <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Rental</CardTitle>
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{propertyStats.rental.total}</div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                      {propertyStats.rental.active} active
                    </div>
                  </CardContent>
                </Card>

                {/* Buy/Sell Properties */}
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
                    <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Buy/Sell</CardTitle>
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{propertyStats.sale.total}</div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                      {propertyStats.sale.active} active
                    </div>
                  </CardContent>
                </Card>

                {/* Draft Properties */}
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
                    <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Drafts</CardTitle>
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600">{propertyStats.drafts}</div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                      Pending review
                    </div>
                  </CardContent>
                </Card>

                {/* Published Properties */}
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-2.5 md:p-3">
                    <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">Published</CardTitle>
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-600 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="p-2 sm:p-2.5 md:p-3 pt-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">{propertyStats.published}</div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 mt-0.5">
                      Live now
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Details and Quick Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Quick Stats Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg mb-3 sm:mb-4 md:mb-6 lg:mb-0">
              <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Listings</p>
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">{owner.listings || 0}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Properties Listed</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Member Since</p>
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600">{new Date().getFullYear()}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Active Owner</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs md:text-sm">
                  View your account details
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-1.5 md:gap-2">
                        <Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        First Name
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-semibold break-words">{owner.firstName || "Not set"}</p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-1.5 md:gap-2">
                        <Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        Last Name
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-semibold break-words">{owner.lastName || "Not set"}</p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-1.5 md:gap-2">
                        <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        Email Address
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-semibold break-all">{owner.email}</p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-1.5 md:gap-2">
                        <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        Phone Number
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-semibold break-words">{owner.phone || "Not set"}</p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-1.5 md:gap-2">
                        <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        Account Status
                      </p>
                      <Badge variant={owner.isVerified ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                        {owner.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>  
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-3 sm:mt-4 md:mt-6 shadow-md">
              <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                <CardTitle className="text-sm sm:text-base md:text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <Button variant="outline" className="w-full" onClick={() => router.push("/list-property")} size="sm">
                  <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Add Property</span>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/owner/dashboard")} size="sm">
                  <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm">My Properties</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfilePage;
