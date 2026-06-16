import type { FacilityAssessmentReport } from "@/types/report";

const REQUIRED_PLACEHOLDERS = new Set(["", "N/A"]);

export type ReportFieldRow = {
  label: string;
  value: string;
};

function hasRequiredValue(value: string) {
  return !REQUIRED_PLACEHOLDERS.has(value.trim());
}

export function isFacilityAssessmentReportExportReady(report: FacilityAssessmentReport) {
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

export function getFacilityAssessmentReportRows(report: FacilityAssessmentReport) {
  const rows: ReportFieldRow[] = [
    { label: "Name of Facility", value: report.facility.name },
    { label: "Location", value: report.facility.location },
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
    { label: "Overall Star Rating", value: report.ratings.overall },
    { label: "Health Inspection", value: report.ratings.healthInspection },
    { label: "Staffing", value: report.ratings.staffing },
    { label: "Quality of Resident Care", value: report.ratings.qualityOfResidentCare },
  ];

  if (report.hospitalizationMetrics) {
    rows.push(
      {
        label: "Short Term Hospitalization",
        value: report.hospitalizationMetrics.strHospitalization,
      },
      {
        label: "STR National Avg. for Hospitalization",
        value: report.hospitalizationMetrics.strHospitalizationNationalAvg,
      },
      {
        label: "STR State National Avg. for Hospitalization",
        value: report.hospitalizationMetrics.strHospitalizationStateAvg,
      },
      { label: "STR ED Visit", value: report.hospitalizationMetrics.strEdVisit },
      {
        label: "STR ED Visits National Avg.",
        value: report.hospitalizationMetrics.strEdVisitNationalAvg,
      },
      { label: "STR ED Visits State Avg.", value: report.hospitalizationMetrics.strEdVisitStateAvg },
      { label: "LT Hospitalization", value: report.hospitalizationMetrics.ltHospitalization },
      {
        label: "LT National Avg. for Hospitalization",
        value: report.hospitalizationMetrics.ltHospitalizationNationalAvg,
      },
      {
        label: "LT State National Avg. for Hospitalization",
        value: report.hospitalizationMetrics.ltHospitalizationStateAvg,
      },
      { label: "ED Visit", value: report.hospitalizationMetrics.ltEdVisit },
      {
        label: "LT ED Visits National Avg.",
        value: report.hospitalizationMetrics.ltEdVisitNationalAvg,
      },
      { label: "LT ED Visits State Avg.", value: report.hospitalizationMetrics.ltEdVisitStateAvg },
    );
  }

  return rows;
}
