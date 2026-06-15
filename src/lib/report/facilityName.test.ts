import { describe, expect, it } from "vitest";

import type { FacilityProfile } from "@/types/facility";

import { getReportFacilityName } from "./facilityName";

const facility = {
  ccn: "686123",
  providerName: "Provider Name",
  legalBusinessName: "Legal Business Name",
  cmsDisplayName: "Provider Name",
  address: {
    street: "5280 SW 157th Ave",
    city: "Miami",
    state: "FL",
    zip: "33185",
    full: "5280 SW 157th Ave, Miami, FL",
  },
  certifiedBeds: 120,
  averageResidentsPerDay: 98.7,
  ratings: {
    overall: 1,
    healthInspection: 1,
    staffing: 2,
    qualityOfResidentCare: 4,
  },
  medicareUrl:
    "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
} satisfies FacilityProfile;

describe("getReportFacilityName", () => {
  it("uses the CMS legal business name when no override is provided", () => {
    expect(getReportFacilityName(facility, { facilityNameOverride: "" })).toBe(
      "Legal Business Name",
    );
  });

  it("falls back to provider name when CMS legal business name is unavailable", () => {
    expect(
      getReportFacilityName(
        {
          ...facility,
          legalBusinessName: null,
        },
        { facilityNameOverride: "" },
      ),
    ).toBe("Provider Name");
  });

  it("uses trimmed manual override text when provided", () => {
    expect(getReportFacilityName(facility, { facilityNameOverride: "  Manual Facility Name  " })).toBe(
      "Manual Facility Name",
    );
  });
});
