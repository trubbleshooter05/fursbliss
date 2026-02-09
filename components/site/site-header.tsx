import Link from "next/link";
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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <PawPrint className="h-5 w-5" />
          </span>
          FursBliss
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/breeds" className="transition-colors hover:text-foreground">
            Breeds
          </Link>
          <Link href="/trends" className="transition-colors hover:text-foreground">
            Trends
          </Link>
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
                  <SheetClose asChild>
                    <Link href="/#features" className="text-muted-foreground">
                      Features
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/pricing" className="text-muted-foreground">
                      Pricing
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/breeds" className="text-muted-foreground">
                      Breeds
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/trends" className="text-muted-foreground">
                      Trends
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/login" className="text-muted-foreground">
                      Login
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild>
                      <Link href="/signup">Get Started Free</Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
