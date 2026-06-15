import { BrandHeader } from "@/components/BrandHeader";

export default function Home() {
  return (
    <main className="min-h-screen">
      <BrandHeader />
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:px-8 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-medelite">
            Report generator
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
            Build a polished facility assessment snapshot from CMS data and operational inputs.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-700 sm:text-lg">
            The foundation is ready for the upcoming CCN lookup, manual inputs, and export workflow.
          </p>
        </div>
      </section>
    </main>
  );
}
