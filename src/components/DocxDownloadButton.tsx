"use client";

import { useState } from "react";

import type { FacilityAssessmentReport } from "@/types/report";
import { buildFacilityAssessmentDocxFileName } from "@/lib/report/fileNames";
import { isFacilityAssessmentReportExportReady } from "@/lib/report/reportRows";
import { downloadBlob } from "@/lib/utils/downloadBlob";

type DocxDownloadButtonProps = {
  report: FacilityAssessmentReport;
  isReady?: boolean;
};

export function DocxDownloadButton({ report, isReady: isReadyOverride = true }: DocxDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isReady = isReadyOverride && isFacilityAssessmentReportExportReady(report);
  const isDisabled = !isReady || isGenerating;

  async function handleDownload() {
    if (isDisabled) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { buildFacilityDocx } = await import("@/lib/report/docx/buildFacilityDocx");
      const blob = await buildFacilityDocx(report);
      downloadBlob(blob, buildFacilityAssessmentDocxFileName(report));
    } catch {
      setError("DOCX export failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className="inline-flex min-h-11 items-center justify-center border border-medelite bg-white px-5 text-sm font-semibold text-medelite shadow-sm transition hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-medelite/20 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white sm:min-w-36"
        disabled={isDisabled}
        onClick={handleDownload}
        type="button"
      >
        {isGenerating ? "Preparing DOCX..." : "Download DOCX"}
      </button>
      {error ? (
        <p className="max-w-xs text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
