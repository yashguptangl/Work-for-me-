"use client";

import Image from "next/image";
import { ShieldCheck, MapPin, Star, IndianRupee, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroFallback from "@/assets/hero-property.jpg";

// import type { StaticImageData } from "next/image";

export type HeroBannerProps = {
  title: string;
  subtitle: string;
  location: string;
  rating: number;
  priceLabel: string;
  imageSrc?: string;
  onExplore?: () => void;
  onListProperty?: () => void;
};

export default function HeroBanner({
  title,
  subtitle,
  location,
  rating,
  priceLabel,
  imageSrc = heroFallback as unknown as string,
  onExplore,
  onListProperty,
}: HeroBannerProps) {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-slate-900">
      {/* Background image */}
      <Image
        src={imageSrc}
        alt={title}
        fill
        priority
        className="object-cover object-center opacity-80"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-6xl mx-auto px-4 md:px-6 flex items-end md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full md:w-[70%] py-10 md:py-0"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/90 text-white px-3 py-1 text-xs md:text-sm mb-4 shadow">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Platform</span>
          </div>

          {/* Headings */}
          <h1 className="text-white font-bold text-4xl md:text-5xl leading-tight">
            {title}
          </h1>
          <p className="text-white/90 text-lg md:text-xl mt-3 max-w-2xl">
            {subtitle}
          </p>

          {/* Stats Row */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-white/90">
            <div className="inline-flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-300" />
              <span className="text-sm md:text-base">{location}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-300" />
              <span className="text-sm md:text-base">{rating.toFixed(1)} Rating</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-blue-300" />
              <span className="text-sm md:text-base">{priceLabel}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={onExplore} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Search className="mr-2 h-4 w-4" />
              Explore Properties
            </Button>
            <Button onClick={onListProperty} variant="outline" className="bg-white/90 text-slate-900 border-white hover:bg-white">
              List Your Property
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}