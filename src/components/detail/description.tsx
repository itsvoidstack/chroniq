"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DescriptionProps {
  text: string | null;
  className?: string;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

export function Description({ text, className }: DescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const clean = stripHtml(text);
  const limit = 300;
  const isLong = clean.length > limit;
  const display = !expanded && isLong ? clean.slice(0, limit) + "…" : clean;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-muted-foreground leading-relaxed">{display}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
