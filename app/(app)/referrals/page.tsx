"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Copy, Mail, MessageCircle, Share2, Trophy, Users } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ReferralPayload = {
  code: string;
  shareUrl: string;
  stats: {
    invitesSent: number;
    signups: number;
    rewardsEarned: number;
    progressToThreeMonths: number;
  };
};

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/referral");
        const payload = await response.json();
        if (response.ok) {
          setData(payload);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const shareLinks = useMemo(() => {
    if (!data) {
      return null;
    }
    const encoded = encodeURIComponent(
      `Help your dog age better with me on FursBliss. Join with my link: ${data.shareUrl}`
    );
    return {
      x: `https://twitter.com/intent/tweet?text=${encoded}`,
      email: `mailto:?subject=Join me on FursBliss&body=${encoded}`,
      whatsapp: `https://wa.me/?text=${encoded}`,
    };
  }, [data]);

  const copyLink = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading referral dashboard...</p>;
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border-border">
        <CardContent className="py-8 text-sm text-muted-foreground">
          Unable to load referral data right now.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AnimateIn className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Referral program</p>
        <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground">Invite your pack, earn free months</h1>
        <p className="text-muted-foreground">
          Invite 3 friends who sign up and unlock 3 free premium months.
        </p>
      </AnimateIn>

      <AnimateIn delay={0.08}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Your referral link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input readOnly value={data.shareUrl} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyLink} className="hover:scale-[1.02] transition-all duration-300">
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy link"}
              </Button>
              <Button variant="outline" asChild>
                <a href={shareLinks?.x} target="_blank" rel="noreferrer">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share on X
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={shareLinks?.whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={shareLinks?.email}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimateIn>

      <div className="grid gap-4 md:grid-cols-3">
        <AnimateIn delay={0.12}>
          <MetricCard icon={<Users className="h-4 w-4 text-primary" />} label="Invites sent" value={data.stats.invitesSent} />
        </AnimateIn>
        <AnimateIn delay={0.16}>
          <MetricCard icon={<Trophy className="h-4 w-4 text-primary" />} label="Signups" value={data.stats.signups} />
        </AnimateIn>
        <AnimateIn delay={0.2}>
          <MetricCard icon={<Share2 className="h-4 w-4 text-primary" />} label="Rewards earned" value={data.stats.rewardsEarned} />
        </AnimateIn>
      </div>

      <AnimateIn delay={0.24}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Progress to 3 free months</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${data.stats.progressToThreeMonths}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Invite 3 friends who activate accounts to unlock your full referral milestone.
            </p>
          </CardContent>
        </Card>
      </AnimateIn>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="rounded-2xl border-border">
      <CardContent className="space-y-2 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="stat-number text-4xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
