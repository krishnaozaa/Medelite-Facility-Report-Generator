export const PREVIOUS_COVERAGE_OPTIONS = ["Yes", "No"] as const;

export type PreviousCoverageFromMedelite = (typeof PREVIOUS_COVERAGE_OPTIONS)[number];

export type ManualInputs = {
  facilityNameOverride: string;
  emr: string;
  currentCensus: string;
  typeOfPatient: string;
  previousCoverageFromMedelite: "" | PreviousCoverageFromMedelite;
  previousProviderPerformanceFromMedelite: string;
  medicalCoverage: string;
};

export const emptyManualInputs: ManualInputs = {
  facilityNameOverride: "",
  emr: "",
  currentCensus: "",
  typeOfPatient: "",
  previousCoverageFromMedelite: "",
  previousProviderPerformanceFromMedelite: "",
  medicalCoverage: "",
};
