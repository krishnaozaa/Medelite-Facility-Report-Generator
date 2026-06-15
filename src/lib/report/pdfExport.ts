import type { FacilityAssessmentReport } from "@/types/report";

const REQUIRED_PLACEHOLDERS = new Set(["", "N/A"]);

export type PdfFieldRow = {
  label: string;
  value: string;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasRequiredValue(value: string) {
  return !REQUIRED_PLACEHOLDERS.has(value.trim());
}

export function buildFacilityAssessmentPdfFileName(report: FacilityAssessmentReport) {
  const ccn = slugify(report.facility.ccn) || "facility";

  return `facility-assessment-${ccn}.pdf`;
}

export function isFacilityAssessmentReportPdfReady(report: FacilityAssessmentReport) {
  return [
    report.facility.name,
    report.facility.location,
    report.facility.ccn,
    report.facility.medicareUrl,
    report.operations.emr,
    report.operations.censusCapacity,
    report.operations.currentCensus,
    report.operations.patientType,
    report.operations.previousCoverageFromMedelite,
    report.operations.previousProviderPerformance,
    report.operations.medicalCoverage,
  ].every(hasRequiredValue);
}

export function getFacilityAssessmentPdfRows(report: FacilityAssessmentReport) {
  return {
    facilityRows: [
      { label: "Name of Facility", value: report.facility.name },
      { label: "Location", value: report.facility.location },
    ],
    operationRows: [
      { label: "EMR", value: report.operations.emr },
      { label: "Census Capacity", value: report.operations.censusCapacity },
      { label: "Current Census", value: report.operations.currentCensus },
      { label: "Type of Patient", value: report.operations.patientType },
      {
        label: "Previous Coverage from Medelite",
        value: report.operations.previousCoverageFromMedelite,
      },
      {
        label: "Previous Provider Performance from Medelite",
        value: report.operations.previousProviderPerformance,
      },
      { label: "Medical Coverage", value: report.operations.medicalCoverage },
    ],
    ratingRows: [
      { label: "Overall Star Rating", value: report.ratings.overall },
      { label: "Health Inspection", value: report.ratings.healthInspection },
      { label: "Staffing", value: report.ratings.staffing },
      { label: "Quality of Resident Care", value: report.ratings.qualityOfResidentCare },
    ],
  } satisfies {
    facilityRows: PdfFieldRow[];
    operationRows: PdfFieldRow[];
    ratingRows: PdfFieldRow[];
  };
}
