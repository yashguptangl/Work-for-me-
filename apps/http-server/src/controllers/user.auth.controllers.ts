import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/db/prisma';
const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;


// User Signup Controller
export const userAuthController = async (req: Request, res: Response): Promise<void> => {
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

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: phone
      }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this phone already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone,
        otp,
        isVerified: false
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        userType: 'user'
      },
      JWT_SECRET as string,
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your account with OTP.',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          isVerified: newUser.isVerified
        },
        token,
      }
    });

  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during user registration'
    });
  }
};

// User Login Controller
export const userLoginController = async (req: Request, res: Response): Promise<void> => {
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid phone or password'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid phone or password'
      });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your account before logging in'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        phone: user.phone,
        name : user.firstName + ' ' + user.lastName,
        role: 'user'
      },
      JWT_SECRET as string,
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isVerified: user.isVerified
        },
        token
      }
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// User Logout Controller
export const userLogoutController = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // However, you could implement token blacklisting here if needed
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('User logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// User Forgot Password Controller
export const userForgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: 'Phone number is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      // For security, don't reveal if the user exists or not
      res.status(200).json({ success: true, message: 'If an account with that mobile number exists, an OTP has been sent.' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await prisma.user.update({
      where: { id: user.id },
      data: { otp },
    });

    console.log(`User password reset OTP for ${phone}: ${otp}`); // In a real app, this would be sent via an SMS service

    res.status(200).json({ success: true, message: 'Password reset OTP has been sent.' });
  } catch (error) {
    console.error('User forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// User Resend OTP Controller
export const userResendOTPController = async (req: Request, res: Response): Promise<void> => {
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account with this phone exists, a password reset OTP has been sent.'
      });
      return;
    }

    // Generate new OTP for password reset
    const resetOtp = Math.floor(100000 + Math.random() * 900000);

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
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
export const userVerifyOtpController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user || user.otp !== parseInt(otp)) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    // Verify user and clear OTP
    await prisma.user.update({
      where: { id: user.id },
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
export const userResetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Phone, OTP, and new password are required'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user || user.otp !== parseInt(otp)) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
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
