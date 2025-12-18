"use client";

import { motion } from "framer-motion";

export default function ProfileInfo({ user, editable, onChange }: { user: any; editable: boolean; onChange: (key: string, value: string) => void; }) {
  const items = [
    { label: "Name", key: "name", value: user.name },
    { label: "Email", key: "email", value: user.email },
    { label: "Phone", key: "phone", value: user.phone },
    { label: "Joined", key: "joinedOn", value: user.joinedOn },
    { label: "Subscription", key: "subscription", value: user.subscription },
    { label: "Properties Listed", key: "propertiesListed", value: String(user.propertiesListed) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:[perspective:1200px]">
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          whileHover={{ rotateX: 5, rotateY: 5 }}
          className="rounded-2xl border border-transparent hover:border-sky-400/60 bg-white/50 backdrop-blur-md shadow-md p-4 [transform-style:preserve-3d]"
        >
          <div className="text-xs uppercase text-gray-500 mb-1">{item.label}</div>
          {editable ? (
            <input
              value={item.value}
              onChange={(e) => onChange(item.key, e.target.value)}
              className="w-full rounded-xl border px-3 py-2 bg-white/70"
            />
          ) : (
            <div className="text-gray-800 font-medium">{item.value}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}