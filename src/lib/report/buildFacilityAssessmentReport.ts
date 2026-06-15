import type { FacilityProfile } from "@/types/facility";
import type { ManualInputs } from "@/types/manualInputs";
import type { FacilityAssessmentReport } from "@/types/report";

import { buildMedicareCareCompareUrl } from "@/lib/cms/medicareUrl";

import { REPORT_BRAND_PLATFORM, REPORT_TITLE } from "./branding";
import { getReportFacilityName } from "./facilityName";

export { REPORT_BRAND_PLATFORM, REPORT_TITLE } from "./branding";

const EMPTY_PLACEHOLDER = "N/A";
const MISSING_NUMERIC_PLACEHOLDER = "—";

function textOrPlaceholder(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : EMPTY_PLACEHOLDER;
}

function numberOrPlaceholder(value: number | null | undefined) {
  return value === null || value === undefined
    ? MISSING_NUMERIC_PLACEHOLDER
    : new Intl.NumberFormat("en-US").format(value);
}

function ratingOrPlaceholder(value: number | null | undefined) {
  return value === null || value === undefined ? MISSING_NUMERIC_PLACEHOLDER : String(value);
}

export function buildFacilityAssessmentReport(
  facility: FacilityProfile,
  manualInputs: ManualInputs,
): FacilityAssessmentReport {
  const state = textOrPlaceholder(facility.address.state);
  const medicareState = facility.address.state.trim();
  const ccn = textOrPlaceholder(facility.ccn);

  return {
    branding: {
      platform: REPORT_BRAND_PLATFORM,
      title: REPORT_TITLE,
      state,
    },
    facility: {
      name: textOrPlaceholder(getReportFacilityName(facility, manualInputs)),
      location: textOrPlaceholder(facility.address.full),
      ccn,
      medicareUrl: buildMedicareCareCompareUrl(ccn, medicareState),
    },
    operations: {
      emr: textOrPlaceholder(manualInputs.emr),
      censusCapacity: numberOrPlaceholder(facility.certifiedBeds),
      currentCensus: textOrPlaceholder(manualInputs.currentCensus),
      patientType: textOrPlaceholder(manualInputs.typeOfPatient),
      previousCoverageFromMedelite: textOrPlaceholder(manualInputs.previousCoverageFromMedelite),
      previousProviderPerformance: textOrPlaceholder(
        manualInputs.previousProviderPerformanceFromMedelite,
      ),
      medicalCoverage: textOrPlaceholder(manualInputs.medicalCoverage),
    },
    ratings: {
      overall: ratingOrPlaceholder(facility.ratings.overall),
      healthInspection: ratingOrPlaceholder(facility.ratings.healthInspection),
      staffing: ratingOrPlaceholder(facility.ratings.staffing),
      qualityOfResidentCare: ratingOrPlaceholder(facility.ratings.qualityOfResidentCare),
    },
  };
}
