"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.15, ease: "easeOut" }}>
        {children}
        <Toaster
          position="top-right"
          theme="light"
          richColors
          expand={false}
          duration={3000}
          closeButton={true}
          toastOptions={{
            style: {
              background: 'white',
              color: '#0f172a',
              border: '1px solid #e2e8f0'
            }
          }}
        />
      </MotionConfig>
    </QueryClientProvider>
  );
}