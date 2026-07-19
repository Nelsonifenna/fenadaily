import type { FAQItem } from "@/football/generate";

export function MatchFAQ({ faqs }: { faqs: FAQItem[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-xl border border-white/8 bg-white/4 px-4 py-3 open:bg-white/[0.06]"
        >
          <summary className="cursor-pointer list-none text-sm font-medium text-white marker:content-none">
            <span className="flex items-center justify-between gap-3">
              {faq.question}
              <span className="shrink-0 text-zinc-500 transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
