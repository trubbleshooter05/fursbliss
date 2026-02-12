"use client";

import { useEffect, useMemo, useState } from "react";
import { META_DEBUG_CHANNEL, type MetaEventDebugDetail } from "@/lib/meta-events";

type EventRow = MetaEventDebugDetail & { id: string; ts: number };

const SHOW_META_DEBUG =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_META_DEBUG === "1";

export function MetaEventDebug() {
  const [rows, setRows] = useState<EventRow[]>([]);

  useEffect(() => {
    if (!SHOW_META_DEBUG) return;

    const onMetaEvent = (event: Event) => {
      const customEvent = event as CustomEvent<MetaEventDebugDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      setRows((prev) =>
        [{ ...detail, id: `${Date.now()}-${Math.random()}`, ts: Date.now() }, ...prev].slice(0, 6)
      );
    };

    window.addEventListener(META_DEBUG_CHANNEL, onMetaEvent as EventListener);
    return () => window.removeEventListener(META_DEBUG_CHANNEL, onMetaEvent as EventListener);
  }, []);

  const visibleRows = useMemo(
    () => rows.filter((row) => Date.now() - row.ts < 30000),
    [rows]
  );

  if (!SHOW_META_DEBUG || visibleRows.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[120] w-[320px] rounded-xl border border-slate-300 bg-white/95 p-3 text-xs shadow-lg backdrop-blur">
      <p className="mb-2 font-semibold text-slate-900">Meta Event Debug</p>
      <div className="space-y-1.5">
        {visibleRows.map((row) => (
          <div key={row.id} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
            <p className="font-medium text-slate-900">
              {row.status === "sent" ? "OK" : "DROP"} - {row.eventName}
            </p>
            <p className="text-slate-600">attempts: {row.attempts}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
