import type { Metadata } from "next";
import { getContactPage } from "@/lib/content";

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

          {/* Email CTA */}
          {email && (
            <div className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/10 p-5 sm:rounded-2xl sm:p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Email us</p>
              <a
                href={`mailto:${email}`}
                className="mt-2 block text-lg font-semibold text-white hover:text-amber-300 transition-colors sm:text-xl"
              >
                {email}
              </a>
              <p className="mt-2 text-sm text-zinc-400">
                We reply to all messages within 48 hours.
              </p>
            </div>
          )}

          {/* Contact form */}
          <form
            className="mt-8 space-y-4 sm:space-y-5"
            action={`mailto:${email ?? "fenadaily@gmail.com"}`}
            method="get"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="subject"
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="body"
                rows={5}
                placeholder="Your message..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors sm:w-auto"
            >
              Send message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
