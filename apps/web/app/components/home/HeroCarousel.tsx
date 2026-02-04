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
    <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[56vh] lg:h-[60vh] overflow-hidden">
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
              src={slides[index]?.image.src || '/default-property.jpg'}
              alt={slides[index]?.title || 'Property'}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ✅ Static text overlay (won’t reanimate every 3s) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center pointer-events-none">
        <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-gradient-to-r from-white via-white to-yellow-200 bg-clip-text drop-shadow-[0_8px_32px_rgba(0,0,0,0.4)] leading-tight mb-2 sm:mb-3">
          Find Perfect Room for You
        </h1>
        <p className="mt-2 sm:mt-3 md:mt-4 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-base sm:text-lg md:text-lg lg:text-xl font-medium text-white/90 drop-shadow-lg px-4">
          List Unlimited Rooms, Flats, Villas, House and PG for Rent - 100% Free for Owners
        </p>
      </div>
    </section>
  );
}
