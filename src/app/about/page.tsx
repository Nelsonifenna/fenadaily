import type { Metadata } from "next";
import { SocialLinks } from "@/components/SocialLinks";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";

const DESC =
  "Independent coverage of AI, Football, Crypto, Business, Technology, Politics, and Personal Growth.";

export const metadata: Metadata = {
  title: "About Us",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: "About Us | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=About+Fena+Daily`, width: 1200, height: 630, alt: "About Fena Daily" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Fena Daily",
    description: DESC,
    images: [`/api/og?title=About+Fena+Daily`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Fena Daily",
  description: DESC,
  url: `${SITE_URL}/about`,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const coverageAreas = [
  {
    topic: "Artificial Intelligence",
    desc: "How it works, where it's being deployed, and what it means for people, businesses, and society.",
  },
  {
    topic: "Business & Entrepreneurship",
    desc: "How companies grow, how industries evolve, and what makes ideas succeed or fail in the real world.",
  },
  {
    topic: "Technology",
    desc: "The platforms, products, and systems changing how we live, work, and communicate.",
  },
  {
    topic: "Finance & Crypto",
    desc: "Markets, money, investment, and the evolving world of digital assets and decentralized finance.",
  },
  {
    topic: "Careers & Personal Growth",
    desc: "Practical insight for people navigating their professional lives and building skills that matter.",
  },
  {
    topic: "Global Trends & Affairs",
    desc: "The political, economic, and cultural forces shaping an increasingly interconnected world.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">About</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              About Fena Daily
            </h1>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <p>
                Fena Daily is an independent digital publication covering the ideas, trends, and
                developments shaping our world, from artificial intelligence and entrepreneurship
                to careers, finance, and global affairs.
              </p>
              <p>
                We write for people who are curious about how things work, interested in where things
                are heading, and looking for content that is actually worth their time.
              </p>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">Why We Started</h2>
                <p className="mb-3">
                  We started Fena Daily because we believe that good journalism and clear analysis
                  shouldn&apos;t be locked behind paywalls or buried in jargon. The world is changing
                  fast: AI is restructuring work, new business models are emerging overnight,
                  and financial systems are evolving. Most people deserve access to honest,
                  well-researched coverage of what&apos;s happening and why it matters.
                </p>
                <p>
                  The internet has no shortage of content. What it often lacks is writing that takes
                  a topic seriously, does the research, and explains it in a way that&apos;s clear
                  without being condescending. That&apos;s what we&apos;re building.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">What We Cover</h2>
                <ul className="space-y-3">
                  {coverageAreas.map(({ topic, desc }) => (
                    <li key={topic} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      <span>
                        <strong className="text-white">{topic}</strong>: {desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">Our Approach</h2>
                <p className="mb-3">
                  We don&apos;t publish for traffic. We publish because a topic is interesting,
                  important, or genuinely useful to our readers.
                </p>
                <p>
                  Before an article goes up, we research it thoroughly, verify key claims, and think
                  carefully about how to explain it clearly. If something we&apos;ve published turns
                  out to be wrong, we correct it, promptly and transparently. We write in a tone
                  that&apos;s honest and direct: like people who find this stuff genuinely fascinating
                  and want to share what they&apos;ve learned.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">Our Independence</h2>
                <p>
                  Fena Daily is independently operated. We are not owned by a media conglomerate,
                  affiliated with any political group, or funded by industry interests. Our editorial
                  decisions are based on what we believe is worth covering, not what serves an
                  advertiser or sponsor. When we run advertising or partnership content, it will be
                  clearly labeled, and the line between editorial and commercial will remain clear.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">Where We&apos;re Headed</h2>
                <p className="mb-3">
                  Our goal isn&apos;t viral moments. It&apos;s a publication that earns your trust
                  over time by consistently delivering content that&apos;s accurate, thoughtful,
                  and useful.
                </p>
                <p>
                  We&apos;re early in that journey. But we&apos;re serious about it, and we&apos;re
                  grateful you&apos;re here.
                </p>
              </section>

              {/* Social links */}
              <div className="border-t border-white/10 pt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-zinc-500">
                  Follow Us
                </p>
                <SocialLinks />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
