import nodemailer from 'nodemailer';
import { generateRentAgreementPDF } from './pdfGenerator';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

export const sendRentAgreementEmail = async (
  recipientEmail: string,
  recipientName: string,
  agreementData: any
) => {
  try {
    // Generate PDF
    const pdfBuffer = await generateRentAgreementPDF(agreementData);
    
    const mailOptions = {
      from: `"Roomkarts" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Your Rent Agreement - Roomkarts',
      text: `
Namaste ${recipientName},

Your rent agreement has been successfully generated!

Please find the attached PDF document containing the complete rent agreement.

AGREEMENT DETAILS:
==================

Owner: ${agreementData.ownerFullName}
Owner Email: ${agreementData.ownerEmail}

Tenant: ${agreementData.tenantFullName}
Tenant Email: ${agreementData.tenantEmail}

PROPERTY DETAILS:
==================
Address: ${agreementData.propertyAddress}

FINANCIAL TERMS:
==================
Monthly Rent: ₹${agreementData.rentAmount}
Security Deposit: ₹${agreementData.securityDeposit}
Agreement Duration: ${agreementData.agreementDuration} months
Start Date: ${new Date(agreementData.rentStartDate).toLocaleDateString('en-IN')}

IMPORTANT NOTES:
==================
- This is a legally binding rent agreement
- Please keep this email and PDF for your records
- Both parties should sign the physical copy
- The attached PDF is your official rent agreement document
- For any queries, contact us at support@roomkarts.com

View your complete agreement online:
${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}/rent-agreements

---
© ${new Date().getFullYear()} Roomkarts. All rights reserved.
This is an automated email. Please do not reply.
      `,
      attachments: [
        {
          filename: `Rent_Agreement_${agreementData.ownerFullName}_${agreementData.tenantFullName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${recipientEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error };
  }
};
