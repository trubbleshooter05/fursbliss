import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { StartupAdvisorForm } from "@/components/admin/startup-advisor-form";

export default async function StartupAdvisorPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">← Back to Admin</Link>
        </Button>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Startup Advisor
        </h1>
        <p className="text-muted-foreground">
          Strategic prompts for pain points, acquisition, and revenue.
        </p>
      </div>

      <StartupAdvisorForm />
    </div>
  );
}
