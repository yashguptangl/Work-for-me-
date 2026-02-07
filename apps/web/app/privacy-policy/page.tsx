"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    number: "1.",
    title: "Scope of This Privacy Policy",
    content: `This Privacy Policy applies to:
• All visitors, users, and registered members of RoomKarts
• Property owners who list properties on the Platform
• Users who search properties, contact owners, or use paid services
• Transactions and payments processed through third-party payment gateways

This policy does not apply to third-party websites or services that may be linked from the Platform.`,
  },
  {
    number: "2.",
    title: "Information We Collect",
    content: `Personal Information:
• Full name, mobile number, email address
• Login credentials, location details
• Identity or verification details 

Property Information:
• Property type, address, images, descriptions
• Pricing and documents for verification

Payment Information:
• Payments are processed securely through authorized payment gateways: Razorpay, Cashfree, and PayU
• We do not store card, UPI, net banking, or wallet details
• Payment gateways collect transaction data including payment method, amount, timestamp, and transaction status
• All payment data is encrypted and handled in compliance with PCI-DSS and RBI guidelines

Technical & Usage Data:
• IP address, browser/device info, log files
• Pages visited and cookies/usage patterns
• Transaction history and payment receipts`,
  },
  {
    number: "3.",
    title: "How We Use Your Information",
    content: `We use the collected information to:
• Create and manage your account
• Enable property listings and search
• Provide verification and generate rent agreements
• Process and track payments
• Improve Platform performance and features
• Communicate important updates and support messages
• Detect and prevent fraud or misuse
• Comply with legal and regulatory requirements`,
  },
  {
    number: "4.",
    title: "Cookies & Tracking Technologies",
    content: `RoomKarts uses cookies and similar tracking technologies to:
• Remember your preferences and login state
• Improve Platform functionality and performance
• Analyze usage patterns and user behavior

You may disable cookies in your browser settings, but some features of the Platform may not function properly as a result.`,
  },
  {
    number: "5.",
    title: "Information Sharing & Disclosure",
    content: `RoomKarts does not sell, rent, or trade your personal information.

We may share information with:
• Payment Gateway Partners: Razorpay, Cashfree, and PayU for secure payment processing. These partners comply with PCI-DSS standards and RBI regulations.
• Service Providers: Third-party service providers for email delivery, SMS notifications, and customer support.
• Legal Compliance: Government authorities, law enforcement, or regulatory bodies when required by law, court orders, or to prevent fraud.
• Business Transfers: In connection with a merger, acquisition, or business transfer, subject to confidentiality agreements.

All third-party partners are required to:
• Maintain reasonable confidentiality and security measures
• Use information only for specified purposes
• Comply with applicable data protection laws`,
  },
  {
    number: "6.",
    title: "Data Retention",
    content: `We retain personal information for as long as necessary to:
• Provide services you have requested
• Comply with applicable laws and regulations
• Resolve disputes and enforce our agreements

Users may request account deletion or data removal, subject to legal and operational requirements.`,
  },
  {
    number: "7.",
    title: "Data Security Measures",
    content: `RoomKarts implements reasonable security measures including:
• Secure servers and SSL encryption where applicable
• Restricted access to personal information
• Periodic monitoring for unauthorized access

However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    number: "8.",
    title: "User Responsibilities",
    content: `As a user, you are responsible for:
• Keeping your login credentials confidential
• Providing accurate and updated information
• Avoiding sharing sensitive personal or financial details in public sections

RoomKarts is not responsible for any loss or misuse of data resulting from your negligence or voluntary disclosure.`,
  },
  {
    number: "9.",
    title: "Third-Party Links",
    content: `The Platform may contain links to third-party websites or services.

RoomKarts is not responsible for:
• The privacy practices of third-party websites
• The content, security, or policies of such external sites

We recommend reviewing the privacy policies of any third-party sites you visit.`,
  },
  {
    number: "10.",
    title: "Children’s Privacy",
    content: `RoomKarts is intended for users who are 18 years of age or older.

We do not knowingly collect personal information from minors. If we become aware that information from a minor has been collected, we will take reasonable steps to delete such data.`,
  },
  {
    number: "11.",
    title: "Limitation of Liability",
    content: `RoomKarts shall not be liable for:
• Unauthorized access or breaches beyond our reasonable control
• Losses, damages, or disputes arising from third-party actions
• Misuse of information due to user negligence or sharing of credentials`,
  },
  {
    number: "12.",
    title: "Changes to This Privacy Policy",
    content: `RoomKarts may update this Privacy Policy from time to time.

Continued use of the Platform after such changes constitutes your acceptance of the updated Policy. We encourage you to review this page periodically.`,
  },
  {
    number: "13.",
    title: "Governing Law",
    content: `This Privacy Policy is governed by the laws of India.

Any disputes arising under or in connection with this Policy shall be subject to the exclusive jurisdiction of the competent courts in India.`,
  },
  {
    number: "14.",
    title: "Contact Us",
    content: `For privacy-related questions, concerns, or data access requests, contact us at:

Business Name: RoomKarts
Email: roomkartsbusiness@gmail.com
Registered Address: Nagal, Saharanpur, Uttar Pradesh, India - 247551
Support Hours: Monday to Saturday, 10:00 AM – 7:00 PM IST

For data deletion requests, KYC queries, or payment-related privacy concerns, please email us with your registered details and we will respond within 7 business days.`,
  },
];

const PrivacyPolicyPage = () => (
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
      {/* Header panel */}
      <section className="mb-8 sm:mb-10 md:mb-12 rounded-2xl border bg-card/80 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-6 sm:py-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-max text-xs sm:text-sm">
              Legal · Privacy Policy
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              RoomKarts Privacy Policy
            </h1>
          </div>
          <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
            Last Updated:{" "}
            <span className="font-medium text-foreground">07 Feb 2026</span>
          </div>
        </div>
        <p className="mt-4 text-xs sm:text-sm md:text-base text-muted-foreground max-w-3xl">
          This Privacy Policy explains how RoomKarts collects, uses, shares, and
          protects your information when you use our website, mobile
          application, or services (“Platform”). By using the Platform, you
          agree to the practices described in this Policy.
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
                    <div className="mt-1 text-xs sm:text-sm md:text-base font-semibold text-muted-foreground min-w-[2rem] text-right">
                      {section.number}
                    </div>
                    {/* Title + text */}
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

export default PrivacyPolicyPage;
