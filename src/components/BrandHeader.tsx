const BRAND_TEXT = "INFINITE — Managed by MEDELITE";
const REPORT_TITLE = "FACILITY ASSESSMENT SNAPSHOT";

export function BrandHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-6 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-lg font-bold tracking-normal text-infinite sm:text-xl">{BRAND_TEXT}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink sm:text-3xl">
            {REPORT_TITLE}
          </h1>
        </div>
        <p className="max-w-xs text-sm leading-6 text-slate-600">
          A focused workspace for facility assessment reporting.
        </p>
      </div>
    </header>
  );
}

export { BRAND_TEXT, REPORT_TITLE };
