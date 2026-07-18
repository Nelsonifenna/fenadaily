import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";
const DESC =
  "Fena Daily's Affiliate Disclosure: how we handle affiliate links and sponsored content, in line with FTC guidelines.";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/affiliate-disclosure` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/affiliate-disclosure`,
    title: "Affiliate Disclosure | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Affiliate+Disclosure`, width: 1200, height: 630, alt: "Affiliate Disclosure" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Affiliate Disclosure | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Affiliate+Disclosure`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Affiliate Disclosure",
  description: DESC,
  url: `${SITE_URL}/affiliate-disclosure`,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const sections = [
  {
    heading: "1. What This Means",
    content: (
      <p>
        From time to time, articles on Fena Daily may contain affiliate links: links to products or
        services that, if you click and make a qualifying purchase, may earn us a small commission
        at no additional cost to you. This disclosure is provided in accordance with the U.S.
        Federal Trade Commission&apos;s guidelines on endorsements and testimonials (16 CFR Part
        255).
      </p>
    ),
  },
  {
    heading: "2. Editorial Independence",
    content: (
      <p>
        Affiliate relationships never influence our editorial judgment. We recommend products and
        services because we believe they are genuinely useful or relevant to our readers, not
        because of any commission we may earn. Our{" "}
        <a href="/editorial-policy" className="text-amber-300 transition-colors hover:text-amber-200">
          Editorial Policy
        </a>{" "}
        governs how we research, write, and fact-check every article, regardless of whether it
        contains affiliate links.
      </p>
    ),
  },
  {
    heading: "3. How We Disclose Affiliate Content",
    content: (
      <p>
        Where an article contains affiliate links, we aim to make this clear within the content
        itself. Sponsored content or paid partnerships, if published, will always be clearly and
        prominently labeled as such, separate from our independent editorial coverage.
      </p>
    ),
  },
  {
    heading: "4. Third-Party Advertising",
    content: (
      <p>
        We may also display third-party advertising (such as Google AdSense) on this Site. These
        ads are served by third-party networks and are not personally selected or endorsed by Fena
        Daily. See our{" "}
        <a href="/cookie-policy" className="text-amber-300 transition-colors hover:text-amber-200">
          Cookie Policy
        </a>{" "}
        for details on how advertising partners may use cookies.
      </p>
    ),
  },
  {
    heading: "5. Contact",
    content: (
      <p>
        Questions about this Affiliate Disclosure can be sent to{" "}
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

export default function AffiliateDisclosurePage() {
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
              Affiliate Disclosure
            </h1>

            <p className="mt-3 text-xs text-zinc-500">Last updated: July 2026</p>

            <p className="mt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
              This Affiliate Disclosure applies to all content published on fenadaily.com by Fena
              Daily (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;).
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
