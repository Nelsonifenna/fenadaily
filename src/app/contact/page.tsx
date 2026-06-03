import type { Metadata } from "next";
import { getContactPage } from "@/lib/content";
import { ContactForm } from "./ContactForm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";
const DESC = "Get in touch with Fena Daily — for inquiries, collaborations, or suggestions.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    title: "Contact | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Contact+Fena+Daily`, width: 1200, height: 630, alt: "Contact Fena Daily" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Contact+Fena+Daily`],
  },
};

export default async function ContactPage() {
  const page = await getContactPage();

  // Extract email address from WordPress contact page content
  const emailMatch = page?.content?.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const email = emailMatch?.[0] ?? null;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Contact</p>

          {page ? (
            <>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                {page.title}
              </h1>
              <div
                className="mt-6 text-sm leading-relaxed text-zinc-300 sm:mt-8 sm:text-base [&_p]:mb-4 [&_a]:text-amber-300 [&_a:hover]:text-amber-200 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </>
          ) : (
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Contact Fena Daily
            </h1>
          )}

          {/* Contact form — server-action powered, email delivered via Resend */}
          <ContactForm email={email} />
        </div>
      </div>
    </main>
  );
}
