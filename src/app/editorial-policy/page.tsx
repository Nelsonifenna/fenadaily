import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";
const DESC =
  "Fena Daily's Editorial Policy: our commitment to accuracy, fact-checking, corrections, transparency, and editorial independence.";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/editorial-policy` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/editorial-policy`,
    title: "Editorial Policy | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Editorial+Policy`, width: 1200, height: 630, alt: "Editorial Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Editorial Policy | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Editorial+Policy`],
  },
};

const contentTypes = [
  {
    label: "News & Reporting",
    desc: "Factual coverage of events, developments, data, or statements, based on research and verifiable sources.",
  },
  {
    label: "Analysis & Explanation",
    desc: "Our interpretation or breakdown of complex topics. Clearly labeled as analysis so readers know they're reading our assessment, not established fact.",
  },
  {
    label: "Opinion",
    desc: "Clearly labeled commentary representing a perspective, not necessarily an institutional position of Fena Daily.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Editorial Policy",
  description: DESC,
  url: `${SITE_URL}/editorial-policy`,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function EditorialPolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Standards</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Editorial Policy
          </h1>

          <p className="mt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
            Fena Daily exists because we believe independent, thoughtful journalism matters. The
            standards described here reflect how we approach our work, and what you can expect
            from us every time you read something we&apos;ve published.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-300 sm:text-base">
            <section>
              <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">Accuracy</h2>
              <p className="mb-3">
                Getting things right is our first obligation. Before publishing, we verify key
                claims through primary sources, credible reporting, or firsthand research wherever
                possible.
              </p>
              <p>
                If we cannot verify a claim with reasonable confidence, we say so explicitly, or
                we don&apos;t publish it. We distinguish between established facts, expert opinion,
                and developing information.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">Fact-Checking</h2>
              <p className="mb-3">Our fact-checking process involves:</p>
              <ul className="space-y-2.5 pl-0">
                {[
                  "Consulting primary sources: official reports, peer-reviewed research, company filings, government data",
                  "Cross-referencing multiple credible sources before stating something as fact",
                  "Being explicit about uncertainty when it exists",
                  "Distinguishing between what is confirmed and what is reported or alleged",
                  "Noting when a story is based on a single source",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                We do not publish rumors presented as fact. When a claim is unverified, we say so.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">
                Corrections Policy
              </h2>
              <p className="mb-3">
                We make mistakes. When we do, we correct them promptly and transparently.
              </p>
              <p className="mb-3">
                Corrections are made directly in the affected article, with a correction notice
                explaining what changed and why. We do not silently edit published content without
                disclosure.
              </p>
              <p>
                If you believe something we&apos;ve published is incorrect, please contact us at{" "}
                <a
                  href="mailto:fenadaily@gmail.com"
                  className="text-amber-300 transition-colors hover:text-amber-200"
                >
                  fenadaily@gmail.com
                </a>
                . We review every report and respond to substantive corrections.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">Transparency</h2>
              <p className="mb-3">We believe readers deserve to know who is writing to them and why. We are transparent about:</p>
              <ul className="space-y-2.5 pl-0">
                {[
                  "Who we are and how we operate",
                  "Our editorial independence from commercial interests",
                  "When content has been updated or corrected",
                  "The distinction between editorial and any future sponsored content",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">Independence</h2>
              <p className="mb-3">
                Fena Daily does not accept payment in exchange for editorial coverage. Our topics and
                editorial positions are determined entirely by what we believe is newsworthy, useful,
                or important to our readers.
              </p>
              <p>
                If we ever publish sponsored content or paid partnerships, it will be clearly and
                prominently labeled as such. Editorial content and commercial content will never be
                mixed without clear disclosure.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-base font-semibold text-white sm:text-lg">Content Types</h2>
              <p className="mb-4">
                We publish three types of content, and we aim to make the distinction clear in every
                piece we publish:
              </p>
              <div className="space-y-3">
                {contentTypes.map(({ label, desc }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/8 bg-white/4 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">
                Conflicts of Interest
              </h2>
              <p>
                Our editorial team does not accept gifts, free products, or payments from companies
                or individuals we cover. Where relevant relationships exist that could affect our
                coverage, they will be disclosed clearly in the article.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">Reader Trust</h2>
              <p className="mb-3">
                Everything above comes down to one thing: we want to earn your trust. Not your
                clicks. Your trust.
              </p>
              <p>
                We are an independent publication building toward something long-term. We can only
                do that if our readers know we are playing it straight. If you have questions about
                any of our editorial decisions, please reach out:{" "}
                <a
                  href="mailto:fenadaily@gmail.com"
                  className="text-amber-300 transition-colors hover:text-amber-200"
                >
                  fenadaily@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
