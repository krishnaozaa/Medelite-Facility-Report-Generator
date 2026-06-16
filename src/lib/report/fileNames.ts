import type { FacilityAssessmentReport } from "@/types/report";

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

export function buildFacilityAssessmentDocxFileName(report: FacilityAssessmentReport) {
  const ccn = slugify(report.facility.ccn) || "facility";

  return `facility-assessment-${ccn}.docx`;
}
