import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AUTHORS, getAuthorBySlug, getAuthorXHandle, authorPhotoExists } from "@/lib/authors";
import { getArticlesByAuthor, categoryToSlug } from "@/lib/content";
import { CATEGORIES } from "@/lib/categories";
import { ArticleCard } from "@/components/ArticleCard";
import { AuthorSocialLinks } from "@/components/AuthorSocialLinks";

export const revalidate = 900;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";

type Params = { slug: string };

export function generateStaticParams() {
  return AUTHORS.map(({ slug }) => ({ slug }));
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Author Not Found", robots: { index: false, follow: false } };

  const description = `${author.name}, ${author.jobTitle} at Fena Daily. ${author.bio.slice(0, 140).trim()}…`;
  const authorUrl = `${SITE_URL}/author/${slug}`;
  const hasPhoto = authorPhotoExists(author);
  const ogImage = hasPhoto
    ? { url: author.photo, width: 800, height: 800, alt: author.name }
    : { url: `/api/og?title=${encodeURIComponent(author.name)}&category=${encodeURIComponent(author.jobTitle)}&type=article`, width: 1200, height: 630, alt: author.name };

  return {
    title: `${author.name} — ${author.jobTitle}`,
    description,
    alternates: { canonical: authorUrl },
    openGraph: {
      type: "profile",
      url: authorUrl,
      title: `${author.name} | Fena Daily`,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} | Fena Daily`,
      description,
      images: [ogImage.url],
      creator: getAuthorXHandle(author),
    },
  };
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) {
    notFound();
  }

  const articles = await getArticlesByAuthor(slug, 100);
  const authorUrl = `${SITE_URL}/author/${slug}`;
  const hasPhoto = authorPhotoExists(author);

  const categoriesCovered = Array.from(new Set(articles.map((a) => a.category)));
  const latestArticle = articles[0];
  const earliestArticle = articles[articles.length - 1];
  const yearsWriting = earliestArticle
    ? Math.max(1, new Date().getFullYear() - new Date(earliestArticle.datePublished).getFullYear() + 1)
    : 1;

  const latestSix = articles.slice(0, 6);
  const remaining = articles.slice(6);

  const stats = [
    { label: "Articles Published", value: String(articles.length) },
    { label: "Categories Covered", value: String(categoriesCovered.length) },
    { label: "Latest Article", value: latestArticle?.publishedAt ?? "—" },
    { label: "Years Writing", value: `${yearsWriting}+` },
  ];

  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${authorUrl}#person`,
        name: author.name,
        jobTitle: author.jobTitle,
        description: author.bio,
        url: authorUrl,
        email: author.email,
        ...(hasPhoto ? { image: `${SITE_URL}${author.photo}` } : {}),
        sameAs: author.social.filter((s) => s.icon !== "email").map((s) => s.href),
        worksFor: { "@id": `${SITE_URL}/#organization` },
        knowsAbout: categoriesCovered,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Authors", item: `${SITE_URL}/authors` },
          { "@type": "ListItem", position: 3, name: author.name, item: authorUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 lg:px-8">

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              <li><Link href="/" className="transition-colors hover:text-zinc-300">Home</Link></li>
              <li aria-hidden className="select-none">›</li>
              <li><Link href="/authors" className="transition-colors hover:text-zinc-300">Authors</Link></li>
              <li aria-hidden className="select-none">›</li>
              <li className="text-zinc-400" aria-current="page">{author.name}</li>
            </ol>
          </nav>

          {/* ── Hero ── */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              {hasPhoto ? (
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 sm:h-32 sm:w-32">
                  <Image
                    src={author.photo}
                    alt={author.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 to-amber-400/5 text-4xl font-bold text-amber-300 ring-1 ring-amber-400/20 sm:h-32 sm:w-32">
                  {initials(author.name)}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.4em] text-amber-300">{author.jobTitle}</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                  {author.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  {author.bio}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <AuthorSocialLinks links={author.social} authorName={author.name} />
                  <span className="h-6 w-px bg-white/10" aria-hidden />
                  <Link
                    href="#articles"
                    className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
                  >
                    View Articles
                  </Link>
                  <a
                    href={`mailto:${author.email}`}
                    className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/40 hover:text-white"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4 sm:gap-4">
              {stats.map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-center">
                  <p className="text-xl font-bold text-white sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>

            {/* Editorial coverage badges */}
            {categoriesCovered.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Editorial Coverage
                </p>
                <div className="flex flex-wrap gap-2">
                  {categoriesCovered.map((cat) => {
                    const known = CATEGORIES.find((c) => c.label === cat);
                    return (
                      <Link
                        key={cat}
                        href={`/category/${known?.slug ?? categoryToSlug(cat)}`}
                        className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-200"
                      >
                        {cat}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── About ── */}
          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
            <h2 className="text-xl font-bold text-white sm:text-2xl">About {author.name}</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <p>{author.bio}</p>
              <p>
                At Fena Daily, {author.name.split(" ")[0]} researches and writes across artificial intelligence,
                business, technology, Web3, finance, consumer technology, digital innovation, cryptocurrency,
                software, and the emerging trends and global news shaping how people work and live. Every
                article is grounded in research and written to be genuinely useful, not just topical.
              </p>
            </div>
          </section>

          {/* ── Latest Articles ── */}
          {latestSix.length > 0 && (
            <section id="articles" className="mt-8 scroll-mt-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white sm:text-xl">Latest Articles</h2>
                <span className="text-xs text-zinc-500">{articles.length} total</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {latestSix.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* ── All other published articles ── */}
          {remaining.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">More from {author.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {remaining.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          )}

          {articles.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-12 text-center sm:rounded-[28px] sm:px-8 sm:py-16">
              <p className="text-3xl">✦</p>
              <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">No articles published yet</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">Check back soon.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
