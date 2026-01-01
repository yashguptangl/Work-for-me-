"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Home, Users } from 'lucide-react';
import SeekerSignupForm from '@/components/auth/SeekerSignupForm';
import OwnerSignupForm from '@/components/auth/OwnerSignupForm';


const SignupContent = () => {
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') || searchParams.get('type') || 'seeker') as 'seeker' | 'owner';

  const switchRole = (newRole: string) => {
    window.location.href = `/signup?role=${newRole}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* SEO Meta */}
      <title>Sign Up - Roomlocate | Create Your Account</title>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">          
          {/* Role Switcher */}
          <div className="flex items-center justify-center space-x-1 mb-4">
            <Button
              variant={role === 'seeker' ? 'outline' : 'default'}
              size="sm"
              onClick={() => switchRole('seeker')}
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Seeker</span>
            </Button>
            <Button
              variant={role === 'owner' ? 'outline' : 'default'}
              size="sm"
              onClick={() => switchRole('owner')}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Owner</span>
            </Button>
          </div>

          <p className="text-muted-foreground text-sm">
            {role === 'seeker' 
              ? 'Create your account to find perfect accommodation' 
              : 'Join as a property owner and start earning'
            }
          </p>
        </div>

        {/* Dynamic Form Based on Role */}
        {role === 'seeker' ? <SeekerSignupForm /> : <OwnerSignupForm />}
      </div>
    </div>
  );
};

const Signup = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
};

export default Signup;