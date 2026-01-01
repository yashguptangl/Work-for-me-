"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await adminApi.login(formData);

      if (response.success && response.token) {
        localStorage.setItem("adminToken", response.token);
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));
        
        document.cookie = `adminToken=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

        toast.success("Login Successful", {
          description: "Welcome to Admin Panel",
        });

        router.push("/dashboard");
      } else {
        toast.error("Login Failed", {
          description: response.message || "Invalid credentials",
        });
      }
    } catch (error: any) {
      toast.error("Login Failed", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Roomlocate Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="admin@roomsdekho.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Login to Admin Panel"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="flex items-center justify-center gap-1">
              <Shield className="w-4 h-4" />
              Secure Admin Access Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}