"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    number: "1.",
    title: "Monthly Subscription Fee",
    content: `The current monthly subscription fee charged from the owner is Rs 199 as per Roomkarts policy after verifying the property of the owner. Property verification charges may change based on updates in service offerings and operational costs.`,
  },
  {
    number: "2.",
    title: "Privacy Commitment",
    content: `We value your privacy and are committed to protecting your personal data in accordance with the Digital Personal Data Protection Act (DPDPA), 2023, and other applicable Indian laws. This Privacy Policy outlines how we collect, use, store, and disclose your personal information, particularly in relation to payments and refunds, when you use our website, mobile application, or services.`,
  },
  {
    number: "3.",
    title: "Information We Collect",
    content: `• Personal Details: Name, email address, phone number, address, and details provided during account creation.
• Financial Information: Bank account details, credit/debit card information (masked), payment transaction data, and GSTIN (if applicable), collected when you make payments for our Service.
• Identification Information: Government-issued ID (e.g., Aadhaar, passport, or other ID details) for verification, if required. Providing Aadhaar is voluntary.
• Transaction Data: Details of payments and refund requests, including reference numbers and payment history.
• Technical Data: IP address, browser type, device information, and cookies to enhance your experience and track website usage.`,
  },
  {
    number: "4.",
    title: "How We Use Your Information",
    content: `• To process payments for digital services (property verification and rent agreement generation).
• To facilitate refunds as per our Refund Policy.
• To verify your identity for secure transactions, in compliance with applicable laws.
• To communicate with you about your account, refunds, or policy updates.
• To improve our website and services through analytics and user feedback.
• To comply with legal obligations, such as tax reporting or fraud prevention.`,
  },
  {
    number: "5.",
    title: "Payment Processing",
    content: `We use third-party payment gateways to process payments. These gateways have their own privacy policies, which we recommend you review. Your payment data is encrypted per the Payment Card Industry Data Security Standard (PCI-DSS) and is not stored on our servers after the transaction is complete. We only retain transaction data necessary for refunds or dispute resolution.`,
  },
  {
    number: "6.",
    title: "Sharing Your Information",
    content: `• Service Providers: Third-party payment processors, IT service providers, and customer support teams to facilitate payments and refunds.
• Property Owners: Limited information (e.g., name, contact details) to confirm payment transactions or resolve disputes.
• Legal Authorities: When required by law, such as for fraud prevention or tax compliance.

We do not sell or share your personal information for marketing purposes without your consent.`,
  },
  {
    number: "7.",
    title: "Policy Updates",
    content: `We may update this Privacy Policy periodically. Changes will be posted on our website, and significant updates will be communicated via email. Your continued use of our services constitutes acceptance of the updated policy.`,
  },
  {
    number: "8.",
    title: "Contact Information",
    content: `For refund-related queries or privacy concerns, contact us at:

Email: roomkartsbusiness@gmail.com
Address: Nagal, Saharanpur, Uttar Pradesh, India - 247551
Support Hours: Monday to Saturday, 10:00 AM – 7:00 PM IST

When requesting a refund, please provide:
• Transaction ID / Payment ID
• Registered email address and phone number
• Date and amount of payment
• Reason for refund request

Refund requests are reviewed within 3-5 business days, and approved refunds are processed within 7-10 business days.`,
  },
];

const RefundPolicyPage = () => (
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
      {/* Header strip */}
      <section className="mb-8 sm:mb-10 md:mb-12 rounded-2xl border bg-card/80 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-6 sm:py-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-max text-xs sm:text-sm">
              Legal · Payment & Refund Policy
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              RoomKarts Payment & Refund Policy
            </h1>
          </div>
          <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
            Last Updated:{" "}
            <span className="font-medium text-foreground">21 Feb 2026</span>
          </div>
        </div>
        <p className="mt-4 text-xs sm:text-sm md:text-base text-muted-foreground max-w-3xl">
          This policy explains how we collect, use, and protect your personal data in relation to payments and refunds. We are committed to protecting your privacy in accordance with the Digital Personal Data Protection Act (DPDPA), 2023.
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
                    {/* Number */}
                    <div className="mt-1 text-xs sm:text-sm md:text-base font-semibold text-muted-foreground min-w-[2.2rem] text-right">
                      {section.number}
                    </div>
                    {/* Title + content */}
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

export default RefundPolicyPage;
