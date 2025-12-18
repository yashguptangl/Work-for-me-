"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Heart, Search, Shield, Loader2 } from "lucide-react";

const UserProfilePage = () => {
  const { user, requireRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const u = requireRole(["SEEKER"]);
    if (!u) router.replace("/login?type=seeker");
  }, [requireRole, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const [firstName = "", lastName = ""] = (user.name || "").split("  ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-3 sm:py-4 md:py-6 lg:py-8 px-2 sm:px-3 md:px-4 lg:px-6 max-w-6xl">
        {/* Header Card */}
        <Card className="mb-3 sm:mb-4 md:mb-6 shadow-lg">
          <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3 sm:gap-4 md:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-4 border-white shadow-xl">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`}
                  alt={`${firstName} ${lastName}`}
                />
                <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
                    {firstName} {lastName}
                  </h1>
                  {user.isVerified && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 text-sm break-all">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate max-w-full">{user.email}</span>
                </p>
                <Badge variant="outline" className="mt-2">
                  <User className="h-3 w-3 mr-1" />
                  Property Seeker
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-1 grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 md:gap-4">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-1.5 sm:pb-2 md:pb-3 px-2 sm:px-3 md:px-6 pt-2 sm:pt-3 md:pt-6">
                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                  <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 inline mr-1 sm:mr-1.5 md:mr-2" />
                  <span className="hidden sm:inline">Wishlist</span>
                  <span className="sm:hidden">Wish</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">0</div>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Saved Properties</p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Searches</span>
                  <span className="sm:hidden">Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">0</div>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Recent Searches</p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Member Since</span>
                  <span className="sm:hidden">Since</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-sm sm:text-base md:text-lg font-semibold text-green-600">
                  {user.createdAt ? 
                    new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 
                    'Recently Joined'
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Active User</p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View your account details
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        First Name
                      </p>
                      <p className="text-base sm:text-lg font-semibold break-words">{firstName || "Not set"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        Last Name
                      </p>
                      <p className="text-base sm:text-lg font-semibold break-words">{lastName || "Not set"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                        Email Address
                      </p>
                      <p className="text-base sm:text-lg font-semibold break-all">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        Phone Number
                      </p>
                      <p className="text-base sm:text-lg font-semibold break-words">{user.phone || "Not set"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                        Account Status
                      </p>
                      <Badge variant={user.isVerified ? "default" : "secondary"}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        Role
                      </p>
                      <Badge variant="secondary">Property Seeker</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4 sm:mt-6 shadow-md">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-6">
                <Button variant="outline" className="w-full" onClick={() => router.push("/user/dashboard")} size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  <span className="text-sm">Browse Properties</span>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/user/dashboard")} size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  <span className="text-sm">View Wishlist</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
