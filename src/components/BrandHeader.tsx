import Image from "next/image";

import { BRAND_LOGO_SRC, REPORT_BRAND_PLATFORM, REPORT_TITLE } from "@/lib/report/branding";

export function BrandHeader() {
  return (
    <header className="border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <Image
            alt={REPORT_BRAND_PLATFORM}
            className="h-auto w-56 max-w-full sm:w-64"
            height={102}
            src={BRAND_LOGO_SRC}
            width={448}
          />
          <p className="sr-only">{REPORT_BRAND_PLATFORM}</p>
          <h1 className="mt-3 text-xl font-semibold tracking-normal text-ink sm:text-2xl">
            {REPORT_TITLE}
          </h1>
        </div>
        <div className="flex w-fit items-center gap-2 border border-line bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted shadow-sm">
          <span className="h-2 w-2 rounded-full bg-medelite" aria-hidden="true" />
          CMS-connected workspace
        </div>
      </div>
    </header>
  );
}

export { BRAND_LOGO_SRC, REPORT_BRAND_PLATFORM, REPORT_TITLE };
