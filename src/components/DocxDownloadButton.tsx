"use client";

import { useState } from "react";

import type { FacilityAssessmentReport } from "@/types/report";
import { buildFacilityAssessmentPdfFileName } from "@/lib/report/pdfExport";
import { isFacilityAssessmentReportExportReady } from "@/lib/report/reportRows";

type DocxDownloadButtonProps = {
  report: FacilityAssessmentReport;
};

export function DocxDownloadButton({ report }: DocxDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isReady = isFacilityAssessmentReportExportReady(report);
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
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = buildFacilityAssessmentPdfFileName(report).replace(/\.pdf$/, ".docx");
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("DOCX export failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        className="inline-flex min-h-11 items-center justify-center border border-medelite px-5 text-sm font-semibold text-medelite transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-medelite focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent"
        disabled={isDisabled}
        onClick={handleDownload}
        type="button"
      >
        {isGenerating ? "Preparing DOCX..." : "Download DOCX"}
      </button>
      {!isReady ? (
        <p className="max-w-xs text-sm text-slate-600">
          Complete the required manual inputs to enable DOCX export.
        </p>
      ) : null}
      {error ? (
        <p className="max-w-xs text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
