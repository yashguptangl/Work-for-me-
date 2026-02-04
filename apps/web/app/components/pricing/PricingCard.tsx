"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


type Plan = {
  id: "basic" | "pro" | "advanced" | string;
  title: string;
  price: number;
  features: string[];
  badge?: string;
};

export default function PricingCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [isSubmitting] = useState(false);

  const initialByPlan: Record<string, any> = {};

  const whileInViewByPlan: Record<string, any> = {};

  const isFree = plan.id === "free";

  const handleClick = async () => {
    router.push("/owner/signup");
  };

  return (
    <div className="[perspective:1200px]">
      <motion.div
        initial={initialByPlan[plan.id] ?? { opacity: 0, y: 24 }}
        whileInView={whileInViewByPlan[plan.id] ?? { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={
          "relative rounded-2xl p-6 bg-white shadow-lg ring-1 ring-black/5 [transform-style:preserve-3d] " +
          (isFree ? " border-2 border-sky-400 shadow-sky-200/60 " : " ")
        }
      >
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)" }} />
        {isFree ? (
          <>
            <h3 className="text-xl font-semibold mb-2">Free Listing Plan</h3>
            <div className="mb-2 text-2xl font-bold text-sky-700">₹0 <span className="text-base font-normal text-slate-500">(Listing Only)</span></div>
            <div className="mb-3 text-xs text-slate-500">Includes:</div>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✔</span> Unlimited Property Listings</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✔</span> Basic Visibility on Platform</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✔</span> Upload up to 5 Images</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✔</span> Direct Contact Display</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✔</span> WhatsApp Integration</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✔</span> Edit Property Anytime</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✔</span> No Commission on Bookings</li>
            </ul>
            <div className="mb-4 text-xs text-slate-500">Additional paid services available separately</div>
            <Button
              disabled={isSubmitting}
              onClick={handleClick}
              className="w-full h-11 btn-hero"
            >
              Get Started Free
              {isSubmitting && "..."}
            </Button>
            <div className="mt-6 border-t pt-4">
              <div className="text-base font-semibold mb-2 text-slate-700">Optional Paid Services</div>
              <ul className="text-sm space-y-1">
                <li><span className="font-medium text-slate-800">Property Verification:</span> <span className="text-green-700 font-bold">₹149</span> <span className="text-slate-500">per listing</span></li>
                <li><span className="font-medium text-slate-800">Rent Agreement Generation:</span> <span className="text-green-700 font-bold">₹100</span> <span className="text-slate-500">per agreement</span></li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {plan.badge ? (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{plan.title}</h3>
                <Badge variant="outline">{plan.badge}</Badge>
              </div>
            ) : (
              <h3 className="text-xl font-semibold mb-4">{plan.title}</h3>
            )}
            <div className="mb-4">
              <div className="text-3xl font-extrabold">₹{plan.price.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">forever</div>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              disabled={isSubmitting}
              onClick={handleClick}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
            >
              Get Started
              {isSubmitting && "..."}
            </Button>
          </>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100" />
      </motion.div>
    </div>
  );
}