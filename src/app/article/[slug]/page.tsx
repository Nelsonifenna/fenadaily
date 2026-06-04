import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { ShareSection } from "@/components/ShareSection";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getArticleBySlug, getLatestPosts } from "@/lib/content";

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
      title: article.title,
      description: article.excerpt,
      images: ogImage,
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: [article.category],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: ogImage.map((i) => i.url),
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
            className="mt-8 inline-block rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
          >
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  const latestPosts = await getLatestPosts();
  const related = latestPosts.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
      {/* Two-column on lg+, single column stacked on smaller */}
      <div className="mx-auto max-w-6xl gap-8 px-4 py-6 sm:py-8 lg:grid lg:grid-cols-[1fr_300px] lg:px-8 lg:py-12 xl:grid-cols-[1fr_320px]">

        {/* ── Main article ── */}
        <article className="rounded-2xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-6 md:p-8">
          <div className="relative h-52 w-full overflow-hidden rounded-xl sm:h-64 sm:rounded-2xl md:h-72 md:rounded-[24px]">
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

          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-amber-300">{article.category}</p>
          <h1 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">{article.excerpt}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
            <span className="font-medium">{article.author}</span>
            <span className="text-zinc-600">·</span>
            <span>{article.publishedAt}</span>
            <span className="text-zinc-600">·</span>
            <span>{article.readingTime}</span>
          </div>

          <div className="mt-8 space-y-4 text-zinc-200 [&_img]:max-w-full [&_img]:rounded-xl [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_p]:leading-relaxed [&_a]:text-amber-300 [&_a:hover]:text-amber-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400/50 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-400 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4 [&_code]:text-xs sm:[&_h1]:text-3xl sm:[&_h2]:text-2xl">
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <p>Content not available.</p>
            )}
          </div>

          <ShareSection title={article.title} url={`${SITE_URL}/article/${slug}`} />

        </article>

        {/* ── Sidebar ── */}
        <aside className="mt-6 space-y-6 lg:mt-0 lg:space-y-8">
          {related.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Recommended</p>
              <div className="mt-4 space-y-4">
                {related.map((item) => (
                  <ArticleCard key={item.slug} article={item} />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Author</p>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">{article.author}</h3>
            <p className="mt-2 text-sm text-zinc-300">Published on {article.publishedAt}</p>
          </section>

          <section className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-amber-400/5 to-transparent p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Newsletter</p>
            <h3 className="mt-2 text-base font-semibold text-white">Stay informed. Stay ahead.</h3>
            <p className="mt-1.5 text-sm text-zinc-400">
              Top stories delivered to your inbox — free, no spam.
            </p>
            <NewsletterForm stacked />
          </section>
        </aside>
      </div>
    </main>
  );
}
