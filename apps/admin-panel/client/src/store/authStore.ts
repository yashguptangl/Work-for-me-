import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'MAIN_ADMIN' | 'EMPLOYEE';
  permissions?: {
    canViewUsers: boolean;
    canViewOwners: boolean;
    canViewProperties: boolean;
    canEditProperties: boolean;
    canVerifyProperties: boolean;
    canHandleUsers: boolean;
    canHandleOwners: boolean;
    canViewReports: boolean;
  };
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (admin: Admin, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (admin, token) => {
        localStorage.setItem('admin_token', token);
        set({ admin, token, isAuthenticated: true });
      },

      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false });
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      },

      hasPermission: (permission: string) => {
        const { admin } = get();
        if (!admin) return false;
        if (admin.role === 'MAIN_ADMIN') return true;
        return admin.permissions?.[permission as keyof typeof admin.permissions] || false;
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'admin-auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
