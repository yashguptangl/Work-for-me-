"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    number: "1.",
    title: "General Policy",
    content: `RoomKarts provides digital and service-based offerings, including but not limited to:
• Property verification services
• Digital rent agreement generation services

All payments made for these services are considered service fees.`,
  },
  {
    number: "2.",
    title: "Non-Refundable Services",
    content: `The following payments are non-refundable once the service has been initiated or delivered:

• Property Verification Fee (₹149): Once verification processing has started, the fee is non-refundable.
• Rent Agreement Generation Fee (₹100): Once the rent agreement has been generated or initiated, the fee is non-refundable.

RoomKarts does not provide refunds for:
• Change of mind
• User error in providing incorrect details
• Disputes between users and property owners
• Failure to find a suitable property or tenant`,
  },
  {
    number: "3.",
    title: "Refund Eligibility",
    content: `A refund may be considered only in the following cases:
• Duplicate payment made for the same service
• Technical failure where payment is successful but service is not delivered
• Incorrect amount debited due to system error

Refund eligibility is determined solely by RoomKarts after internal verification.`,
  },
  {
    number: "4.",
    title: "Refund Request Process",
    content: `To request a refund:
• The request must be raised within 7 days from the date of payment.
• Users must provide valid transaction details, including payment ID and registered contact information.
• Requests raised after 7 days will not be considered.`,
  },
  {
    number: "5.",
    title: "Refund Processing Time",
    content: `• Approved refunds will be processed within 7–10 business days.
• Refunds will be credited to the original payment method used during the transaction.
• Processing time may vary depending on the bank or payment provider.`,
  },
  {
    number: "6.",
    title: "Payment Gateway Role",
    content: `• All payments are processed through authorized payment gateway partners: Razorpay, Cashfree, and PayU.
• These payment gateways are PCI-DSS compliant and follow RBI guidelines.
• RoomKarts does not control bank processing timelines or payment gateway refund processing.
• Any delays caused by banks, payment gateways, or third-party payment providers are beyond RoomKarts' control.
• Refunds are initiated from RoomKarts' end but the actual credit depends on the payment gateway and your bank's processing time.
• For payment-specific issues, you may also reach out to the respective payment gateway's support.`,
  },
  {
    number: "7.",
    title: "Cancellation Policy",
    content: `RoomKarts does not support service cancellation once:
• Verification has been initiated, or
• Rent agreement generation has started.

Users are advised to review service details carefully before making a payment.`,
  },
  {
    number: "8.",
    title: "Limitation of Liability",
    content: `RoomKarts shall not be liable for:
• Indirect or consequential losses
• User mistakes in entering information
• Disputes unrelated to the paid service
• Delays caused by third-party payment providers`,
  },
  {
    number: "9.",
    title: "Policy Updates",
    content: `RoomKarts reserves the right to modify or update this Refund Policy at any time.

Changes will be effective immediately upon being posted on the Platform.`,
  },
  {
    number: "10.",
    title: "Contact for Refunds",
    content: `For refund-related queries, contact us at:

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
              Legal · Refund Policy
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              RoomKarts Refund Policy
            </h1>
          </div>
          <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
            Last Updated:{" "}
            <span className="font-medium text-foreground">07 Feb 2026</span>
          </div>
        </div>
        <p className="mt-4 text-xs sm:text-sm md:text-base text-muted-foreground max-w-3xl">
          This Refund Policy explains the conditions under which payments made
          on RoomKarts may be refunded. By using our paid services, you agree to
          the terms outlined below.
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
