"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Home, ShieldCheck, Activity, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

interface DashboardStats {
  users: { total: number };
  owners: { total: number };
  properties: { total: number; active: number; draft: number; verified: number };
  verifications: { pending: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminStr = localStorage.getItem("adminData");
    
    if (!token) {
      router.replace("/login");
      return;
    }

    if (adminStr) {
      setAdminData(JSON.parse(adminStr));
    }

    loadDashboardStats();
  }, [router]);

  const loadDashboardStats = async () => {
    try {
      const response = await adminApi.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    document.cookie = "adminToken=; path=/; max-age=0";
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Activity className="w-5 h-5" /> },
    { href: "/dashboard/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { href: "/dashboard/owners", label: "Owners", icon: <Users className="w-5 h-5" /> },
    { href: "/dashboard/properties", label: "Properties", icon: <Home className="w-5 h-5" /> },
    { href: "/dashboard/verifications", label: "Verifications", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{adminData?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out overflow-y-auto`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats?.users.total || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Total Owners */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Owners</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats?.owners.total || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Total Properties */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats?.properties.total || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats?.properties.active || 0} active
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Home className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Pending Verifications */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending Verifications</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats?.verifications.pending || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <ShieldCheck className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/dashboard/verifications"
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-blue-300 hover:shadow-md transition"
                >
                  <ShieldCheck className="w-8 h-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Review Verifications</h4>
                  <p className="text-sm text-gray-600">
                    {stats?.verifications.pending || 0} pending requests
                  </p>
                </Link>

                <Link
                  href="/dashboard/properties"
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-purple-300 hover:shadow-md transition"
                >
                  <Home className="w-8 h-8 text-purple-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Manage Properties</h4>
                  <p className="text-sm text-gray-600">
                    {stats?.properties.total || 0} total listings
                  </p>
                </Link>

                <Link
                  href="/dashboard/users"
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-green-300 hover:shadow-md transition"
                >
                  <Users className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">View Users</h4>
                  <p className="text-sm text-gray-600">
                    {stats?.users.total || 0} registered users
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}