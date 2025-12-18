"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, CheckCircle, Users, Smartphone, Lock, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ForgotPasswordContent = () => {
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'seeker';
  const [currentStep, setCurrentStep] = useState(1); // 1: Mobile, 2: OTP + New Password, 3: Success
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { forgotPassword, resetPassword, isLoading } = useAuth();
  const [countdown, setCountdown] = useState(0);

  const switchRole = (newRole: string) => {
    window.location.href = `/forgot-password?type=${newRole}`;
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleMobileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await forgotPassword(mobile, userType as 'seeker' | 'owner');
    if (success) {
      setCurrentStep(2);
      setCountdown(60);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    const success = await resetPassword(mobile, parseInt(otp), newPassword, userType as 'seeker' | 'owner');
    if (success) {
      setCurrentStep(3);
    }
  };

  const handleResendOtp = async () => {
    if (await forgotPassword(mobile, userType as 'seeker' | 'owner')) {
      setCountdown(60);
    }
  };

  // Step 3: Success Page
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Password Reset Successful!
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Your password has been successfully updated for mobile number <strong>{mobile}</strong>
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full btn-hero">
                  Sign In with New Password
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: OTP + New Password
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-background flex items-start justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to <strong>{mobile}</strong>
            </p>
          </div>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Enter OTP & New Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input id="otp" type="text" placeholder="123456" className="text-center text-2xl tracking-widest" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="newPassword" type={showPassword ? 'text' : 'password'} placeholder="Enter new password" className="pl-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}><Eye className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm new password" className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}><Eye className="h-4 w-4" /></button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">Resend code in {countdown}s</p>
                ) : (
                  <Button variant="ghost" onClick={handleResendOtp} disabled={isLoading}><RefreshCw className="w-4 h-4 mr-2" />Resend Code</Button>
                )}
                <Button variant="link" onClick={() => setCurrentStep(1)}><ArrowLeft className="w-4 h-4 mr-2" />Change Mobile Number</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 1: Mobile Number Input
  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-1 mb-4">
            <Button variant={userType === 'seeker' ? 'outline' : 'default'} size="sm" onClick={() => switchRole('seeker')}><Users className="w-4 h-4 mr-2" />Seeker</Button>
            <Button variant={userType === 'owner' ? 'outline' : 'default'} size="sm" onClick={() => switchRole('owner')}><Home className="w-4 h-4 mr-2" />Owner</Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">Enter your mobile number to receive a verification code</p>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Enter Your Mobile Number</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="mobile" type="tel" placeholder="9876543210" className="pl-10" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/login"><Button variant="ghost" className="text-sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Login</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ForgotPassword = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
};

export default ForgotPassword;