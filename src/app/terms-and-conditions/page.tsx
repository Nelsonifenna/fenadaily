import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";
const DESC =
  "Fena Daily's Terms & Conditions: the rules that govern your use of our website and content.";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/terms-and-conditions` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/terms-and-conditions`,
    title: "Terms & Conditions | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Terms+%26+Conditions`, width: 1200, height: 630, alt: "Terms & Conditions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Terms+%26+Conditions`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms & Conditions",
  description: DESC,
  url: `${SITE_URL}/terms-and-conditions`,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const sections = [
  {
    heading: "1. Acceptance of Terms",
    content: (
      <p>
        By accessing or using Fena Daily (&ldquo;the Site&rdquo;), you agree to be bound by these
        Terms & Conditions. If you do not agree, please do not use the Site.
      </p>
    ),
  },
  {
    heading: "2. Use of the Site",
    content: (
      <p>
        You may access and read Fena Daily&apos;s content for personal, non-commercial use. You
        agree not to misuse the Site, including attempting to gain unauthorized access to our
        systems, disrupting the Site&apos;s operation, or using automated means to scrape or
        republish our content without permission.
      </p>
    ),
  },
  {
    heading: "3. Intellectual Property",
    content: (
      <p>
        Unless otherwise noted, all articles, graphics, logos, and other content published on Fena
        Daily are the property of Fena Daily or its licensors and are protected by copyright and
        other intellectual property laws. You may share links to our articles and quote brief
        excerpts with proper attribution, but you may not republish, redistribute, or reproduce our
        content in full without prior written permission.
      </p>
    ),
  },
  {
    heading: "4. User Conduct",
    content: (
      <p>
        If the Site offers comment, contact, or subscription forms, you agree to provide accurate
        information and not to use these features to submit unlawful, abusive, or spam content.
        We reserve the right to remove submissions and restrict access for anyone who violates
        these Terms.
      </p>
    ),
  },
  {
    heading: "5. Third-Party Links",
    content: (
      <p>
        Fena Daily may link to third-party websites for reference or convenience. We do not
        control and are not responsible for the content, privacy practices, or availability of
        those external sites. Visiting linked sites is at your own risk.
      </p>
    ),
  },
  {
    heading: "6. Disclaimer of Warranties",
    content: (
      <p>
        The Site and its content are provided &ldquo;as is&rdquo; without warranties of any kind,
        express or implied. We work to keep our content accurate and up to date, but we do not
        guarantee completeness, accuracy, or reliability of any information published on the Site.
        See our{" "}
        <a href="/disclaimer" className="text-amber-300 transition-colors hover:text-amber-200">
          Disclaimer
        </a>{" "}
        for more detail.
      </p>
    ),
  },
  {
    heading: "7. Limitation of Liability",
    content: (
      <p>
        To the fullest extent permitted by law, Fena Daily and its contributors shall not be liable
        for any indirect, incidental, or consequential damages arising from your use of, or
        inability to use, the Site or its content.
      </p>
    ),
  },
  {
    heading: "8. Changes to These Terms",
    content: (
      <p>
        We may update these Terms & Conditions from time to time. Continued use of the Site after
        changes are posted constitutes your acceptance of the revised Terms.
      </p>
    ),
  },
  {
    heading: "9. Governing Law",
    content: (
      <p>
        These Terms are governed by applicable laws in the jurisdiction in which Fena Daily
        operates, without regard to conflict-of-law principles.
      </p>
    ),
  },
  {
    heading: "10. Contact",
    content: (
      <p>
        Questions about these Terms can be sent to{" "}
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

export default function TermsAndConditionsPage() {
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
              Terms & Conditions
            </h1>

            <p className="mt-3 text-xs text-zinc-500">Last updated: July 2026</p>

            <p className="mt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
              These Terms & Conditions govern your use of fenadaily.com, operated by Fena Daily
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
