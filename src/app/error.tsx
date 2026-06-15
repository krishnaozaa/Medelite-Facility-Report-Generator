"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
          Application error
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Something went wrong.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          The report generator could not finish rendering this view. Retry the page, then run the
          lookup again if needed.
        </p>
        <button
          className="mt-5 inline-flex min-h-11 items-center justify-center bg-infinite px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-infinite focus:ring-offset-2"
          onClick={reset}
          type="button"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
