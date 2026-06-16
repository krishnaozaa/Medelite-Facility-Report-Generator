import type { FacilityProfile } from "@/types/facility";
import { facilityProfileSchema } from "@/lib/validation/facilityProfile";

import { emptyHospitalizationMetrics } from "./hospitalizationMetrics";
import { buildMedicareCareCompareUrl } from "./medicareUrl";

export type CmsProviderInformationRow = Record<string, unknown>;

const fieldAliases = {
  ccn: ["CMS Certification Number (CCN)", "cms_certification_number_ccn", "ccn"],
  providerName: ["Provider Name", "provider_name"],
  legalBusinessName: ["Legal Business Name", "legal_business_name"],
  street: ["Provider Address", "provider_address"],
  city: ["City/Town", "citytown", "city_town", "provider_city"],
  state: ["State", "state", "provider_state"],
  zip: ["ZIP Code", "zip_code", "provider_zip_code"],
  location: ["Location", "location"],
  certifiedBeds: ["Number of Certified Beds", "number_of_certified_beds"],
  averageResidentsPerDay: [
    "Average Number of Residents per Day",
    "average_number_of_residents_per_day",
  ],
  overallRating: ["Overall Rating", "overall_rating"],
  healthInspectionRating: ["Health Inspection Rating", "health_inspection_rating"],
  staffingRating: ["Staffing Rating", "staffing_rating"],
  qmRating: ["QM Rating", "qm_rating"],
} as const;

function readString(row: CmsProviderInformationRow, aliases: readonly string[]) {
  for (const alias of aliases) {
    const value = row[alias];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function readNullableString(row: CmsProviderInformationRow, aliases: readonly string[]) {
  const value = readString(row, aliases);

  return value.length > 0 ? value : null;
}

function readNullableNumber(row: CmsProviderInformationRow, aliases: readonly string[]) {
  const value = readString(row, aliases);

  if (value.length === 0) {
    return null;
  }

  const normalized = value.replaceAll(",", "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function composeAddress(street: string, city: string, state: string, zip: string) {
  const cityStateZip = [city, state].filter(Boolean).join(", ");
  const trailing = [cityStateZip, zip].filter(Boolean).join(" ");

  return [street, trailing].filter(Boolean).join(", ");
}

export function mapCmsProviderRowToFacilityProfile(row: CmsProviderInformationRow): FacilityProfile {
  const ccn = readString(row, fieldAliases.ccn);
  const providerName = readString(row, fieldAliases.providerName);
  const legalBusinessName = readNullableString(row, fieldAliases.legalBusinessName) ?? providerName;
  const street = readString(row, fieldAliases.street);
  const city = readString(row, fieldAliases.city);
  const state = readString(row, fieldAliases.state);
  const zip = readString(row, fieldAliases.zip);
  const location = readString(row, fieldAliases.location);

  const profile = {
    ccn,
    providerName,
    legalBusinessName,
    cmsDisplayName: providerName,
    address: {
      street,
      city,
      state,
      zip,
      full: location.length > 0 ? location : composeAddress(street, city, state, zip),
    },
    certifiedBeds: readNullableNumber(row, fieldAliases.certifiedBeds),
    averageResidentsPerDay: readNullableNumber(row, fieldAliases.averageResidentsPerDay),
    ratings: {
      overall: readNullableNumber(row, fieldAliases.overallRating),
      healthInspection: readNullableNumber(row, fieldAliases.healthInspectionRating),
      staffing: readNullableNumber(row, fieldAliases.staffingRating),
      qualityOfResidentCare: readNullableNumber(row, fieldAliases.qmRating),
    },
    hospitalizationMetrics: emptyHospitalizationMetrics,
    medicareUrl: buildMedicareCareCompareUrl(ccn, state),
  };

  return facilityProfileSchema.parse(profile);
}
