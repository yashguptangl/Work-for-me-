"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function ProfileHeader({ user }: { user: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="rounded-3xl bg-white/30 backdrop-blur-lg shadow-xl p-6 text-center border border-white/50"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div whileHover={{ rotateY: 8, rotateX: 4 }} className="relative w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/30 to-teal-400/30 blur-lg" />
          <Image src={user.profileImage || "/images/profile-avatar.png"} alt={user.name} fill className="rounded-full object-cover border-4 border-white/60" />
        </motion.div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            {user.verified && (
              <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-sky-600">
                <CheckCircle className="w-5 h-5" />
              </motion.span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-sm text-gray-600">{user.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}