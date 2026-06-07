import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { SocialLinks } from "@/components/SocialLinks";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";
const DESC = "Get in touch with Fena Daily — for inquiries, feedback, corrections, collaborations, or advertising.";

export const metadata: Metadata = {
  title: "Contact Us",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    title: "Contact Us | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Contact+Fena+Daily`, width: 1200, height: 630, alt: "Contact Fena Daily" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Contact+Fena+Daily`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Fena Daily",
  description: DESC,
  url: `${SITE_URL}/contact`,
  publisher: {
    "@type": "Organization",
    name: "Fena Daily",
    url: SITE_URL,
    email: "fenadaily@gmail.com",
  },
};

const contactTypes = [
  {
    heading: "General Inquiries",
    body: "Questions about our coverage, the publication, or anything else about Fena Daily.",
  },
  {
    heading: "Corrections & Feedback",
    body: "If you believe something we've published is inaccurate or misleading, please let us know. We take corrections seriously and respond promptly.",
  },
  {
    heading: "Partnerships & Collaborations",
    body: "We're open to thoughtful collaborations with brands and organizations that align with our editorial values. Reach out with a brief proposal.",
  },
  {
    heading: "Advertising",
    body: "Interested in reaching our audience? Get in touch with a brief overview of what you have in mind, and we'll follow up with details on current opportunities.",
  },
];

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Contact</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Get in Touch
            </h1>

            <p className="mt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
              We&apos;d love to hear from you. Whether you have a question, a correction,
              a story tip, or want to explore a partnership — use the form below or email
              us directly.
            </p>

            {/* Contact type cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {contactTypes.map(({ heading, body }) => (
                <div
                  key={heading}
                  className="rounded-xl border border-white/8 bg-white/4 p-4"
                >
                  <p className="text-sm font-semibold text-white">{heading}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-3.5">
              <p className="text-xs text-zinc-400">
                You can also email us directly at{" "}
                <a
                  href="mailto:fenadaily@gmail.com"
                  className="font-medium text-amber-300 transition-colors hover:text-amber-200"
                >
                  fenadaily@gmail.com
                </a>
              </p>
            </div>

            {/* Social links */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-zinc-500">
                Also Find Us On
              </p>
              <SocialLinks />
            </div>

            <ContactForm email={null} />
          </div>
        </div>
      </main>
    </>
  );
}
