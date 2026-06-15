import type { FacilityProfile } from "@/types/facility";
import type { ManualInputs } from "@/types/manualInputs";

export function getCmsFacilityName(facility: FacilityProfile) {
  return facility.legalBusinessName || facility.providerName;
}

export function getReportFacilityName(facility: FacilityProfile, manual: Pick<ManualInputs, "facilityNameOverride">) {
  const override = manual.facilityNameOverride.trim();

  return override.length > 0 ? override : getCmsFacilityName(facility);
}
