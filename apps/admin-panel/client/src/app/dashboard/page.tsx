'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Users, Building, Home, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return (
    <>
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    </>  
    );
  }

  const statsCards = [
    {
      name: 'Total Users',
      value: stats?.stats.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Owners',
      value: stats?.stats.totalOwners || 0,
      icon: Building,
      color: 'bg-green-500',
    },
    {
      name: 'Total Properties',
      value: stats?.stats.totalProperties || 0,
      icon: Home,
      color: 'bg-purple-500',
    },
    {
      name: 'Verified Properties',
      value: stats?.stats.verifiedProperties || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
    {
      name: 'Not Verified',
      value: stats?.stats.notVerifiedProperties || 0,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      name: 'Pending Verifications',
      value: stats?.stats.pendingVerifications || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your real estate platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Properties by City */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Properties by City
        </h2>
        <div className="space-y-3">
          {stats?.propertiesByCity?.slice(0, 10).map((city: any) => (
            <div key={city.city} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{city.city}</span>
              <span className="text-sm font-semibold text-gray-900">
                {city._count} properties
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activities
        </h2>
        <div className="space-y-4">
          {stats?.recentActivities?.slice(0, 10).map((activity: any) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">
                    {activity.admin.firstName} {activity.admin.lastName}
                  </span>
                  {' '}
                  <span className="text-gray-600">{activity.action}</span>
                </p>
                {activity.details && (
                  <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
