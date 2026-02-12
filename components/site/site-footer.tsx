import Link from "next/link";
import { Instagram, PawPrint, Twitter } from "lucide-react";
import { FooterNewsletterForm } from "@/components/site/footer-newsletter-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[var(--color-section-dark)] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <PawPrint className="h-5 w-5" />
              </span>
              <span className="font-display text-xl">FursBliss</span>
            </Link>
            <p className="text-sm text-white/70">
              Premium longevity intelligence for people who want more healthy years with their dogs.
            </p>
            <div className="flex items-center gap-3 text-white/70">
              <a href="#" aria-label="X / Twitter" className="transition hover:text-white">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="transition hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-medium text-white">Product</p>
            <div className="space-y-2 text-white/70">
              <Link href="/pricing" className="block transition hover:text-white">
                Pricing
              </Link>
              <Link href="/longevity-drugs" className="block transition hover:text-white">
                Drug Hub
              </Link>
              <Link href="/breeds" className="block transition hover:text-white">
                Breeds
              </Link>
              <Link href="/trends" className="block transition hover:text-white">
                Trends
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-medium text-white">Company</p>
            <div className="space-y-2 text-white/70">
              <Link href="/community" className="block transition hover:text-white">
                Community
              </Link>
              <Link href="/login" className="block transition hover:text-white">
                Login
              </Link>
              <Link href="/signup" className="block transition hover:text-white">
                Get Started
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-medium text-white">Get LOY-002 updates</p>
            <p className="text-white/70">
              Join the waitlist for approval milestones and availability timing updates.
            </p>
            <FooterNewsletterForm />
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/60">
          <p>
            FursBliss is an informational tool only and does not provide veterinary medical advice,
            diagnosis, or treatment. Always consult a licensed veterinarian before starting or changing
            any supplement or health protocol.
          </p>
          <p className="mt-2">© 2026 FursBliss. Built for healthier, longer lives.</p>
        </div>
      </div>
    </footer>
  );
}
