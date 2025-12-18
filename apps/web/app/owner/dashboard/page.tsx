"use client";

import { Suspense } from 'react';
import OwnerDashboard from "@/components/dashboard/OwnerDashboard";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <OwnerDashboard />
      </Suspense>
    </div>
  );
}
