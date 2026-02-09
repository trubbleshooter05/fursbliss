import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: { code: string };
};

export default async function InvitePage({ params }: PageProps) {
  const code = params.code.toUpperCase();
  const user = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { name: true },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>You're invited to FursBliss</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              {user?.name
                ? `${user.name} invited you to track your dog's longevity with FursBliss.`
                : "You have been invited to track your dog's longevity with FursBliss."}
            </p>
            <p>Sign up free and get one month of premium when you join.</p>
            <Button asChild>
              <Link href={`/signup?ref=${code}`}>Accept invite</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
