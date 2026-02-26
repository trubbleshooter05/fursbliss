"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function GlobalSearch({
  defaultQuery = "",
  className = "",
  placeholder = "Search FursBliss...",
}: {
  defaultQuery?: string;
  className?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <form onSubmit={submit} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="h-10 pl-9"
      />
    </form>
  );
}
