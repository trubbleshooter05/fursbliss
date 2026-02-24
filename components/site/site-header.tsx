"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = useMemo(
    () => [
      { href: "/#features", label: "Features", active: pathname === "/" },
      { href: "/pricing", label: "Pricing", active: pathname === "/pricing" },
      { href: "/breeds", label: "Breeds", active: pathname.startsWith("/breeds") },
      { href: "/trends", label: "Trends", active: pathname.startsWith("/trends") },
      { href: "/walks-left", label: "Free Tools", active: pathname.startsWith("/walks-left") },
    ],
    [pathname]
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/60 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? "bg-background/95 shadow-sm" : "bg-background/75"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PawPrint className="h-5 w-5" />
          </span>
          <span className="font-display text-xl tracking-tight">FursBliss</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative pb-1 transition-colors hover:text-foreground ${
                link.active ? "text-foreground" : ""
              }`}
            >
              {link.label}
              {link.active ? (
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" />
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>FursBliss</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4 text-sm">
                  {links.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link href={link.href} className="text-muted-foreground">
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link href="/login" className="text-muted-foreground">
                      Login
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild className="shimmer-cta hover:scale-[1.02] transition-all duration-300">
                      <Link href="/quiz">Take the 2-Min Quiz</Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Button variant="ghost" asChild className="hidden md:inline-flex hover:scale-[1.02] transition-all duration-300">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="shimmer-cta hover:scale-[1.02] transition-all duration-300">
            <Link href="/quiz">Take the 2-Min Quiz</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
