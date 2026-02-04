"use client";
import { Suspense, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lock, 
  Eye, 
  EyeOff,
  Home,
  Users,
  Phone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LoginContent = () => {
  const searchParams = useSearchParams();
  const userType = searchParams?.get('type') || 'seeker';
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });
  const { login } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    if (field === 'mobile') {
      // Only allow numeric input and limit to 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const switchRole = (newRole: string) => {
    window.location.href = `/login?type=${newRole}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate mobile number
    if (formData.mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await login(formData.mobile, formData.password, userType as 'seeker' | 'owner');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4">
      {/* SEO Meta */}
      <title>Login - roomkarts | Sign In to Your Account</title>

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
            Welcome Back!
          </h1>
          <p className="text-muted-foreground">
            {userType === 'seeker' 
              ? 'Sign in to find your perfect accommodation' 
              : 'Sign in to manage your properties'
            }
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">WhatsApp Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter 10-digit WhatsApp Number"
                    className="pl-10"
                    value={formData.mobile}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mobile', e.target.value)}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link href={`/forgot-password?type=${userType}`} className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full btn-hero">
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href={`/signup?type=${userType}`} className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
};

export default Login;