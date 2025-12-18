import {prisma} from "@repo/db/prisma";
import { Request, Response } from "express";

export const preverifySendOtp = async (req :Request, res : Response) =>{
    const { mobile } = req.body;
  if (!mobile) {
    res.status(400).json({ message: "Mobile is required" });
    return;
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  const existing = await prisma.tempMobileVerification.findUnique({
    where: { mobile },
  });

  if (existing) {
    // update existing
    await prisma.tempMobileVerification.update({
      where: { mobile },
      data: { otp, expiresAt, verified: false },
    });
  } else {
    // new record
    await prisma.tempMobileVerification.create({
      data: { mobile, otp, expiresAt },
    });
  }
    // Send OTP via WhatsApp
    // await sendOtpViaWhatsApp(mobile, otp.toString());
  res.status(200).json({ message: "OTP sent successfully to registered WhatsApp No" });
  return;
}

export const preverifyVerifyOtp = async (req :Request, res : Response) =>{
    const { mobile, otp } = req.body;

  const record = await prisma.tempMobileVerification.findUnique({
    where: { mobile },
  });

  if (!record) {
    res.status(404).json({ message: "Mobile not found" });
    return;
  }

  if (record.expiresAt < new Date()) {
    res.status(400).json({ message: "OTP expired" });
    return;
  }

  if (record.otp !== parseInt(otp)) {
    res.status(401).json({ message: "Invalid OTP" });
    return;
  }

  await prisma.tempMobileVerification.update({
    where: { mobile },
    data: { verified: true },
  });

  res.status(200).json({ message: "Mobile verified successfully" });
  return;
};

export const preverifyResendOtp = async (req: Request , res: Response) =>{
    const { mobile } = req.body;
  if (!mobile) {
    res.status(400).json({ message: "Mobile is required" });
    return;
  }

  // Call send-otp logic
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.tempMobileVerification.update({
    where: { mobile },
    data: { otp, expiresAt, verified: false },
  });

    // Send OTP via WhatsApp
    // await sendOtpViaWhatsApp(mobile, otp.toString());
  res.status(200).json({ message: "OTP resent successfully" });
  return;

}

// Owner Listing OTP - Send OTP for property listing verification
export const generateOwnerListingOTP = async (req: Request, res: Response) => {
  const ownerId = req.user?.userId;
  const { mobile } = req.body;

  if (!ownerId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!mobile) {
    res.status(400).json({ message: "Mobile number is required" });
    return;
  }

  // Validate mobile number format (10 digits)
  if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
    res.status(400).json({ message: "Invalid mobile number. Must be 10 digits" });
    return;
  }

  // Verify the owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    res.status(404).json({ message: "Owner not found" });
    return;
  }

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  console.log('Generated OTP for', mobile, ':', otp);

  // Store or update OTP
  const existingRecord = await prisma.tempMobileVerification.findUnique({
    where: { mobile },
  });

  if (existingRecord) {
    await prisma.tempMobileVerification.update({
      where: { mobile },
      data: { otp, expiresAt, verified: false },
    });
  } else {
    await prisma.tempMobileVerification.create({
      data: { mobile, otp, expiresAt, verified: false },
    });
  }

  // TODO: Send OTP via WhatsApp
  // await sendOtpViaWhatsApp(mobile, otp.toString());

  console.log('OTP saved successfully for:', mobile);

  res.status(200).json({ 
    success: true,
    message: "OTP sent successfully to your mobile number",
    data: {
      message: "OTP sent successfully to your mobile number",
      // For testing purposes, include OTP in development
      ...(process.env.NODE_ENV === 'development' && { otp })
    }
  });
  return;
};

// Owner Listing OTP - Verify OTP before property listing
export const verifyOwnerListingOTP = async (req: Request, res: Response) => {
  const ownerId = req.user?.userId;
  const { mobile, otp } = req.body;

  if (!ownerId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!mobile || !otp) {
    res.status(400).json({ message: "Mobile and OTP are required" });
    return;
  }

  // Verify the owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    res.status(404).json({ message: "Owner not found" });
    return;
  }

  // Check OTP
  const record = await prisma.tempMobileVerification.findUnique({
    where: { mobile },
  });

  if (!record) {
    res.status(404).json({ message: "OTP not found. Please request a new one" });
    return;
  }

  if (record.expiresAt < new Date()) {
    res.status(400).json({ message: "OTP expired. Please request a new one" });
    return;
  }

  console.log('OTP Verification - Record OTP:', record.otp, 'Provided OTP:', parseInt(otp));

  if (record.otp !== parseInt(otp)) {
    res.status(401).json({ message: "Invalid OTP" });
    return;
  }

  // Mark as verified
  await prisma.tempMobileVerification.update({
    where: { mobile },
    data: { verified: true },
  });

  console.log('Mobile verified successfully:', mobile);

  res.status(200).json({ 
    success: true,
    message: "Mobile verified successfully. You can now create your property listing",
    data: {
      message: "Mobile verified successfully. You can now create your property listing",
      verified: true
    }
  });
  return;
};