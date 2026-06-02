import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-300">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
        >
          Back to Fena Daily
        </Link>
      </div>
    </main>
  );
}
