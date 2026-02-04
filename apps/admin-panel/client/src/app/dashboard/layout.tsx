'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Home, 
  CheckCircle, 
  UserCog,
  LogOut,
  FileText
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { admin, isAuthenticated, isHydrated, logout, hasPermission } = useAuthStore();

  useEffect(() => {
    // Only check authentication after store is hydrated
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { 
      name: 'Users', 
      href: '/dashboard/users', 
      icon: Users, 
      show: hasPermission('canViewUsers') 
    },
    { 
      name: 'Owners', 
      href: '/dashboard/owners', 
      icon: UserCog, 
      show: hasPermission('canViewOwners') 
    },
    { 
      name: 'Properties', 
      href: '/dashboard/properties', 
      icon: Home, 
      show: hasPermission('canViewProperties') 
    },
    { 
      name: 'Verifications', 
      href: '/dashboard/verifications', 
      icon: CheckCircle, 
      show: hasPermission('canVerifyProperties') 
    },
    { 
      name: 'Rent Agreements', 
      href: '/dashboard/rent-agreements', 
      icon: FileText, 
      show: hasPermission('canViewProperties') 
    },
    { 
      name: 'Employees', 
      href: '/dashboard/employees', 
      icon: Building, 
      show: admin?.role === 'MAIN_ADMIN' 
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => 
                item.show && (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              )}
            </nav>
          </div>

          <div className="border-t p-4">
            <div className="flex items-center mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs text-gray-500">{admin?.email}</p>
                <p className="text-xs text-indigo-600 font-semibold mt-1">
                  {admin?.role === 'MAIN_ADMIN' ? 'Main Admin' : 'Employee'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-700 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="py-6 px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
