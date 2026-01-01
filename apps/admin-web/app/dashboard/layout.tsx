"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ShieldCheck, Activity, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    document.cookie = "adminToken=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Activity className="w-5 h-5" /> },
    { href: "/dashboard/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { href: "/dashboard/owners", label: "Owners", icon: <Users className="w-5 h-5" /> },
    { href: "/dashboard/properties", label: "Properties", icon: <Home className="w-5 h-5" /> },
    { href: "/dashboard/verifications", label: "Verifications", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const isActive = (href: string) => pathname === href;

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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
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
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}