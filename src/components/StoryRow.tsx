import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/content";

export function StoryRow({ article, rank }: { article: Article; rank?: number }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-white/8 bg-zinc-950/70 p-3 transition-all duration-150 hover:border-amber-400/30 hover:bg-zinc-900/80 sm:rounded-2xl sm:p-4"
    >
      {typeof rank === "number" && (
        <span className="w-7 shrink-0 text-center text-xl font-black text-white/15 transition-colors group-hover:text-amber-400/40 sm:text-2xl">
          {rank}
        </span>
      )}
      {article.image ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl sm:h-16 sm:w-16">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="h-14 w-14 shrink-0 rounded-xl bg-zinc-800/60 sm:h-16 sm:w-16" />
      )}
      <div className="min-w-0">
        <span className="text-xs font-medium text-amber-300/80">{article.category}</span>
        <h3 className="mt-0.5 text-sm font-semibold leading-snug text-white line-clamp-2 transition-colors group-hover:text-amber-200">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          {article.publishedAt} · {article.readingTime}
        </p>
      </div>
    </Link>
  );
}
