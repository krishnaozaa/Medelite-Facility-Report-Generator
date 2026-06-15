import Image from "next/image";

import { BRAND_LOGO_SRC, REPORT_BRAND_PLATFORM, REPORT_TITLE } from "@/lib/report/branding";

export function BrandHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-6 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Image
            alt={REPORT_BRAND_PLATFORM}
            className="h-auto w-64 max-w-full sm:w-72"
            height={102}
            src={BRAND_LOGO_SRC}
            width={448}
          />
          <p className="sr-only">{REPORT_BRAND_PLATFORM}</p>
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

export { BRAND_LOGO_SRC, REPORT_BRAND_PLATFORM, REPORT_TITLE };
