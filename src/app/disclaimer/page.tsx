import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";
const DESC =
  "Fena Daily's Disclaimer: important information about the accuracy, purpose, and limitations of our content.";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/disclaimer` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/disclaimer`,
    title: "Disclaimer | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Disclaimer`, width: 1200, height: 630, alt: "Disclaimer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Disclaimer`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Disclaimer",
  description: DESC,
  url: `${SITE_URL}/disclaimer`,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const sections = [
  {
    heading: "1. General Information Only",
    content: (
      <p>
        The content published on Fena Daily is for general informational purposes only. It does
        not constitute professional advice of any kind, and should not be relied upon as a
        substitute for consultation with qualified professionals.
      </p>
    ),
  },
  {
    heading: "2. Not Financial, Legal, or Medical Advice",
    content: (
      <p>
        Nothing on this Site, including our coverage of crypto, business, or finance topics,
        constitutes financial, investment, legal, tax, or medical advice. Always do your own
        research and consult a licensed professional before making decisions based on information
        found on Fena Daily.
      </p>
    ),
  },
  {
    heading: "3. Accuracy of Information",
    content: (
      <p>
        We work to verify facts and keep our articles accurate and up to date, as described in our{" "}
        <a href="/editorial-policy" className="text-amber-300 transition-colors hover:text-amber-200">
          Editorial Policy
        </a>
        . However, we make no warranties about the completeness, reliability, or accuracy of this
        information. Any action you take based on content from this Site is strictly at your own
        risk.
      </p>
    ),
  },
  {
    heading: "4. External Links",
    content: (
      <p>
        Fena Daily may link to external websites or sources that are not provided or maintained by
        us. We do not guarantee the accuracy, relevance, or completeness of any information on
        these external sites.
      </p>
    ),
  },
  {
    heading: "5. Views Expressed",
    content: (
      <p>
        Opinion pieces and analysis reflect the views of the author at the time of publication and
        not necessarily the views of Fena Daily as a publication. See our{" "}
        <a href="/editorial-policy" className="text-amber-300 transition-colors hover:text-amber-200">
          Editorial Policy
        </a>{" "}
        for how we distinguish reporting, analysis, and opinion.
      </p>
    ),
  },
  {
    heading: "6. Affiliate & Advertising Content",
    content: (
      <p>
        Some content may contain affiliate links or sponsored content, always disclosed where
        applicable. See our{" "}
        <a href="/affiliate-disclosure" className="text-amber-300 transition-colors hover:text-amber-200">
          Affiliate Disclosure
        </a>{" "}
        for details.
      </p>
    ),
  },
  {
    heading: "7. Contact",
    content: (
      <p>
        Questions about this Disclaimer can be sent to{" "}
        <a
          href="mailto:fenadaily@gmail.com"
          className="text-amber-300 transition-colors hover:text-amber-200"
        >
          fenadaily@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Legal</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Disclaimer
            </h1>

            <p className="mt-3 text-xs text-zinc-500">Last updated: July 2026</p>

            <p className="mt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
              This Disclaimer applies to all content published on fenadaily.com by Fena Daily
              (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;).
            </p>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {sections.map(({ heading, content }) => (
                <section key={heading}>
                  <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">{heading}</h2>
                  {content}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
