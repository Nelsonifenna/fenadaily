import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel = "View all",
}: {
  eyebrow: string;
  title?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">
          {eyebrow}
        </span>
        {title && (
          <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
        )}
      </div>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-xs font-medium text-zinc-400 transition-colors hover:text-amber-300"
        >
          {hrefLabel} →
        </Link>
      ) : (
        <span className="hidden h-px flex-1 bg-white/10 sm:block sm:max-w-[60%]" />
      )}
    </div>
  );
}
