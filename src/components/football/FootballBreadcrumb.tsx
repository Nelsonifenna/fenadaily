import Link from "next/link";

export function FootballBreadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="select-none">›</span>}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-zinc-300">
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-400" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
