import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";
const DESC =
  "Fena Daily's Cookie Policy: what cookies we use, why we use them, and how to control them.";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/cookie-policy` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/cookie-policy`,
    title: "Cookie Policy | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Cookie+Policy`, width: 1200, height: 630, alt: "Cookie Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Cookie+Policy`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Cookie Policy",
  description: DESC,
  url: `${SITE_URL}/cookie-policy`,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const sections = [
  {
    heading: "1. What Are Cookies",
    content: (
      <p>
        Cookies are small text files placed on your device when you visit a website. They&apos;re
        widely used to make sites work, work more efficiently, and to provide information to the
        site&apos;s owners. Cookies can be &ldquo;session&rdquo; cookies (deleted when you close your
        browser) or &ldquo;persistent&rdquo; cookies (remain until they expire or you delete them).
      </p>
    ),
  },
  {
    heading: "2. How We Use Cookies",
    content: (
      <ul className="space-y-2 pl-0">
        {[
          "Essential cookies: required for core site functionality, such as remembering your newsletter subscription state or unsubscribe requests.",
          "Analytics cookies: help us understand how visitors use Fena Daily so we can improve our content and site performance.",
          "Advertising cookies: if we display ads (for example, via Google AdSense), our advertising partners may set cookies to serve relevant ads and measure their performance.",
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    heading: "3. Third-Party Cookies",
    content: (
      <p>
        Some cookies on Fena Daily may be set by third-party services we use, including analytics
        providers and, where applicable, advertising networks such as Google. These third parties
        may use cookies (including the DoubleClick cookie) to serve ads based on your prior visits
        to this and other websites. You can learn more about how Google uses data at{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 transition-colors hover:text-amber-200"
        >
          policies.google.com/technologies/partner-sites
        </a>
        .
      </p>
    ),
  },
  {
    heading: "4. Managing Cookies",
    content: (
      <p>
        Most web browsers let you control cookies through their settings, including blocking or
        deleting them. Restricting cookies may impact the functionality of this and other websites
        you visit. You can also opt out of personalized advertising from participating providers
        via{" "}
        <a
          href="https://www.aboutads.info/choices/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 transition-colors hover:text-amber-200"
        >
          aboutads.info/choices
        </a>
        .
      </p>
    ),
  },
  {
    heading: "5. Changes to This Policy",
    content: (
      <p>
        We may update this Cookie Policy periodically to reflect changes in the cookies we use or
        for legal reasons. Any changes will be posted on this page with an updated revision date.
      </p>
    ),
  },
  {
    heading: "6. Contact",
    content: (
      <p>
        Questions about our use of cookies can be sent to{" "}
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

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>

            <p className="mt-3 text-xs text-zinc-500">Last updated: July 2026</p>

            <p className="mt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
              This Cookie Policy explains how Fena Daily (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;us&rdquo;) uses cookies and similar technologies when you visit
              fenadaily.com.
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
