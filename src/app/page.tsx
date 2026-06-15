import { BrandHeader } from "@/components/BrandHeader";
import { CcnLookupForm } from "@/components/CcnLookupForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <BrandHeader />
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-8 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-medelite">
            Report generator
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
            Look up a facility by CCN to start the assessment snapshot.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-700 sm:text-lg">
            Facility details are loaded from the server-side CMS Provider Information API.
          </p>
        </div>
        <CcnLookupForm />
      </section>
    </main>
  );
}
