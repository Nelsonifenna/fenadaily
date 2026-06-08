import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { getLatestPosts } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";
const DESC =
  "Meet the Fena Daily editorial team: the researchers and writers behind our coverage of business, technology, AI, finance, and personal development.";

export const metadata: Metadata = {
  title: "Authors",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/authors` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/authors`,
    title: "Authors | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Fena+Daily+Authors`, width: 1200, height: 630, alt: "Fena Daily Authors" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Authors | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Fena+Daily+Authors`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/authors#editorial-team`,
  name: "Fena Daily Editorial Team",
  description:
    "The Fena Daily editorial team researches and publishes content across business, technology, AI, finance, careers, and personal development.",
  url: `${SITE_URL}/authors`,
  worksFor: { "@id": `${SITE_URL}/#organization` },
  knowsAbout: [
    "Artificial Intelligence",
    "Business",
    "Entrepreneurship",
    "Technology",
    "Finance",
    "Personal Development",
    "Careers",
    "Global Affairs",
  ],
};

const focusAreas = [
  "Artificial intelligence and its implications for business, labor, and everyday life",
  "Entrepreneurship, startups, and how companies are built and grown",
  "Technology products, platforms, and the trends shaping how we live and work",
  "Finance, markets, and the evolution of digital assets",
  "Career development, skill-building, and navigating professional life",
  "Global trends connecting and reshaping industries and societies",
];

export default async function AuthorsPage() {
  const recentPosts = await getLatestPosts(4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Authors</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Who We Are
            </h1>

            {/* Author card */}
            <div className="mt-8 flex items-start gap-5 rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-6">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 to-amber-400/5 text-2xl font-bold text-amber-300 ring-1 ring-amber-400/20 sm:h-20 sm:w-20 sm:text-3xl">
                FD
              </div>
              <div>
                <p className="text-base font-semibold text-white sm:text-lg">
                  Fena Daily Editorial Team
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">Fena Daily &middot; Independent Publication</p>
                <p className="mt-2 max-w-md text-sm text-zinc-400">
                  Researchers and writers covering AI, business, technology, football, music, politics, and personal growth. Every story is reviewed before it&apos;s published.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <p>
                The Fena Daily editorial team researches and writes across our core coverage areas:
                business, technology, artificial intelligence, finance, entrepreneurship, careers,
                and personal development.
              </p>
              <p>
                Our work is driven by genuine curiosity. We explore the ideas, trends, and
                developments we believe matter: the ones affecting how people work, build
                companies, manage money, and navigate a world that&apos;s changing faster than most
                people expected.
              </p>

              <section>
                <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">How We Work</h2>
                <p className="mb-3">
                  Every article we publish begins with research. We read widely, consult primary
                  sources, verify claims, and work to genuinely understand a topic before we try to
                  explain it.
                </p>
                <p>
                  We don&apos;t have an agenda beyond getting it right and making it useful. We
                  write in a tone that&apos;s direct and human, the kind of voice you&apos;d want
                  explaining something complicated to you clearly, without oversimplifying it.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-base font-semibold text-white sm:text-lg">
                  Our Focus Areas
                </h2>
                <ul className="space-y-2.5 pl-0">
                  {focusAreas.map((area) => (
                    <li key={area} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">
                  Our Standard
                </h2>
                <p>
                  Clarity, usefulness, and accuracy, in that order. We hold ourselves to a simple
                  standard: would a thoughtful, busy person find this genuinely helpful? If the
                  answer isn&apos;t yes, we keep working.
                </p>
              </section>

              {/* Contact CTA */}
              <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
                <p className="text-sm text-zinc-300">
                  Have a tip, a correction, or feedback on something we&apos;ve published?
                </p>
                <p className="mt-1.5 text-sm">
                  <Link
                    href="/contact"
                    className="font-medium text-amber-300 transition-colors hover:text-amber-200"
                  >
                    Reach out here
                  </Link>{" "}
                  or email{" "}
                  <a
                    href="mailto:fenadaily@gmail.com"
                    className="font-medium text-amber-300 transition-colors hover:text-amber-200"
                  >
                    fenadaily@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {recentPosts.length > 0 && (
            <div className="mt-8">
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-amber-300 font-semibold sm:mb-6">
                Recent Stories from the Team
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {recentPosts.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
