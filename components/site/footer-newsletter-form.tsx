"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/waitlist/loy002", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setSuccess(true);
        setEmail("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
        />
        <Button
          type="submit"
          className="bg-accent text-accent-foreground hover:brightness-110"
          disabled={loading}
        >
          {loading ? "Saving..." : "Notify Me"}
        </Button>
      </div>
      {success ? (
        <p className="text-xs text-emerald-300">Thanks - you are on the LOY-002 update list.</p>
      ) : null}
    </form>
  );
}
