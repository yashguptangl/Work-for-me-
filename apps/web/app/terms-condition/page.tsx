"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    number: "1.",
    title: "About RoomKarts",
    content: `RoomKarts is an online real estate platform that enables property owners to list properties and allows users to search properties for rent, buy, or sell. RoomKarts acts solely as a technology service provider and does not own, sell, rent, or broker any property.`,
  },
  {
    number: "2.",
    title: "User Eligibility",
    content: `• Users must be 18 years or older to use the Platform.
• By using RoomKarts, you confirm that all information provided by you is true, accurate, and complete.
• RoomKarts reserves the right to suspend or terminate accounts that provide false or misleading information.`,
  },
  {
    number: "3.",
    title: "Account Registration",
    content: `• Users and property owners may be required to create an account to access certain services.
• You are responsible for maintaining the confidentiality of your login credentials.
• RoomKarts is not liable for any unauthorized access resulting from your negligence.`,
  },
  {
    number: "4.",
    title: "Property Listings",
    content: `• Property owners can list unlimited properties including Flats, Rooms, PGs, Houses, and Villas.
• Owners are solely responsible for the accuracy, legality, and authenticity of the property details, images, pricing, and availability.
• RoomKarts does not guarantee property availability, pricing, or suitability.`,
  },
  {
    number: "5.",
    title: "Property Verification Service",
    content: `• RoomKarts provides an optional property verification service at a fee of ₹149 per listing.
• Verification indicates that basic checks were conducted based on information and documents provided by the owner.
• Verification does not guarantee ownership, legal clearance, or condition of the property.
• RoomKarts shall not be responsible for disputes arising after verification.`,
  },
  {
    number: "6.",
    title: "Rent Agreement Generation Service",
    content: `• RoomKarts offers a digital rent agreement generation service for users and owners.
• A service fee of ₹100 is charged for generating a rent agreement.
• RoomKarts is not a law firm and does not provide legal advice.
• The agreement is generated based on information provided by users, and RoomKarts is not responsible for legal enforceability or disputes.`,
  },
  {
    number: "7.",
    title: "Payments & Transactions",
    content: `• All payments are processed securely through authorized payment gateway partners including Razorpay, Cashfree, and PayU.
• RoomKarts does not store any card, UPI, net banking, or wallet details.
• Payment information is encrypted and processed in compliance with PCI-DSS standards.
• Fees paid for services such as verification or rent agreement generation are service charges, not refundable unless explicitly stated.
• Users may be redirected to the payment gateway's secure page to complete transactions.
• RoomKarts complies with all applicable RBI (Reserve Bank of India) guidelines for payment processing.`,
  },
  {
    number: "8.",
    title: "Refund & Cancellation Policy",
    content: `• Payments once made are non-refundable, except in cases of:
  – Duplicate payment
  – Technical failure where service is not delivered
• Refund requests must be raised within 7 days of payment.
• RoomKarts reserves the right to approve or reject refund requests after verification.`,
  },
  {
    number: "9.",
    title: "Platform Role & Limitation of Liability",
    content: `• RoomKarts is not a real estate broker, agent, or mediator.
• We do not participate in negotiations, site visits, payments between users and owners, or final agreements.
• RoomKarts shall not be liable for:
  – Property disputes
  – Fraud or misrepresentation by users
  – Financial losses
  – Legal disputes between parties`,
  },
  {
    number: "10.",
    title: "Prohibited Activities",
    content: `Users must not:
• Post fake, misleading, or illegal listings
• Upload inappropriate or copyrighted content
• Use the Platform for unlawful purposes
• Attempt to bypass payments or platform security
Violation may result in account suspension or permanent termination.`,
  },
  {
    number: "11.",
    title: "Intellectual Property",
    content: `• All content, logos, designs, and branding on RoomKarts are the intellectual property of RoomKarts.
• Unauthorized use, copying, or reproduction is strictly prohibited.`,
  },
  {
    number: "12.",
    title: "Data Privacy",
    content: `• User data is handled as per our Privacy Policy.
• RoomKarts takes reasonable measures to protect user data but does not guarantee absolute security.`,
  },
  {
    number: "13.",
    title: "Service Availability",
    content: `• RoomKarts strives for uninterrupted service but does not guarantee continuous availability.
• Maintenance, upgrades, or technical issues may result in temporary downtime.`,
  },
  {
    number: "14.",
    title: "Termination of Services",
    content: `RoomKarts reserves the right to:
• Suspend or terminate any account without prior notice
• Remove listings that violate Platform policies
• Restrict access for misuse or abuse of services`,
  },
  {
    number: "15.",
    title: "Modifications to Terms",
    content: `• RoomKarts may update these Terms & Conditions at any time.
• Continued use of the Platform after changes implies acceptance of the updated terms.`,
  },
  {
    number: "16.",
    title: "Governing Law & Jurisdiction",
    content: `• These Terms & Conditions shall be governed by the laws of India.
• Any disputes shall be subject to the jurisdiction of Indian courts only.`,
  },
  {
    number: "17.",
    title: "Contact Information",
    content: `For any queries or support, users can contact us at:

Email: roomkartsbusiness@gmail.com
Address: Nagal, Saharanpur, Uttar Pradesh, India - 247551
Support Hours: Monday to Saturday, 10:00 AM – 7:00 PM IST

For payment-related queries, please contact us with your transaction ID and registered contact details.`,
  },
];

const TermsPage = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-muted/60 via-background to-background"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
        {/* Top header strip */}
        <section className="mb-8 sm:mb-10 md:mb-12 rounded-2xl border bg-card/80 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-6 sm:py-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-max text-xs sm:text-sm">
                Legal · Terms & Conditions
              </Badge>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                RoomKarts Terms & Conditions
              </h1>
            </div>
            <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
              Last Updated:{" "}
              <span className="font-medium text-foreground">07 Feb 2026</span>
            </div>
          </div>
          <p className="mt-4 text-xs sm:text-sm md:text-base text-muted-foreground max-w-3xl">
            By accessing or using our website, mobile application, or services
            (“Platform”), you agree to comply with and be bound by these Terms &
            Conditions. If you do not agree with these terms, please do not use
            the Platform.
          </p>
        </section>

        {/* Content card */}
        <section className="rounded-2xl border bg-card/90 backdrop-blur-sm shadow-sm">
          <Card className="border-0 bg-transparent">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="space-y-6 sm:space-y-7 md:space-y-8">
                {sections.map((section) => (
                  <article
                    key={section.number}
                    className="border-b last:border-b-0 border-border/50 pb-5 sm:pb-6 md:pb-7 last:pb-0"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Section number */}
                      <div className="mt-1 text-xs sm:text-sm md:text-base font-semibold text-muted-foreground min-w-[2rem] text-right">
                        {section.number}
                      </div>
                      {/* Title + body */}
                      <div className="flex-1 space-y-2">
                        <h2 className="text-sm sm:text-base md:text-lg font-semibold">
                          {section.title}
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default TermsPage;
