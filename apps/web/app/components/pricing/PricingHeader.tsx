"use client";

import { motion } from "framer-motion";

export default function PricingHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-sky-50/60">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-4 py-14 md:py-20 text-center"
      >
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 mb-4">
          Flexible • Transparent • No Hidden Fees
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
          Our Plans
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto text-sm md:text-base">
          Choose the right plan to list your property and reach verified students & professionals.
        </p>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute inset-x-0 -top-16 mx-auto h-56 w-[36rem] rounded-full blur-3xl bg-gradient-to-tr from-sky-200 via-cyan-200 to-transparent opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.2 }}
      />
    </div>
  );
}