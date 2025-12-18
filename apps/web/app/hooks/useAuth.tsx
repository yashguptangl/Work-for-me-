"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,

} from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { apiClient, User, Owner } from "@/lib/api";

export type Role = "ADMIN" | "OWNER" | "SEEKER";
export type AuthUser = {
  createdAt: string;
  id: string;
  email: string;
  role: Role;
  name?: string;
  phone?: string;
  isVerified?: boolean;
};

const STORAGE_KEY = "roomsdekho:user";
const OWNER_STORAGE_KEY = "roomsdekho:owner";

function readUser(): { user: AuthUser | null; owner: Owner | null } {
  if (typeof window === "undefined") return { user: null, owner: null };
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY);
    const rawOwner = localStorage.getItem(OWNER_STORAGE_KEY);
    return {
      user: rawUser ? (JSON.parse(rawUser) as AuthUser) : null,
      owner: rawOwner ? (JSON.parse(rawOwner) as Owner) : null,
    };
  } catch {
    return { user: null, owner: null };
  }
}

// This is the actual hook implementation
export function useAuthImplementation() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => readUser().user);
  const [owner, setOwner] = useState<Owner | null>(() => readUser().owner);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const { user, owner } = readUser();
      setUser(user);
      setOwner(owner);
    };
    window.addEventListener("storage", handleStorageChange);
    handleStorageChange(); // Sync on initial mount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      userType: "seeker" | "owner" = "seeker"
    ) => {
      if (!email || !password) {
        toast.error("Missing credentials", {
          description: "Enter email and password to continue."
        });
        return;
      }

      setIsLoading(true);
      try {
        let response;
        let role: Role;
        let userData: User | Owner;

        if (userType === "owner") {
          response = await apiClient.ownerLogin({ phone: email, password });
          userData = response.data!.owner;
          role = "OWNER";
          const ownerData = response.data!.owner as Owner;
          localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(ownerData));
          setOwner(ownerData);
        } else {
          response = await apiClient.userLogin({ phone: email, password });
          userData = response.data!.user;
          role = "SEEKER";
        }

        if (response.success && response.data) {
          const u: AuthUser = {
            id: userData.id,
            email: userData.email,
            role,
            name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone,
            isVerified: userData.isVerified,
            createdAt: new Date().toISOString(),
          };

          apiClient.setToken(response.data.token);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          setUser(u);

          toast.success('🎉 Login Successful!', {
            description: `Welcome back, ${userData.firstName}! Ready to find your perfect space?`
          });

          // Force a small delay to ensure state updates are propagated
          await new Promise(resolve => setTimeout(resolve, 100));

          // Check for redirect URL saved before login
          const redirectUrl = typeof window !== 'undefined' ? localStorage.getItem('rd_redirect') : null;
          if (redirectUrl) {
            localStorage.removeItem('rd_redirect');
            router.replace(redirectUrl);
          } else {
            // Direct navigation based on role
            if (role === "OWNER") {
              router.replace("/owner/dashboard");
            } else {
              router.replace("/user/dashboard");
            }
          }
          
          // Trigger a window storage event to ensure navbar updates
          window.dispatchEvent(new Event('storage'));
        }
      } catch (error: any) {
        const message = error.message || "";
        const isVerifyError = message.toLowerCase().includes("verify");

        toast.error(isVerifyError ? "Verification Required" : "Login Failed", {
          description: message || "Invalid credentials"
        });

        if (isVerifyError) {
          router.replace(`/mobile-verify?phone=${email}&type=${userType}&redirect=/login?type=${userType}`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const signup = useCallback(
    async (
      data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
      },
      userType: "seeker" | "owner" = "seeker"
    ) => {
      setIsLoading(true);
      try {
        let response;
        let role: Role;
        let userData: User | Owner;

        if (userType === "owner") {
          response = await apiClient.ownerSignup(data);
          userData = response.data!.owner;
          role = "OWNER";
        } else {
          response = await apiClient.userSignup(data);
          userData = response.data!.user;
          role = "SEEKER";
        }

        if (response.success && response.data) {
          // Store token temporarily for OTP verification
          apiClient.setToken(response.data.token);
          
          // Store minimal temp data for OTP page (not full user object)
          if (typeof window !== 'undefined') {
            localStorage.setItem('temp_phone', data.phone);
            localStorage.setItem('temp_type', userType);
          }

          toast.success('🎉 Account Created Successfully!', {
            description: "Please verify your mobile number to complete registration"
          });

          // Redirect to OTP verification WITHOUT setting user state
          router.replace(
            `/mobile-verify?phone=${data.phone}&type=${userType}&redirect=/login?type=${userType}`
          );
        }
      } catch (error: any) {
        toast.error("Signup Failed", {
          description: error.message || "Failed to create account"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const verifyOtp = useCallback(
    async (
      phone: string,
      otp: number,
      userType: "seeker" | "owner" = "seeker"
    ) => {
      setIsLoading(true);
      try {
        const response = userType === "owner"
          ? await apiClient.ownerVerifyOtp({ phone, otp })
          : await apiClient.userVerifyOtp({ phone, otp });

        if (response.success) {
          toast.success('✅ Mobile Verified Successfully!', {
            description: "Your account has been activated. You can now login to access your dashboard."
          });
          
          // Clear temp data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('temp_phone');
            localStorage.removeItem('temp_type');
          }
          
          // Clear token after verification
          apiClient.clearToken();
          
          // Redirect to login WITHOUT setting user state
          router.replace(`/login?type=${userType}`);
        }
      } catch (error: any) {
        toast.error("Verification Failed", {
          description: error.message || "Invalid OTP"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const forgotPassword = useCallback(
    async (phone: string, userType: "seeker" | "owner" = "seeker") => {
      setIsLoading(true);
      try {
        let response;

        if (userType === "owner") {
          response = await apiClient.ownerForgotPassword({ phone });
        } else {
          response = await apiClient.userForgotPassword({ phone });
        }

        if (response.success) {
          toast.success("OTP sent", {
            description: "Password reset OTP has been sent to your mobile"
          });
          return true;
        }
      } catch (error: any) {
        toast.error("Failed to send OTP", {
          description: error.message || "Please try again"
        });
      } finally {
        setIsLoading(false);
      }
      return false;
    },
    []
  );

  const resetPassword = useCallback(
    async (
      phone: string,
      otp: number,
      newPassword: string,
      userType: "seeker" | "owner" = "seeker"
    ) => {
      setIsLoading(true);
      try {
        let response;

        if (userType === "owner") {
          response = await apiClient.ownerResetPassword({
            phone,
            otp,
            newPassword,
          });
        } else {
          response = await apiClient.userResetPassword({
            phone,
            otp,
            newPassword,
          });
        }

        if (response.success) {
          toast.success("Password reset", {
            description: "Your password has been reset successfully"
          });
          router.replace("/");
          return true;
        }
      } catch (error: any) {
        toast.error("Reset failed", {
          description: error.message || "Invalid OTP or password"
        });
      } finally {
        setIsLoading(false);
      }
      return false;
    },
    [router]
  );

  const updateUser = useCallback(
    async (data: { firstName: string; lastName: string; phone: string }) => {
      if (!user) return;

      setIsLoading(true);
      try {
        const response = await apiClient.updateUserProfile(data);

        if (response.success && (response as any).user) {
          const updatedUser: AuthUser = {
            ...user,
            name: `${(response as any).user.firstName} ${(response as any).user.lastName}`,
            phone: (response as any).user.phone,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error: any) {
        console.error("Update user error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const logout = useCallback(() => {
    apiClient.clearToken();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OWNER_STORAGE_KEY);
    localStorage.removeItem('rd_redirect');
    localStorage.removeItem('temp_phone');
    localStorage.removeItem('temp_type');
    setUser(null);
    setOwner(null);
    toast.success('👋 Logged Out Successfully', {
      description: "You have been safely logged out. See you again soon!"
    });
    router.replace("/");
  }, [router]);

  const requireRole = useCallback(
    (allowed: Role[]) => {
      const { user: storedUser } = readUser();
      if (!storedUser || !allowed.includes(storedUser.role)) {
        try {
          const current = typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/";
          localStorage.setItem("rd_redirect", current);
        } catch {}
        const type = allowed.includes("OWNER") && !allowed.includes("SEEKER") ? "owner" : "seeker";
        router.replace(`/login?type=${type}`);
        return null;
      }
      return storedUser;
    },
    [router]
  );

  const value = useMemo(
    () => ({
      user,
      owner,
      setOwner,
      isLoading,
      login,
      signup,
      logout,
      requireRole,
      updateUser,
      verifyOtp,
      forgotPassword,
      resetPassword,
    }),
    [user, owner, setOwner, isLoading, login, signup, logout, requireRole, updateUser, verifyOtp, forgotPassword, resetPassword]
  );

  return value;
}