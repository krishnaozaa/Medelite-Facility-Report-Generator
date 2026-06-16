import type { FacilityAssessmentReport } from "@/types/report";
import {
  getFacilityAssessmentReportRows,
  isFacilityAssessmentReportExportReady,
  type ReportFieldRow,
} from "@/lib/report/reportRows";
export { buildFacilityAssessmentPdfFileName } from "./fileNames";

export type PdfFieldRow = ReportFieldRow;

export function isFacilityAssessmentReportPdfReady(report: FacilityAssessmentReport) {
  return isFacilityAssessmentReportExportReady(report);
}

export function getFacilityAssessmentPdfRows(report: FacilityAssessmentReport) {
  return getFacilityAssessmentReportRows(report);
}
