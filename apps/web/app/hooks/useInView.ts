"use client";

import { RefObject, useRef } from "react";
import { useInView as fmUseInView } from "framer-motion";

export default function useInView<T extends HTMLElement>(
  opts: { margin?: string; amount?: number | "some" | "all"; once?: boolean } = {}
): { ref: RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const inView = fmUseInView(ref as unknown as RefObject<Element>, {
    margin: opts.margin ?? "0px",
    amount: opts.amount ?? 0.2,
    once: opts.once ?? true,
  } as any);
  return { ref, inView };
}