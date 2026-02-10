"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type VetCommentFormProps = {
  token: string;
  initialComment: string | null;
};

export function VetCommentForm({ token, initialComment }: VetCommentFormProps) {
  const [comment, setComment] = useState(initialComment ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/vet-view/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, comment }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save comment.");
      }
      setMessage("Comment saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        rows={5}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Add a professional note for the pet owner (assessment, next tests, medication adjustments, follow-up timeline)."
      />
      <Button onClick={onSave} disabled={isSaving || comment.trim().length < 5}>
        {isSaving ? "Saving..." : "Save vet comment"}
      </Button>
      {message && <p className="text-xs text-emerald-700">{message}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
