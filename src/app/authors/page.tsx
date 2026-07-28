import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AUTHORS, authorPhotoExists } from "@/lib/authors";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";
const DESC =
  "Meet the writers behind Fena Daily's coverage of AI, business, technology, Web3, finance, and digital innovation.";

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
  "@type": "CollectionPage",
  name: "Fena Daily Authors",
  description: DESC,
  url: `${SITE_URL}/authors`,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: AUTHORS.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/author/${a.slug}`,
      name: a.name,
    })),
  },
};

function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function AuthorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Authors</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Our Authors
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Every article on Fena Daily is researched, written, and reviewed by a named writer — never
            published anonymously. Meet the people behind our coverage below.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {AUTHORS.map((author) => {
              const hasPhoto = authorPhotoExists(author);
              return (
                <Link
                  key={author.slug}
                  href={`/author/${author.slug}`}
                  className="group flex items-start gap-5 rounded-2xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/30 transition-colors hover:border-amber-400/25 sm:p-6"
                >
                  {hasPhoto ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 sm:h-20 sm:w-20">
                      <Image src={author.photo} alt={author.name} fill sizes="80px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 to-amber-400/5 text-2xl font-bold text-amber-300 ring-1 ring-amber-400/20 sm:h-20 sm:w-20 sm:text-3xl">
                      {initials(author.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white transition-colors group-hover:text-amber-200 sm:text-lg">
                      {author.name}
                    </p>
                    <p className="mt-0.5 text-xs text-amber-300">{author.jobTitle}</p>
                    <p className="mt-2 line-clamp-3 max-w-md text-sm text-zinc-400">{author.bio}</p>
                    <span className="mt-3 inline-block text-xs font-medium text-amber-400 transition-colors group-hover:text-amber-300">
                      View profile →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 sm:px-6 sm:py-5">
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
      </main>
    </>
  );
}
