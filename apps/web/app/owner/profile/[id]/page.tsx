"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, MapPin } from "lucide-react";

type Owner = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
};
type Property = {
  id: string;
  title: string;
  city?: string;
  rent?: number;
  salePrice?: number;
  listingType?: string;
  propertyImage?: string;
  location?: string;
  isAvailable?: boolean;
  isVerified?: boolean;
};
type OwnerProfileData = {
  owner: Owner;
  properties: Property[];
};

async function fetchOwnerProfileAndProperties(ownerId: string): Promise<OwnerProfileData> {
  const [profileRes, propertiesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/owner/public-profile/${ownerId}`),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/owner/public-properties/${ownerId}`),
  ]);
  const profileJson = await profileRes.json();
  const propertiesJson = await propertiesRes.json();
  return {
    owner: profileJson.data,
    properties: propertiesJson.data,
  };
}


const PublicOwnerProfilePage = () => {
  const params = useParams();
  const ownerId = params?.id as string;
  const [data, setData] = useState<OwnerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ownerId) {
      fetchOwnerProfileAndProperties(ownerId)
        .then((res) => {
          setData(res);
        })
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [ownerId]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!data) return <div className="flex justify-center items-center min-h-screen">Profile not found.</div>;

  const { owner, properties } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-2 px-1 sm:px-2 md:px-3">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-3 shadow-lg border-2">
          <CardContent className="pt-3 flex flex-col items-center">
            <Avatar className="h-20 w-20 border-4 border-white shadow-xl mb-2">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${owner.firstName} ${owner.lastName}`} alt={`${owner.firstName} ${owner.lastName}`}/>
              <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-blue-600 text-white">
                {owner.firstName?.[0]}{owner.lastName?.[1]}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1 text-center">{owner.firstName} {owner.lastName}</h1>
            {owner.isVerified && <Badge className="bg-green-100 text-green-700 border-green-200 mb-2">Verified</Badge>}
            <p className="text-muted-foreground text-sm mb-2 break-all text-center">{owner.email}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2"><Home className="h-5 w-5 text-blue-600"/>Listed Properties</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Properties listed by this owner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {properties.map((property: Property) => (
                <div
                  key={property.id}
                  className="flex flex-col rounded-xl border bg-white shadow-md hover:shadow-xl transition overflow-hidden h-full group"
                  style={{ minHeight: 260 }}
                >
                  <div className="relative w-full h-32 sm:h-28 overflow-hidden">
                    <img
                      src={property.propertyImage || "/placeholder.jpg"}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between p-2">
                    <div>
                      <h2 className="text-base sm:text-[1rem] font-semibold text-slate-900 mb-1 line-clamp-1">{property.title}</h2>
                      <div className="flex items-center gap-1 text-slate-600 text-xs sm:text-sm mb-1">
                        <MapPin className="h-4 w-4"/>
                        <span className="truncate">{property.location || property.city}</span>
                      </div>
                      {property.rent && (
                        <div className="text-blue-700 font-bold text-xs sm:text-sm mb-1">₹{property.rent.toLocaleString()} /mo</div>
                      )}
                      {property.salePrice && (
                        <div className="text-purple-700 font-bold text-xs sm:text-sm mb-1">₹{property.salePrice.toLocaleString()} (Sale)</div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={property.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}>{property.isAvailable ? "Available" : "Not Available"}</Badge>
                        {property.isVerified && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Verified</Badge>
                        )}
                      </div>
                    </div>
                    <Link href={`/properties/${property.id}`} className="mt-2 inline-block w-full">
                      <Button variant="outline" size="sm" className="w-full">View Property</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicOwnerProfilePage;
