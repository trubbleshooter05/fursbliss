import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© 2026 FursBliss. Built for healthier pets.</p>
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Login
          </Link>
          <Link href="/signup" className="transition-colors hover:text-foreground">
            Get Started
          </Link>
        </div>
      </div>
    </footer>
  );
}
