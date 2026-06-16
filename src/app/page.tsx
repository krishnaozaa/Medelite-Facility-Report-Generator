import { BrandHeader } from "@/components/BrandHeader";
import { CcnLookupForm } from "@/components/CcnLookupForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <BrandHeader />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-medelite">
              Report generator
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
              Generate a facility report.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted sm:flex">
            <span className="border border-line bg-white px-3 py-2 shadow-sm">Server-side CMS</span>
            <span className="border border-line bg-white px-3 py-2 shadow-sm">PDF and DOCX</span>
          </div>
        </div>
        <CcnLookupForm />
      </section>
    </main>
  );
}
