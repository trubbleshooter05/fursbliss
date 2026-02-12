"use client";

import { motion } from "framer-motion";

export function HeroDashboardMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md"
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-medium text-white/80">Live wellness dashboard</p>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="h-2.5 w-2.5 rounded-full bg-emerald-300"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Wellness score</p>
          <motion.p
            className="mt-2 text-4xl font-semibold text-white"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            8.9
          </motion.p>
          <p className="text-xs text-white/60">+0.7 this week</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Adherence</p>
          <motion.p
            className="mt-2 text-4xl font-semibold text-white"
            animate={{ opacity: [0.82, 1, 0.82] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            94%
          </motion.p>
          <p className="text-xs text-white/60">Dose plan on track</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-white/60">Trend line</p>
        <svg viewBox="0 0 340 96" className="h-24 w-full" aria-hidden="true">
          <motion.path
            d="M4 72 C 42 66, 58 44, 92 48 C 126 52, 144 36, 176 40 C 208 44, 236 24, 266 26 C 296 28, 318 14, 336 12"
            fill="none"
            stroke="rgba(232,196,109,0.95)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.8 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
