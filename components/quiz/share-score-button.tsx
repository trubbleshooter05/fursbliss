"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareScoreButton({
  dogName,
  resultPath,
}: {
  dogName: string;
  resultPath: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${resultPath}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Button className="min-h-11" variant="outline" onClick={handleCopy}>
      {copied ? `Copied ${dogName}'s score` : `Share ${dogName}'s Score`}
    </Button>
  );
}

