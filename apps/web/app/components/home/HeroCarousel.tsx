"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import hero1 from "@/assets/hero-property.jpg";
import hero2 from "@/assets/pg-room.jpg";

const slides = [
  {
    image: hero1,
    title: "Premium Student Housing",
    subtitle: "Safe, comfortable spaces for students & professionals",
  },
  {
    image: hero2,
    title: "Find Your Perfect Room",
    subtitle: "Verified PGs, Rooms & Flats with trusted owners",
  },
  {
    image: hero1,
    title: "Live Close to Campus",
    subtitle: "Convenient, verified stays for students",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full h-[45vh] sm:h-[50vh] md:h-[56vh] lg:h-[60vh] overflow-hidden">
      {/* Background image transitions */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={slides[index]?.image || '/default-property.jpg'}
              alt={slides[index]?.title || 'Property'}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ✅ Static text overlay (won’t reanimate every 3s) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 text-center pointer-events-none">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-gradient-to-r from-white via-white to-yellow-200 bg-clip-text drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)] leading-tight">
          Find Perfect Room for Rent
        </h1>
        <p className="mt-2 sm:mt-3 md:mt-4 max-w-sm sm:max-w-md md:max-w-xl text-sm sm:text-base md:text-lg font-medium text-white/85 px-4">
          Verified Rooms, Flats and Pg with trusted owners and move-in support.
        </p>
      </div>
    </section>
  );
}
