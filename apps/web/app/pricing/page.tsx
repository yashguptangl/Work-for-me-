"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PricingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home since pricing is no longer needed
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}