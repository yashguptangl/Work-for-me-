"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    number: "1.",
    title: "Purpose",
    content: `This policy describes how Roomkarts collects, uses, and protects personal information obtained from users of our website and services.`,
  },
  {
    number: "2.",
    title: "Information We Collect",
    content: `• Personal identification information (name, email, phone number)
• Token and tracking technologies
• Form Information for Future Growth Plan`,
  },
  {
    number: "3.",
    title: "How We Collect Information",
    content: `• Forms completed on our website
• User account registration
• Website analytics tools
• Token and similar technologies
• Images and multimedia content
• Display content and user interactions`,
  },
  {
    number: "4.",
    title: "Use of Information",
    content: `• Provide and improve our services
• Communicate with users
• Personalize user experience
• Comply with legal obligations`,
  },
  {
    number: "5.",
    title: "Sharing of Information",
    content: `We do not sell your personal data. We are not sharing information with third-party service providers under strict confidentiality and with authorities when required by law. Roomkarts uses industry-standard security measures to protect your information. Roomkarts use your personal data to enhance company services and provide a better user experience.`,
  },
  {
    number: "6.",
    title: "Data Security",
    content: `We implement security measures to protect personal data, including encryption, access controls, and regular audits.`,
  },
  {
    number: "7.",
    title: "User Rights",
    content: `• Access, update, or delete their personal data
• Opt out of communications
• Withdraw consent at any time`,
  },
  {
    number: "8.",
    title: "Changes to This Policy",
    content: `We may update this policy from time to time. Any changes will be posted on this page with an updated revision date.`,
  },
  {
    number: "9.",
    title: "About Roomkarts Privacy Policy",
    content: `At Roomkarts, which you can check out at roomkarts.com, we really care about your privacy. This Privacy Policy explains what kind of info we collect and how we use it. If you've got any more questions or need more details about our Privacy Policy, feel free to reach out to us. Just a heads up, this policy only covers what happens online and is relevant for visitors to our site regarding the info they share or that we gather on Roomkarts. It doesn't apply to any information collected offline or through other channels.`,
  },
  {
    number: "10.",
    title: "Information Collection Details",
    content: `What info we gather: When we ask you for personal info, we'll make it clear what we need and why. If you reach out to us directly, we might get some extra details like your name, email, phone number, and anything you share in your message or attachments. You can also share other info if you want to.

When you sign up for an account, we might ask for some of your contact details, like your name, Photo, Location, address, email, and phone number.`,
  },
  {
    number: "11.",
    title: "Log Files",
    content: `At Roomkarts.in, we have a standard way of using log files. These files keep track of visitors whenever they check out our website. It's something all hosting companies do, and it's a part of their analytics services. The data collected in log files includes stuff like your IP address, browser type, Internet Service Provider (ISP), date and time, pages you came from or left on, and maybe even how many clicks you made. Don't worry this info isn't tied to anything that could personally identify you. We use this information to look at trends, manage the site, monitor how users navigate around, and collect demographic details.`,
  },
  {
    number: "12.",
    title: "Cookies and Web Beacons",
    content: `Just like any other site out there Roomkarts.in uses cookies. These little pieces of data help keep track of things like what visitors like and which pages they checked out on the site. We use this info to make your experience better by adjusting our webpage content based on what kind of browser you're using and other stuff.`,
  },
  {
    number: "13.",
    title: "Third Party Privacy Policies",
    content: `The privacy policies of third parties do not apply to the privacy policy of Roomkarts.com. So, we recommend checking out the respective privacy policies of these third-party ad servers for more info. They might include guidelines on their practices and ways to opt-out of certain options. You can choose to disable cookies through your personal browser settings. For more detailed info on managing cookies with specific web browsers, you can find it on the websites of the respective browsers.`,
  },
  {
    number: "14.",
    title: "Payment and Refund Policy - Legal Compliance",
    content: `We value your privacy and are committed to protecting your personal data in accordance with the Digital Personal Data Protection Act (DPDPA), 2023, and other applicable Indian laws. This Privacy Policy outlines how we collect, use, store, and disclose your personal information, particularly in relation to payments and refunds, when you use our website, mobile application, or services.`,
  },
  {
    number: "15.",
    title: "Your Rights",
    content: `• Access, correct, or delete your personal information
• Object to the processing of your data or withdraw consent (where applicable)
• Nominate another individual to exercise your rights in case of death or incapacity
• File complaints with our Grievance Officer or the Data Protection Board of India

To exercise these rights, contact our Data Protection Officer at roomkartsbusiness@gmail.com by mail or Customer care number.`,
  },
  {
    number: "16.",
    title: "Data Security Measures",
    content: `We use industry-standard security measures, such as encryption and secure servers, to protect your data. However, no system is completely secure, and you should safeguard your account credentials.`,
  },
  {
    number: "17.",
    title: "Cookies Management",
    content: `We use cookies to enhance your browsing experience and track website usage. You can manage cookie preferences via your browser settings.`,
  },
  {
    number: "18.",
    title: "Policy Updates",
    content: `We may update this Privacy Policy periodically. Changes will be posted on our website, and significant updates will be communicated via email. Your continued use of our services constitutes acceptance of the updated policy.`,
  },
  {
    number: "19.",
    title: "Contact Us",
    content: `For privacy-related questions, concerns, or data access requests, contact us at:

Business Name: RoomKarts
Email: business@roomkarts.com
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
            <span className="font-medium text-foreground">21 Feb 2026</span>
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
