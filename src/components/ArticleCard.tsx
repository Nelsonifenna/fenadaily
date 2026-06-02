import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/content";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex flex-col rounded-3xl border border-white/10 bg-zinc-950/80 p-4 shadow-2xl shadow-black/20 backdrop-blur md:p-5">
      <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-zinc-800/60" />
        )}
      </div>
      <p className="text-xs uppercase tracking-[0.32em] text-amber-300">{article.category}</p>
      <h3 className="mt-2 text-base font-semibold leading-snug text-white sm:text-lg md:text-xl">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-zinc-300">{article.excerpt}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-1 text-xs text-zinc-400">
        <span>{article.author}</span>
        <span>{article.readingTime}</span>
      </div>
      <Link
        href={`/article/${article.slug}`}
        className="mt-4 inline-flex text-sm font-semibold text-amber-200 hover:text-white transition-colors"
      >
        Read story →
      </Link>
    </article>
  );
}
