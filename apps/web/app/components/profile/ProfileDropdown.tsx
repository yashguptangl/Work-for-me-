"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { type AuthUser } from "../../hooks/useAuth";

type Props = {
  user: AuthUser;
  onClose?: () => void;
  onLogout: () => void;
};

export default function ProfileDropdown({ user, onClose, onLogout }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        onClose?.();
      }
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        onClose?.();
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);

  const displayName = user.name || user.email.split("@")[0] || "User";
  const roleLabel = user.role === "ADMIN" ? "Admin" : user.role === "OWNER" ? "Owner" : "Master User";
  const dashboardHref = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'OWNER' ? '/owner/dashboard' : '/user/dashboard';
  const dashboardLabel = 'Dashboard';
  const profileHref = '/profile';
  const roleItems = user.role === 'OWNER'
    ? [
        { href: profileHref, label: 'Profile' },
        { href: dashboardHref, label: dashboardLabel },
        { href: '/owner/dashboard?tab=leads', label: 'Leads' },
        { href: '/owner/dashboard?tab=visits', label: 'Visit Summary' },
      ]
    : [
        { href: profileHref, label: 'Profile' },
        { href: dashboardHref, label: dashboardLabel },
        { href: '/user/contacted', label: 'Contact' },
        { href: '/user/visits', label: 'Visit Summary' },
      ];

  const Item = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className="block px-4 py-2 rounded-md hover:bg-muted transition-colors">
      {label}
    </Link>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card shadow-lg z-50"
        >
          <div className="p-2 max-h-80 overflow-y-auto">
            {roleItems.map(i => (
              <Item key={i.href} href={i.href} label={i.label} />
            ))}
            <button onClick={onLogout} className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors">Logout</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}