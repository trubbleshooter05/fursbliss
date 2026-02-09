import Link from "next/link";
import {
  LayoutDashboard,
  Menu,
  PawPrint,
  PlusCircle,
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
  { href: "/logs/new", label: "Log Health", icon: PlusCircle },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/account", label: "Account", icon: User },
];

export function AppShell({ children, user, pets = [] }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200/70 bg-white/80 p-6 backdrop-blur lg:flex">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <PawPrint className="h-5 w-5" />
            </span>
            FursBliss
          </Link>
          <div className="mt-6">
            <PetSwitcher pets={pets} />
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className="justify-start gap-3 text-slate-600 hover:text-slate-900"
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4 text-emerald-600" />
                  {link.label}
                </Link>
              </Button>
            ))}
            {user.role === "admin" && (
              <Button
                variant="ghost"
                className="justify-start gap-3 text-slate-600 hover:text-slate-900"
                asChild
              >
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                  Admin
                </Link>
              </Button>
            )}
          </nav>
          {user.subscriptionStatus !== "premium" && (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-700">
              <p className="font-semibold">Premium ready</p>
              <p className="mt-2 text-xs text-emerald-700/80">
                Upgrade for unlimited pets, AI insights, and vet-ready reports.
              </p>
              <Button size="sm" className="mt-3 w-full" asChild>
                <Link href="/pricing">Upgrade</Link>
              </Button>
            </div>
          )}
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 backdrop-blur">
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
                            className="justify-start gap-3 text-slate-600"
                            asChild
                          >
                            <Link href={link.href}>
                              <link.icon className="h-4 w-4 text-emerald-600" />
                              {link.label}
                            </Link>
                          </Button>
                        </SheetClose>
                      ))}
                      {user.role === "admin" && (
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start gap-3 text-slate-600"
                            asChild
                          >
                            <Link href="/admin">
                              <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                              Admin
                            </Link>
                          </Button>
                        </SheetClose>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 lg:flex">
                <PawPrint className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                {user.subscriptionStatus === "premium" ? "Premium plan" : "Free plan"}
              </p>
            </div>
            <UserMenu name={user.name} email={user.email} />
          </header>
          <main className="flex-1 px-6 py-10">
            <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
