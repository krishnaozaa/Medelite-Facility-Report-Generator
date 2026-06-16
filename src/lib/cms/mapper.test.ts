import { describe, expect, it } from "vitest";

import { emptyHospitalizationMetrics } from "./hospitalizationMetrics";
import { mapCmsProviderRowToFacilityProfile } from "./mapper";

describe("mapCmsProviderRowToFacilityProfile", () => {
  it("maps CMS display-name fields into a normalized facility profile", () => {
    const profile = mapCmsProviderRowToFacilityProfile({
      "CMS Certification Number (CCN)": "686123",
      "Provider Name": "Kendall Lakes Healthcare and Rehab Center",
      "Legal Business Name": "Kendall Lakes Operator LLC",
      "Provider Address": "5280 SW 157th Ave",
      "City/Town": "Miami",
      State: "FL",
      "ZIP Code": "33185",
      Location: "5280 SW 157th Ave, Miami, FL",
      "Number of Certified Beds": "120",
      "Average Number of Residents per Day": "98.7",
      "Overall Rating": "1",
      "Health Inspection Rating": "1",
      "Staffing Rating": "2",
      "QM Rating": "4",
    });

    expect(profile).toEqual({
      ccn: "686123",
      providerName: "Kendall Lakes Healthcare and Rehab Center",
      legalBusinessName: "Kendall Lakes Operator LLC",
      cmsDisplayName: "Kendall Lakes Healthcare and Rehab Center",
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
      hospitalizationMetrics: emptyHospitalizationMetrics,
      medicareUrl:
        "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
    });
  });

  it("supports machine-style fields, fallback address composition, missing ratings, and leading-zero CCNs", () => {
    const profile = mapCmsProviderRowToFacilityProfile({
      cms_certification_number_ccn: "012345",
      provider_name: "Sample Care Center",
      provider_address: "100 Main St",
      citytown: "Albany",
      state: "NY",
      zip_code: "12207",
      number_of_certified_beds: "80",
      average_number_of_residents_per_day: "",
    });

    expect(profile.ccn).toBe("012345");
    expect(profile.legalBusinessName).toBe("Sample Care Center");
    expect(profile.address.full).toBe("100 Main St, Albany, NY 12207");
    expect(profile.averageResidentsPerDay).toBeNull();
    expect(profile.ratings).toEqual({
      overall: null,
      healthInspection: null,
      staffing: null,
      qualityOfResidentCare: null,
    });
  });

  it("normalizes comma spacing in CMS Location display values", () => {
    const profile = mapCmsProviderRowToFacilityProfile({
      cms_certification_number_ccn: "686123",
      provider_name: "Kendall Lakes Healthcare and Rehab Center",
      provider_address: "5280 SW 157 AVENUE",
      citytown: "MIAMI",
      state: "FL",
      zip_code: "33185",
      location: "5280 SW 157 AVENUE,MIAMI,FL,33185",
    });

    expect(profile.address.full).toBe("5280 SW 157 AVENUE, MIAMI, FL, 33185");
  });

  it("keeps sparse CMS address and bed fields safe for downstream placeholders", () => {
    const profile = mapCmsProviderRowToFacilityProfile({
      cms_certification_number_ccn: "123456",
      provider_name: "Sparse Facility",
      state: "",
    });

    expect(profile.address).toEqual({
      street: "",
      city: "",
      state: "",
      zip: "",
      full: "",
    });
    expect(profile.certifiedBeds).toBeNull();
    expect(profile.ratings).toEqual({
      overall: null,
      healthInspection: null,
      staffing: null,
      qualityOfResidentCare: null,
    });
  });
});
