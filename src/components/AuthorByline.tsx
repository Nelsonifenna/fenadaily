import Link from "next/link";

export function AuthorByline({
  authorName,
  authorSlug,
  className = "",
}: {
  authorName: string;
  authorSlug: string;
  className?: string;
}) {
  return (
    <span className={className}>
      Written by{" "}
      <Link
        href={`/author/${authorSlug}`}
        className="font-semibold text-white transition-colors hover:text-amber-300"
      >
        {authorName}
      </Link>
    </span>
  );
}
