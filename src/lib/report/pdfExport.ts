import type { FacilityAssessmentReport } from "@/types/report";
import {
  getFacilityAssessmentReportRows,
  isFacilityAssessmentReportExportReady,
  type ReportFieldRow,
} from "@/lib/report/reportRows";

export type PdfFieldRow = ReportFieldRow;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildFacilityAssessmentPdfFileName(report: FacilityAssessmentReport) {
  const ccn = slugify(report.facility.ccn) || "facility";

  return `facility-assessment-${ccn}.pdf`;
}

export function isFacilityAssessmentReportPdfReady(report: FacilityAssessmentReport) {
  return isFacilityAssessmentReportExportReady(report);
}

export function getFacilityAssessmentPdfRows(report: FacilityAssessmentReport) {
  return getFacilityAssessmentReportRows(report);
}
