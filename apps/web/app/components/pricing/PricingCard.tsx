"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";


type Plan = {
  id: "basic" | "pro" | "advanced" | string;
  title: string;
  price: number;
  features: string[];
  badge?: string;
};

export default function PricingCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialByPlan: Record<string, any> = {
    basic: { opacity: 0, x: -60, rotateY: -15, y: 20 },
    pro: { opacity: 0, rotateY: -25, scale: 0.9, y: 30 },
    advanced: { opacity: 0, y: 60, rotateX: -15 },
  };

  const whileInViewByPlan: Record<string, any> = {
    basic: { opacity: 1, x: 0, rotateY: 0, y: 0 },
    pro: { opacity: 1, rotateY: 0, scale: 1, y: 0 },
    advanced: { opacity: 1, y: 0, rotateX: 0 },
  };

  const isPro = plan.id === "pro";

  const handleClick = async () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("selectedPlan", plan.id);
      } catch {}
    }

    if (!user || user.role !== "OWNER") {
      toast({
        title: "Login as owner",
        description: "Sign in as an owner to purchase a plan.",
        variant: "destructive",
      });
      router.push("/login?type=owner");
      return;
    }

    setIsSubmitting(true);
    try {
      // Pricing has been removed - unlimited listings are now free
      toast({
        title: "Great News!",
        description: "All property listings are now unlimited and free for all owners.",
      });
      router.push("/owner/dashboard");
    } catch (error: any) {
      toast({
        title: "Unable to activate plan",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          (isPro ? " border-2 border-sky-400 shadow-sky-200/60 " : " ")
        }
      >
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)" }} />
        {plan.badge ? (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{plan.title}</h3>
            <Badge variant={isPro ? "default" : "outline"}>{plan.badge}</Badge>
          </div>
        ) : (
          <h3 className="text-xl font-semibold mb-4">{plan.title}</h3>
        )}

        <div className="mb-4">
          <div className="text-3xl font-extrabold">₹{plan.price.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">per year</div>
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
          className={
            "w-full h-11 " +
            (plan.id === "advanced"
              ? " bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 "
              : isPro
              ? " btn-hero "
              : " bg-slate-900 hover:bg-slate-800 text-white ")
          }
        >
          {plan.id === "basic" && "Get Started"}
          {plan.id === "pro" && "Upgrade Now"}
          {plan.id === "advanced" && "Go Premium"}
          {!["basic", "pro", "advanced"].includes(plan.id) && "Choose Plan"}
          {isSubmitting && "..."}
        </Button>

        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100" />
      </motion.div>
    </div>
  );
}