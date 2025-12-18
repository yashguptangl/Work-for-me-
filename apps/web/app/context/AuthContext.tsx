"use client";

import { createContext, useContext } from 'react';
import { useAuthImplementation, AuthUser, Role } from '@/hooks/useAuth';
import { Owner } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  owner: Owner | null;
  setOwner: (owner: Owner | null) => void;
  login: (email: string, password: string, userType?: 'seeker' | 'owner') => Promise<void>;
  signup: (data: any, userType?: 'seeker' | 'owner') => Promise<void>;
  logout: () => void;
  verifyOtp: (phone: string, otp: number, userType?: 'seeker' | 'owner') => Promise<void>;
  forgotPassword: (phone: string, userType?: 'seeker' | 'owner') => Promise<boolean>;
  resetPassword: (phone: string, otp: number, newPassword: string, userType?: 'seeker' | 'owner') => Promise<boolean>;
  requireRole: (allowed: Role[]) => AuthUser | null;
  updateUser: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth: AuthContextType = useAuthImplementation();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}