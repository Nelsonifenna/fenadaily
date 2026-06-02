import type { Metadata } from "next";
import { getAboutPage } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";
const DESC = "About Fena Daily — independent coverage of AI, Football, Crypto, Business, and everyday insights.";

export const metadata: Metadata = {
  title: "About",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: "About | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=About+Fena+Daily`, width: 1200, height: 630, alt: "About Fena Daily" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Fena Daily",
    description: DESC,
    images: [`/api/og?title=About+Fena+Daily`],
  },
};

export default async function AboutPage() {
  const page = await getAboutPage();

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">About</p>

          {page ? (
            <>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                {page.title}
              </h1>
              <div
                className="mt-6 text-sm leading-relaxed text-zinc-300 sm:mt-8 sm:text-base [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_p]:mb-4 [&_a]:text-amber-300 [&_a:hover]:text-amber-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </>
          ) : (
            <>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                About Fena Daily
              </h1>
              <p className="mt-6 text-zinc-400">
                Content is loading. Please check back shortly.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
