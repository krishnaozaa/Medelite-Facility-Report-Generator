"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";

import type { FacilityAssessmentReport } from "@/types/report";
import {
  buildFacilityAssessmentPdfFileName,
  isFacilityAssessmentReportPdfReady,
} from "@/lib/report/pdfExport";

import { FacilityAssessmentPdf } from "./FacilityAssessmentPdf";

type PdfDownloadButtonProps = {
  report: FacilityAssessmentReport;
};

export function PdfDownloadButton({ report }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isReady = isFacilityAssessmentReportPdfReady(report);
  const isDisabled = !isReady || isGenerating;

  async function handleDownload() {
    if (isDisabled) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const blob = await pdf(<FacilityAssessmentPdf report={report} />).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = buildFacilityAssessmentPdfFileName(report);
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("PDF export failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className="inline-flex min-h-11 items-center justify-center bg-medelite px-5 text-sm font-semibold text-white shadow-card transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-medelite/20 disabled:cursor-not-allowed disabled:bg-slate-400 sm:min-w-36"
        disabled={isDisabled}
        onClick={handleDownload}
        type="button"
      >
        {isGenerating ? "Preparing PDF..." : "Download PDF"}
      </button>
      {error ? (
        <p className="max-w-xs text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
