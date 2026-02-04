"use client";

import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfileActions({ user}: { user: any; setUser: (u: any) => void }) {
  const router = useRouter();

  const handleEdit = () => {
    try {
      localStorage.setItem("roomsdekho:user", JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    try { localStorage.removeItem("roomsdekho:user"); } catch {}
    router.push("/");
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-5 py-2 bg-gradient-to-r from-sky-500 to-teal-400 text-white rounded-xl shadow-lg"
        onClick={handleEdit}
      >
        Edit Profile
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="outline" onClick={handleLogout} className="shadow-md">
          Logout from RoomsDekho
        </Button>
      </motion.div>
    </div>
  );
}