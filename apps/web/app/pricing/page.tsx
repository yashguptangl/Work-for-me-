"use client";
import { motion } from "framer-motion";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingCard from "@/components/pricing/PricingCard";

export default function PricingPage() {
  const pricingPlan = {
    id: 'free',
    title: 'Free Plan',
    price: 0,
    features: [
      'Unlimited Property Listings',
      'Free Forever - No Hidden Charges',
      'Verified Owner Badge',
      'Visible on Platform Permanently',
      'Priority Search Placement',
      'High-Quality Image Upload (Up to 10 images)',
      'Direct Contact Information Display',
      'WhatsApp Integration',
      'Property Analytics & Views Counter',
      '24/7 Email & Phone Support',
      'Edit Property Anytime',
      'No Commission on Bookings',
      'Mobile Responsive Listings',
      'Social Media Sharing',
      'Fast Listing Approval',
    ],
    badge: '100% FREE',
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Subtle Background Gradient */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.04),transparent_40%)]"
      />

      <PricingHeader />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-10 max-w-2xl rounded-xl bg-blue-50 text-blue-900 px-6 py-4 text-sm text-center"
        >
          <span className="mr-2">🎁</span>
          All features included. No hidden charges. Start listing today.
        </motion.div>

        <div className="max-w-md mx-auto">
          <PricingCard plan={pricingPlan} />
        </div>

        <div className="text-center text-sm text-gray-500 mt-12 max-w-2xl mx-auto">
          <p className="mb-4">
            Join hundreds of property owners already listing on our platform.
          </p>
        </div>
      </motion.div>
    </div>
  );
}