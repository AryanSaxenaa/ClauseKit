"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white text-black gap-4 px-6">
      <span className="text-[10px] font-nothing tracking-widest text-red-600 uppercase border border-red-200 bg-red-50 px-2 py-0.5">
        Error
      </span>
      <p className="text-sm text-black/50 max-w-md text-center leading-relaxed">
        Something went wrong. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-nothing tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
