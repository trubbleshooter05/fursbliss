import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© 2026 FursBliss. Built for healthier, longer lives.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/breeds" className="transition-colors hover:text-foreground">
              Breeds
            </Link>
            <Link href="/trends" className="transition-colors hover:text-foreground">
              Trends
            </Link>
          <Link href="/community" className="transition-colors hover:text-foreground">
            Community
          </Link>
            <Link href="/login" className="transition-colors hover:text-foreground">
              Login
            </Link>
            <Link href="/signup" className="transition-colors hover:text-foreground">
              Get Started
            </Link>
          </div>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            FursBliss is an informational tool only and does not provide veterinary
            medical advice, diagnosis, or treatment. Always consult a licensed
            veterinarian before starting or changing any supplement or health protocol.
          </p>
          <p>
            AI recommendations are for educational purposes only. FursBliss is not
            affiliated with Loyal or the FDA.
          </p>
        </div>
      </div>
    </footer>
  );
}
