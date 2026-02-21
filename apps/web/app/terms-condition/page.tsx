"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    number: "1.",
    title: "Introduction",
    content: `This website is owned and operated by Roomkarts. These Terms govern your use of our site and services. By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of the terms, please do not use our services.`,
  },
  {
    number: "2.",
    title: "Services Offered",
    content: `We provide digital rental services, including verified listings for PGs, rental flats, and hourly rooms across India.`,
  },
  {
    number: "3.",
    title: "Use of Website",
    content: `• You agree to use this site for lawful purposes only.
• You must not damage, disable, or impair the website.
• Providing false information, placing fake properties, or attempting fraud is strictly prohibited.`,
  },
  {
    number: "4.",
    title: "Payments and Refunds",
    content: `All payments are processed securely or other authorized payment gateways. Refunds may be issued within 7 days of purchase, subject to our refund policy and proof of a valid issue.`,
  },
  {
    number: "5.",
    title: "Privacy",
    content: `We respect your privacy and are committed to protecting your personal data. Please review our Privacy Policy for more details.`,
  },
  {
    number: "6.",
    title: "Changes to Terms",
    content: `We reserve the right to modify or update these Terms at any time. Any changes will be posted on this page with an updated revision date.`,
  },
  {
    number: "7.",
    title: "Terms of Service Agreement",
    content: `PLEASE READ THIS TERMS OF SERVICE AGREEMENT CAREFULLY. BY USING THIS WEBSITE OR ORDERING SERVICE FROM THIS WEBSITE YOU AGREE TO BE BOUND BY ALL OF THE TERMS AND CONDITIONS OF THIS AGREEMENT.

This Terms of Service Agreement (the "Agreement") governs your use of this website, roomkarts.com (the "Website"), offer of Service on this Website, or your use of information available on this Website. This Agreement includes, and incorporates by this reference, the policies and guidelines referenced below. Roomkarts reserves the right to change or revise the terms and conditions of this Agreement at any time by posting any changes or a revised Agreement on this Website. Roomkarts.com will alert you that changes or revisions have been made by indicating on the top of this Agreement the date it was last revised. The changed or revised Agreement will be effective immediately after it is posted on this Website. Your use of the Website following the posting of any such changes or of a revised Agreement will constitute your acceptance of any such changes or revisions. Roomkarts encourages you to review this Agreement whenever you visit the Website to make sure that you understand the terms and conditions governing use of the Website. This Agreement does not alter in any way the terms or conditions of any other written agreement you may have with Roomkarts for other services. If you do not agree to this Agreement (including any referenced policies or guidelines), please immediately terminate your use of the Website. If you would like to print this Agreement, please click the print button on your browser toolbar.`,
  },
  {
    number: "8.",
    title: "Service",
    content: `Terms of Offer: This Website offers Rental Room, PG, Flat, Hourly Room Based Service (the "Service"). By placing an order for Service through this Website, you agree to the terms set forth in this Agreement.

Customer Solicitation:
Unless you notify our third party call center reps or direct Roomkarts Team, while they are calling you, of your desire to opt out from further direct company communications and solicitations, you are agreeing to continue to receive further emails and call solicitations from Roomkarts and its designated in-house or third party call team(s).

Opt-Out Procedure:
We provide 3 easy ways to opt out of future solicitations: 1. You may use the opt out link found in any email solicitation that you may receive. 2. You may also choose to opt out by sending your email address to: roomkartsbusiness@gmail.com. 3. You may notify our representatives directly.

Proprietary Rights:
Roomkarts has proprietary rights and trade secrets in the Service. You may not copy, reproduce, or distribute content by Roomkarts. Roomkarts also has rights to all trademarks and trade dress and specific layouts of this webpage, including calls to action, text placement, images and other information.

Sales Tax:
If you use any Service, you will not be responsible for paying any applicable sales tax.`,
  },
  {
    number: "9.",
    title: "Website",
    content: `Content; Intellectual Property:
This Website offers information and Services. Roomkarts does not always create the information offered on this Website; instead the information is often gathered from various sources. To the extent that Roomkarts does create the content on this Website, such content is protected by intellectual property laws of India. Unauthorized use of the material may violate copyright, trademark, and/or other laws. You acknowledge that your use of the content on this Website is for personal, noncommercial use. Roomkarts does not endorse the contents on any third-party websites.

Use of Website:
Roomkarts is not responsible for any damages resulting from use of this website by anyone. You will not use the Website for illegal purposes. You will (1) abide by all applicable local, state, national, and international laws and regulations in your use of the Website (including laws regarding intellectual property), (2) not interfere with or disrupt the use and enjoyment of the Website by other users, (3) not engage, directly or indirectly, in transmission of "spam", chain letters, junk mail or any other type of unsolicited communication, and (4) not defame, harass, abuse, or disrupt other users of the Website.

License:
By using this Website, you are granted a limited, non-exclusive, non-transferable right to use the content and materials on the Website in connection with your normal, noncommercial use of the Website. You may not copy, reproduce, transmit, distribute, or create derivative works of such content or information without express written authorization from Roomkarts.

Posting:
By posting, storing, or transmitting any content on the Website, you acknowledge that Roomkarts does not have the ability to control the nature of the user-generated content offered through the Website. You are solely responsible for your interactions with other users of the Website and any content you post. Roomkarts is not liable for any damage or harm resulting from any posts by or interactions between users.`,
  },
  {
    number: "10.",
    title: "Limitation of Liability",
    content: `Roomkarts's entire liability, and your exclusive remedy, in law, in equity, or otherwise, with respect to the website content and service and/or for any breach of this Agreement is solely limited to the amount you paid. Some jurisdictions do not allow the limitation or exclusion of liability for incidental or consequential damages so some of the above limitations may not apply to you.`,
  },
  {
    number: "11.",
    title: "Privacy Policy",
    content: `Roomkarts believes strongly in protecting user privacy and providing you with notice of Roomkarts's use of data. Please refer to Roomkarts's privacy policy, incorporated by reference herein, that is posted on the Website.`,
  },
  {
    number: "12.",
    title: "Agreement to be Bound",
    content: `By using this Website Service, you acknowledge that you have read and agree to be bound by this Agreement and all terms and conditions on this Website.`,
  },
  {
    number: "13.",
    title: "Feedback and Information",
    content: `Any feedback you provide at this site shall be deemed to be non-confidential. Roomkarts shall be free to use such information on an unrestricted basis. The information contained in this website is subject to change without notice.`,
  },
  {
    number: "14.",
    title: "Contact Information",
    content: `For any queries or support, users can contact us at:

Email: business@roomkarts.com
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
              <span className="font-medium text-foreground">21 Feb 2026</span>
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
