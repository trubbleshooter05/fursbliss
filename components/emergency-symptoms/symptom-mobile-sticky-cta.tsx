import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Fixed bottom CTA on small screens — symptom guides only. */
export function SymptomMobileStickyCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Button asChild className="h-12 w-full shadow-md" size="lg">
        <Link href="/check">Check symptoms now</Link>
      </Button>
    </div>
  );
}
