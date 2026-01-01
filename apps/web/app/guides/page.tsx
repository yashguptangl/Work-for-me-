
"use client";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Search, Shield, Upload, Users, Phone, MessageCircle, Globe, CreditCard } from 'lucide-react';
import Link from 'next/link';

const Step = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
  </div>
);

const Guides = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta */}
      <title>User Guides - Roomlocate | How to List and Find Properties</title>

      {/* Header */}
      <div className="bg-muted/30 py-10">
        <div className="container mx-auto px-4 text-center">
          <Badge className="trust-badge mb-4">Step-by-Step Guides</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">How Roomlocate Works</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Learn how to find the perfect place or list your property in a few simple steps. Secure, verified and easy.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-16 py-10 space-y-12">
        {/* Seeker Guide */}
        <section>
          <div className="mb-6 flex items-center justify-between flex-col sm:flex-row gap-3">
            <h2 className="text-2xl font-bold">For Renters/Seekers</h2>
            <Link href="/properties">
              <Button className="btn-hero">Start Exploring</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 ">
            <Step icon={Search} title="Search Properties" desc="Browse rooms, PGs and flats by location, budget and type." />
            <Step icon={Shield} title="Verified Owners" desc="Look for the verified badge to ensure trust and safety." />
            <Step icon={Home} title="View Details" desc="Open the property page to see photos, amenities and rules." />
            <Step icon={Phone} title="Contact Owner" desc="Use Call or Message to connect directly with the owner." />
            <Step icon={Users} title="Schedule Visit" desc="Fix a visit time and clear your queries in-person or online." />
            <Step icon={CreditCard} title="Book Securely" desc="Proceed with booking as per the owner’s accepted method." />
          </div>
        </section>

        {/* Owner Guide */}
        <section>
          <div className="mb-6 flex items-center justify-between flex-col sm:flex-row gap-3">
            <h2 className="text-2xl font-bold">For Property Owners</h2>
            <Link href="/properties">
              <Button variant="outline" className="px-6">List Your Property</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4  ">
            <Step icon={Users} title="Create Account" desc="Sign up as Owner to access your dashboard." />
            <Step icon={Shield} title="Verify Identity" desc="Complete basic KYC to build trust with renters." />
            <Step icon={Upload} title="Add Property" desc="Enter details like location, pricing, and rules." />
            <Step icon={Globe} title="Add Photos" desc="Upload clear images and highlight amenities to attract renters." />
            <Step icon={MessageCircle} title="Manage Inquiries" desc="Respond to messages and calls from interested tenants." />
            <Step icon={CheckCircle} title="Close the Deal" desc="Schedule visits and finalize bookings securely." />
          </div>
        </section>

        {/* FAQ / Tips */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Tips</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold">For Renters</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Use filters to quickly narrow down to your budget and preferred type.</li>
                  <li>Check reviews and ratings where available.</li>
                  <li>Always confirm details with the owner before payment.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold">For Owners</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Upload bright, high-resolution photos.</li>
                  <li>Keep pricing and availability up-to-date.</li>
                  <li>Respond promptly to inquiries to improve conversions.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Guides;
