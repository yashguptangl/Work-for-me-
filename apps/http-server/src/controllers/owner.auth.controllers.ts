import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/db/prisma';
const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

// Owner Signup Controller
export const ownerAuthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        message: 'Email, password, firstName, and lastName are required'
      });
      return;
    }

    // Check if owner already exists (email or phone)
    const existingOwner = await prisma.owner.findFirst({
      where: {
        OR: [{ phone }, { email }],
      },
    });

    if (existingOwner) {
      res.status(409).json({
        success: false,
        message: 'Owner with this email or phone already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Create Owner with default FREE plan
    const newOwner = await prisma.owner.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone,
        otp,
        isVerified: false,
        planType: 'FREE',
        listings: 1,
        validity: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newOwner.id, 
        email: newOwner.email,
        phone: newOwner.phone,
        name: newOwner.firstName + ' ' + newOwner.lastName,
        role: 'owner'
      },
      JWT_SECRET as string,
    );

    res.status(201).json({
      success: true,
      message: 'Owner registered successfully. Please verify your account with OTP.',
      data: {
        owner: {
          id: newOwner.id,
          email: newOwner.email,
          firstName: newOwner.firstName,
          lastName: newOwner.lastName,
          phone: newOwner.phone,
          isVerified: newOwner.isVerified
        },
        token,
        otp: otp // In production, send this via SMS/Email
      }
    });

  } catch (error) {
    console.error('Owner signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during owner registration'
    });
  }
};

// Owner Login Controller
export const ownerLoginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
      return;
    }

    // Find owner
    const owner = await prisma.owner.findUnique({
      where: { phone }
    });

    if (!owner) {
      res.status(401).json({
        success: false,
        message: 'Invalid phone or password'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, owner.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid phone or password'
      });
      return;
    }

    // Check if Owner is verified
    if (!owner.isVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your account before logging in'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: owner.id, 
        email: owner.email,
        phone: owner.phone,
        name : owner.firstName + ' ' + owner.lastName,
        role: 'owner'
      },
      JWT_SECRET as string,
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        owner: {
          id: owner.id,
          email: owner.email,
          firstName: owner.firstName,
          lastName: owner.lastName,
          phone: owner.phone,
          isVerified: owner.isVerified,
          planType: owner.planType,
          listings: owner.listings,
          validity: owner.validity
        },
        token
      }
    });

  } catch (error) {
    console.error('Owner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Owner Logout Controller
export const ownerLogoutController = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // However, you could implement token blacklisting here if needed
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Owner logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
}

// Forgot Password Controller
export const ownerResendOTPController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    // Validation
    if (!phone) {
      res.status(400).json({
        success: false,
        message: 'Phone is required'
      });
      return;
    }

    // Find owner
    const owner = await prisma.owner.findUnique({
      where: { phone }
    });

    if (!owner) {
      // Don't reveal if owner exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account with this phone exists, a password reset OTP has been sent.'
      });
      return;
    }

    // Generate new OTP for password reset
    const resetOtp = Math.floor(100000 + Math.random() * 900000);

    // Update owner with new OTP
    await prisma.owner.update({
      where: { id: owner.id },
      data: { otp: resetOtp }
    });

    // In production, send this OTP via email/SMS
    console.log(`Password reset OTP for ${phone}: ${resetOtp}`);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your phone.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset request'
    });
  }
};

// Additional helper controller for OTP verification
export const ownerVerifyOtpController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
      return;
    }

    const owner = await prisma.owner.findUnique({
      where: { phone }
    });

    if (!owner || owner.otp !== parseInt(otp)) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    // Verify owner and clear OTP
    await prisma.owner.update({
      where: { id: owner.id },
      data: { 
        isVerified: true,
        otp: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Account verified successfully'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during OTP verification'
    });
  }
};

// Additional helper controller for password reset
export const ownerResetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Phone, OTP, and new password are required'
      });
      return;
    }

    const owner = await prisma.owner.findUnique({
      where: { phone }
    });

    if (!owner || owner.otp !== parseInt(otp)) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    await prisma.owner.update({
      where: { id: owner.id },
      data: { 
        password: hashedPassword,
        otp: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }

};

export const getOwnerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.userId;

    const ownerRecord = await prisma.owner.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVerified: true,
        planType: true,
        listings: true,
        validity: true,
        createdAt: true,
      },
    });

    if (!ownerRecord) {
      res.status(404).json({ success: false, message: "Owner not found" });
      return;
    }

    const now = new Date();
    const validityDate = ownerRecord.validity ? new Date(ownerRecord.validity) : null;
    const owner =
      validityDate && validityDate < now
        ? await prisma.owner.update({
            where: { id: ownerRecord.id },
            data: { planType: "FREE", listings: 0, validity: now },
          })
        : ownerRecord;

    res.status(200).json({ success: true, data: owner });
  } catch (error) {
    console.error("Get owner profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateOwnerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore
    const ownerId = req.user.userId;
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    const updatedOwner = await prisma.owner.update({
      where: { id: ownerId },
      data: {
        firstName,
        lastName,
        email,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedOwner.id,
        email: updatedOwner.email,
        firstName: updatedOwner.firstName,
        lastName: updatedOwner.lastName,
        phone: updatedOwner.phone,
      },
    });
  } catch (error) {
    console.error("Update owner profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const ownerForgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: 'Phone number is required' });
      return;
    }

    const owner = await prisma.owner.findUnique({ where: { phone } });
    if (!owner) {
      // Do not reveal if the user exists for security reasons
      res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await prisma.owner.update({
      where: { id: owner.id },
      data: { otp },
    });

    console.log(`Owner password reset OTP for ${phone}: ${otp}`); // In production, send via SMS

    res.status(200).json({ success: true, message: 'Password reset OTP has been sent.' });
  } catch (error) {
    console.error('Owner forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

