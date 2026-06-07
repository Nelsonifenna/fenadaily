import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { StoryRow } from "@/components/StoryRow";
import { ShareSection } from "@/components/ShareSection";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import {
  getArticleBySlug,
  getRelatedArticles,
  getMoreFromCategory,
  getLatestPosts,
  categoryToSlug,
} from "@/lib/content";

export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The article you're looking for could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const ogImage = article.image
    ? [{ url: article.image, width: 1200, height: 630, alt: article.title }]
    : [{ url: `/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category)}&type=article`, width: 1200, height: 630, alt: article.title }];

  return {
    title: article.title,
    description: article.excerpt,
    keywords: [article.category, "Fena Daily"],
    alternates: {
      canonical: `${SITE_URL}/article/${slug}`,
    },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/article/${slug}`,
      siteName: "Fena Daily",
      title: article.title,
      description: article.excerpt,
      images: ogImage,
      publishedTime: article.datePublished,   // ISO 8601
      modifiedTime: article.dateModified,     // ISO 8601
      authors: [article.author],
      tags: [article.category],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: ogImage.map((i) => i.url),
      site: "@fenadaily",
      creator: "@fenadaily",
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">Article not found</h1>
          <p className="mt-4 text-zinc-300">The article you&apos;re looking for could not be found.</p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
          >
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  const [related, moreFromCategory, latestPosts] = await Promise.all([
    getRelatedArticles(article, 3),
    getMoreFromCategory(article.category, article.slug, 4),
    getLatestPosts(7),
  ]);

  const usedSlugs = new Set([article.slug, ...related.map((r) => r.slug), ...moreFromCategory.map((r) => r.slug)]);
  const moreStories = latestPosts.filter((p) => !usedSlugs.has(p.slug)).slice(0, 4);

  const catSlug = categoryToSlug(article.category);
  const articleUrl = `${SITE_URL}/article/${slug}`;
  const imageUrl = article.image
    || `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category)}&type=article`;

  // NewsArticle + BreadcrumbList — combined @graph for this page
  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${articleUrl}#article`,
        headline: article.title.slice(0, 110),
        description: article.excerpt,
        url: articleUrl,
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        author: {
          "@type": "Organization",
          name: article.author === "Fena Daily" ? "Fena Daily Editorial Team" : article.author,
          url: `${SITE_URL}/authors`,
        },
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        image: {
          "@type": "ImageObject",
          url: imageUrl,
          width: 1200,
          height: 630,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": articleUrl,
        },
        articleSection: article.category,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",           item: SITE_URL },
          { "@type": "ListItem", position: 2, name: article.category, item: `${SITE_URL}/category/${catSlug}` },
          { "@type": "ListItem", position: 3, name: article.title,    item: articleUrl },
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
      <ReadingProgressBar targetId="article-content" />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-6xl gap-8 px-4 py-6 sm:py-8 lg:grid lg:grid-cols-[1fr_300px] lg:px-8 lg:py-12 xl:grid-cols-[1fr_320px]">

          {/* ── Main article ── */}
          <article id="article-content" className="rounded-2xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-6 md:p-8 lg:p-10">

            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                <li>
                  <Link href="/" className="transition-colors hover:text-zinc-300">Home</Link>
                </li>
                <li aria-hidden className="select-none">›</li>
                <li>
                  <Link
                    href={`/category/${catSlug}`}
                    className="transition-colors hover:text-amber-300"
                  >
                    {article.category}
                  </Link>
                </li>
                <li aria-hidden className="select-none">›</li>
                <li className="line-clamp-1 max-w-[200px] text-zinc-400" aria-current="page">
                  {article.title}
                </li>
              </ol>
            </nav>

            {/* Category badge + meta */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/category/${catSlug}`}
                className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 ring-1 ring-amber-400/25 transition-colors hover:bg-amber-400/25"
              >
                {article.category}
              </Link>
              <span className="text-xs text-zinc-500">
                {article.readingTime}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem]">
              {article.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">{article.excerpt}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-white/10 py-3 text-sm text-zinc-300">
              <span className="font-semibold text-white">{article.author}</span>
              <span className="text-zinc-600">·</span>
              <time dateTime={article.datePublished}>{article.publishedAt}</time>
              <span className="text-zinc-600">·</span>
              <span>{article.readingTime}</span>
            </div>

            {/* Hero image */}
            <div className="relative mt-6 h-60 w-full overflow-hidden rounded-xl sm:h-80 sm:rounded-2xl md:h-[26rem] md:rounded-[24px]">
              {article.image ? (
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-zinc-800/60" />
              )}
            </div>

            <div className="prose-article mt-8 max-w-none text-[1.0625rem] leading-[1.8] text-zinc-200 [&_img]:max-w-full [&_img]:rounded-xl [&_h1]:mt-10 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mt-9 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mt-7 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_p]:mt-5 [&_p]:leading-[1.8] [&_a]:text-amber-300 [&_a:hover]:text-amber-200 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1.5 [&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_pre]:mt-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4 [&_code]:text-sm sm:[&_h1]:text-3xl sm:[&_h2]:text-2xl">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p>Content not available.</p>
              )}
            </div>

            <ShareSection title={article.title} url={articleUrl} />

            {/* More from this category */}
            {moreFromCategory.length > 0 && (
              <section className="mt-12 border-t border-white/10 pt-8">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white sm:text-xl">More from {article.category}</h2>
                  <Link
                    href={`/category/${catSlug}`}
                    className="shrink-0 text-xs font-medium text-zinc-400 transition-colors hover:text-amber-300"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {moreFromCategory.map((item) => (
                    <ArticleCard key={item.slug} article={item} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── Sidebar ── */}
          <aside className="mt-6 space-y-6 lg:mt-0 lg:space-y-8">
            {related.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Related Stories</p>
                <div className="mt-4 flex flex-col gap-3">
                  {related.map((item) => (
                    <StoryRow key={item.slug} article={item} />
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Author</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-sm font-bold text-amber-300">
                  {article.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{article.author}</h3>
                  <p className="text-xs text-zinc-500">
                    Published <time dateTime={article.datePublished}>{article.publishedAt}</time>
                  </p>
                </div>
              </div>
              <Link
                href="/authors"
                className="mt-4 inline-block text-xs font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                About the team →
              </Link>
            </section>

            <section className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-amber-400/5 to-transparent p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Newsletter</p>
              <h3 className="mt-2 text-base font-semibold text-white">Stay informed. Stay ahead.</h3>
              <p className="mt-1.5 text-sm text-zinc-400">
                Top stories delivered to your inbox: free, no spam.
              </p>
              <NewsletterForm stacked />
            </section>
          </aside>
        </div>

        {/* ── More stories ── */}
        {moreStories.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16 lg:px-8">
            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">Keep Reading</span>
              <Link href="/" className="shrink-0 text-xs font-medium text-zinc-400 transition-colors hover:text-amber-300">
                More stories →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {moreStories.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
