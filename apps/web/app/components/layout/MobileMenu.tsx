
"use client";

import { User, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";


type Props = {
  open: boolean;
  onClose: () => void;
  user: any | null;
  onLogout: () => void;
};

// Overlay (dim background)
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.6 },
  exit: { opacity: 0 },
};

// Panel (right slide-in)
const panelVariants = {
  hidden: { x: "100%", rotateY: -18, opacity: 0, filter: "blur(1px)" },
  visible: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 110, damping: 16, mass: 0.9 },
  },
  exit: { x: "100%", rotateY: -12, opacity: 0, filter: "blur(1px)" },
};

// Menu list animation
const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: 24, rotateY: -6 },
  visible: { opacity: 1, x: 0, rotateY: 0, transition: { type: "spring" as const, stiffness: 140, damping: 14 } },
};

export default function MobileMenu({ open, onClose, user, onLogout }: Props) {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open) {
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', onKey);
      try { document.body.style.overflow = 'hidden'; } catch {}
      return () => {
        document.removeEventListener('keydown', onKey);
        try { document.body.style.overflow = ''; } catch {}
      };
    }
  }, [open, onClose]);
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const isLoggedIn = !!user;

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black z-[2147483646] pointer-events-auto"
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            exit={prefersReducedMotion ? undefined : "exit"}
            variants={overlayVariants}
            onClick={onClose}
          />

          {/* Perspective container for 3D */}
          <div className="fixed inset-0 z-[2147483647] pointer-events-none" style={{ perspective: 1200 }}>
            {/* Right slide panel */}
            <motion.div
              key="panel"
              className="pointer-events-auto fixed top-0 right-0 w-[82%] max-w-sm h-full bg-white shadow-2xl flex flex-col overflow-y-auto rounded-l-2xl border-l border-gray-200 [transform-style:preserve-3d]"
              style={{ transformOrigin: '100% 50% 0' }}
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
              exit={prefersReducedMotion ? undefined : "exit"}
              variants={panelVariants}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img src="/icon.png" alt="Roomlocate" className="w-8 h-8 rounded-full object-cover bg-gray-100" />
                <h2 className="text-xl font-semibold">Roomlocate</h2>
              </div>
              <motion.button whileTap={{ scale: 0.9, rotate: 90 }} onClick={onClose} aria-label="Close menu" className="p-2 text-xl">✕</motion.button>
            </div>

            {/* Top login row */}
            {!isLoggedIn && (
              <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-5 py-4 text-gray-800 hover:bg-gray-50">
                <Link href="/login" onClick={onClose} className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <span className="font-medium">Login</span>
                </Link>
              </motion.div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-200 mx-4" />

            {/* Simple list with staggered animations (only for guests) */}
            {!isLoggedIn && (
              <motion.nav className="flex flex-col py-2" variants={listVariants} initial="hidden" animate="visible">
                {[
                  { href: '/', label: 'Home', bold: true },
                  { href: '/properties', label: 'Properties' },
                  { href: '/about', label: 'About' },
                ].map((item) => (
                  <motion.div key={item.href} variants={itemVariants} whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }}>
                    <Link href={item.href} onClick={onClose} className={`px-5 py-3 text-[17px] hover:bg-gray-50 ${item.bold ? 'font-semibold text-gray-900' : 'text-gray-700 hover:text-gray-900'}`}>{item.label}</Link>
                  </motion.div>
                ))}
              </motion.nav>
            )}

            {isLoggedIn && (
              <motion.nav className="flex flex-col py-2" variants={listVariants} initial="hidden" animate="visible">
                {(user?.role === 'OWNER'
                  ? [
                      { href: '/owner/dashboard', label: 'Dashboard' },
                      { href: '/owner/profile', label: 'My Profile' },
                      { href: '/list-property', label: 'Add Property' },
                    ]
                  : [
                      { href: '/user/dashboard', label: 'Dashboard' },
                      { href: '/user/profile', label: 'My Profile' },
                      { href: '/properties', label: 'Browse Properties' },
                      { href: '/user/dashboard', label: 'My Wishlist' },
                    ]
                ).map((item) => (
                  <motion.div key={item.href + item.label} variants={itemVariants} whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }}>
                    <Link href={item.href} onClick={onClose} className="px-5 py-3 text-[17px] text-gray-700 hover:text-gray-900 hover:bg-gray-50">{item.label}</Link>
                  </motion.div>
                ))}
              </motion.nav>
            )}

            {/* Logout row (only when logged in) */}
            {isLoggedIn && (
              <motion.button whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }} onClick={() => { onLogout(); onClose(); }} className="flex items-center gap-3 px-5 py-4 text-gray-800 hover:bg-gray-50 text-left">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </motion.button>
            )}

            {/* Bottom pill button (only for guests) */}
            {!isLoggedIn && (
              <div className="mt-auto p-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="block">
                  <Link href="/signup?type=owner" onClick={onClose} className="flex items-center justify-between w-full rounded-full border px-5 py-3 bg-white shadow-sm">
                    <span className="font-medium">Post property</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-semibold">FREE</span>
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </>
      )}
    </AnimatePresence>,
    document.body
  );
}
