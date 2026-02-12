"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlaskConical,
  Gift,
  LayoutDashboard,
  Pill,
  Menu,
  PawPrint,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/dashboard/user-menu";
import { PetSwitcher } from "@/components/dashboard/pet-switcher";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    subscriptionStatus?: string;
    role?: string;
  };
  pets?: { id: string; name: string }[];
};

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pets", label: "My Pets", icon: PawPrint },
  { href: "/dashboard/longevity-drugs", label: "Longevity Hub", icon: FlaskConical },
  { href: "/dashboard/doses", label: "Doses", icon: Pill },
  { href: "/interaction-checker", label: "Interactions", icon: ShieldAlert },
  { href: "/referrals", label: "Referrals", icon: Gift },
  { href: "/logs/new", label: "Log Health", icon: PlusCircle },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/account", label: "Account", icon: User },
];

export function AppShell({ children, user, pets = [] }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-border/70 bg-card/90 p-6 backdrop-blur lg:flex">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl">FursBliss</span>
          </Link>
          <div className="mt-6">
            <PetSwitcher pets={pets} />
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className="justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-300"
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4 text-primary" />
                  {link.label}
                </Link>
              </Button>
            ))}
            {user.role === "admin" && (
              <Button
                variant="ghost"
                className="justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-300"
                asChild
              >
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Admin
                </Link>
              </Button>
            )}
          </nav>
          {user.subscriptionStatus !== "premium" && (
            <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-foreground">
              <p className="font-semibold">Premium ready</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Upgrade for unlimited pets, AI insights, and vet-ready reports.
              </p>
              <Button size="sm" className="mt-3 w-full hover:scale-[1.02] transition-all duration-300" asChild>
                <Link href="/pricing">Upgrade</Link>
              </Button>
            </div>
          )}
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72">
                    <SheetHeader>
                      <SheetTitle>FursBliss</SheetTitle>
                    </SheetHeader>
                  <div className="mt-4">
                    <PetSwitcher pets={pets} />
                  </div>
                    <nav className="mt-6 flex flex-col gap-2">
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                          <Button
                            variant="ghost"
                            className="justify-start gap-3 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link href={link.href}>
                              <link.icon className="h-4 w-4 text-primary" />
                              {link.label}
                            </Link>
                          </Button>
                        </SheetClose>
                      ))}
                      {user.role === "admin" && (
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start gap-3 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link href="/admin">
                              <LayoutDashboard className="h-4 w-4 text-primary" />
                              Admin
                            </Link>
                          </Button>
                        </SheetClose>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary lg:flex">
                <PawPrint className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                {user.subscriptionStatus === "premium" ? "Premium plan" : "Free plan"}
              </p>
            </div>
            <UserMenu name={user.name} email={user.email} />
          </header>
          <main className="flex-1 px-6 py-10 pb-24 lg:pb-10">
            <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
          </main>
          <MobileBottomNav role={user.role} />
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const links = role === "admin" ? [...navLinks, { href: "/admin", label: "Admin", icon: LayoutDashboard }] : navLinks;
  const accountLink = links.find((link) => link.href === "/account");
  const mobileLinks = accountLink
    ? [...links.filter((link) => link.href !== "/account").slice(0, 5), accountLink]
    : links.slice(0, 6);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-2xl grid-cols-6 gap-1">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
