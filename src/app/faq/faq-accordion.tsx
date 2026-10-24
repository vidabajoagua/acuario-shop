"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = { q: string; a: string };

export default function FAQAccordion({ questions }: { questions: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return <div className="space-y-3">{questions.map((item, i) => <article key={item.q} className="overflow-hidden rounded-xl border border-border bg-card"><button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium transition hover:bg-muted/40"><span>{item.q}</span><ChevronDown size={18} className={`shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}/></button>{open === i && <p className="border-t border-border px-4 py-4 text-sm leading-6 text-muted-foreground">{item.a}</p>}</article>)}</div>;
}
