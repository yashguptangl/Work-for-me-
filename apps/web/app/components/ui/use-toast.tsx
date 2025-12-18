
"use client";

import { useEffect, useState } from "react";

export type ToastVariant = "default" | "destructive";

export type ToastRecord = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
};

type Listener = (toasts: ToastRecord[]) => void;

let TOASTS: ToastRecord[] = [];
const LISTENERS = new Set<Listener>();

function notify() {
  for (const l of LISTENERS) l(TOASTS);
}

export function toast(input: Omit<ToastRecord, "id">) {
  const id = Math.random().toString(36).slice(2);
  const record: ToastRecord = { id, ...input };
  TOASTS = [...TOASTS, record];
  notify();
  // Auto dismiss
  const duration = input.duration ?? 3000;
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
  return { id };
}

export function dismiss(id?: string) {
  if (!id) {
    TOASTS = [];
  } else {
    TOASTS = TOASTS.filter((t) => t.id !== id);
  }
  notify();
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastRecord[]>(TOASTS);

  useEffect(() => {
    const listener: Listener = (t) => setToasts(t);
    LISTENERS.add(listener);
    return () => {
      LISTENERS.delete(listener);
    };
  }, []);

  return { toasts, toast, dismiss };
}
