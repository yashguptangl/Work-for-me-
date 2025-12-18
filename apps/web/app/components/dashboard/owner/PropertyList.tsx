"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Calendar, IndianRupee } from "lucide-react";

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  isVerified: boolean;
  expiry: string;
  images?: string[];
  type?: string;
}

interface PropertyListProps {
  properties: Property[];
}

const PropertyList: React.FC<PropertyListProps> = ({ properties }) => {
  if (!properties || properties.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground mb-4">No properties listed yet.</p>
          <Link href="/list-property">
            <Button>Add New Property</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => {
        const isExpired = new Date(property.expiry) < new Date();
        
        return (
          <Card key={property.id} className={isExpired ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium truncate">
                  {property.title}
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {property.isVerified && (
                    <Badge variant="default" className="bg-green-600">Verified</Badge>
                  )}
                  {isExpired && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
              <div className="flex items-center font-bold text-lg">
                <IndianRupee className="h-5 w-5" />
                {property.price.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Expires: {new Date(property.expiry).toLocaleDateString()}
              </div>
              <div className="flex gap-2 pt-2">
                <Link href={`/property/${property.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">View</Button>
                </Link>
                <Link href={`/property/edit/${property.id}`} className="flex-1">
                  <Button variant="default" size="sm" className="w-full">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PropertyList;
