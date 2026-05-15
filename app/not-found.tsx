import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white text-black gap-4 px-6">
      <span className="text-[10px] font-nothing tracking-widest text-black/30 uppercase border border-black/10 px-2 py-0.5">
        404
      </span>
      <p className="text-sm text-black/50 max-w-md text-center leading-relaxed">
        Page not found.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-nothing tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
