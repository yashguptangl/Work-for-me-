"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Smartphone, RefreshCw, Users, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const MobileVerifyContent = () => {
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'seeker';
  const phoneFromSignup = searchParams.get('phone') || '';
  const [mobile, setMobile] = useState(phoneFromSignup);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(!!phoneFromSignup);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const { verifyOtp } = useAuth();

  const switchRole = (newRole: string) => {
    window.location.href = `/mobile-verify?type=${newRole}${phoneFromSignup ? `&phone=${phoneFromSignup}` : ''}`;
  };

  // Auto-send OTP if phone number is provided from signup
  useEffect(() => {
    if (phoneFromSignup && !isOtpSent) {
      handleSendOtp();
    }
  }, [phoneFromSignup]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = userType === 'owner'
        ? await apiClient.ownerResendOtp({ phone: mobile })
        : await apiClient.userResendOtp({ phone: mobile });
      if (response.success) {
        setIsOtpSent(true);
        setCountdown(60);
      }
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await verifyOtp(mobile, parseInt(otp), userType as 'seeker' | 'owner');
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await (userType === 'owner'
        ? apiClient.ownerResendOtp({ phone: mobile })
        : apiClient.userResendOtp({ phone: mobile }));
      setCountdown(60);
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth status
  if (isLoading && !isOtpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Checking verification status...</p>
        </div>
      </div>
    );
  }

  if (isOtpSent) {
    return (
      <div className="min-h-screen bg-background flex items-start justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">            
            {/* Role Switcher */}
            <div className="flex items-center justify-center space-x-1 mb-4">
              <Button
                variant={userType === 'seeker' ? 'outline' : 'default'}
                size="sm"
                onClick={() => switchRole('seeker')}
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Seeker</span>
              </Button>
              <Button
                variant={userType === 'owner' ? 'outline' : 'default'}
                size="sm"
                onClick={() => switchRole('owner')}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Owner</span>
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Mobile Number
            </h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to <strong>{mobile}</strong>
            </p>
          </div>

          {/* OTP Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Enter Verification Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest"
                    value={otp}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 6-digit code sent to your mobile
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-500 text-center mb-2">
                    {error}
                  </p>
                )}
                <Button 
                  type="submit" 
                  className="w-full btn-hero" 
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in {countdown}s
                  </p>
                ) : (
                  <Button 
                    variant="ghost" 
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4">
      {/* SEO Meta */}
      <title>Mobile Verification - Rooms Dekho | Verify Your Mobile Number</title>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Role Switcher */}
          <div className="flex items-center justify-center space-x-1 mb-4">
            <Button
              variant={userType === 'seeker' ? 'outline' : 'default'}
              size="sm"
              onClick={() => switchRole('seeker')}
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Seeker</span>
            </Button>
            <Button
              variant={userType === 'owner' ? 'outline' : 'default'}
              size="sm"
              onClick={() => switchRole('owner')}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Owner</span>
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Mobile Number
          </h1>
          <p className="text-muted-foreground">
            We'll send a verification code to your mobile number
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Enter Mobile Number</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="98765 43210"
                    className="pl-10"
                    value={mobile}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your mobile number
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-hero" 
                disabled={isLoading || !mobile}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/signup">
                <Button variant="ghost" className="text-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Signup
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            We'll send a one-time verification code via SMS. Standard SMS rates may apply.
          </p>
        </div>
      </div>
    </div>
  );
};

const MobileVerify = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MobileVerifyContent />
    </Suspense>
  );
};

export default MobileVerify;
