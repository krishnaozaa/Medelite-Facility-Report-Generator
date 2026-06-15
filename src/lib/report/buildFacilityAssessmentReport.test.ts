import { describe, expect, it } from "vitest";

import type { FacilityProfile } from "@/types/facility";
import type { ManualInputs } from "@/types/manualInputs";

import {
  buildFacilityAssessmentReport,
  REPORT_BRAND_PLATFORM,
  REPORT_TITLE,
} from "./buildFacilityAssessmentReport";

const facility = {
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
  medicareUrl:
    "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
} satisfies FacilityProfile;

const manualInputs = {
  facilityNameOverride: "",
  emr: "PCC",
  currentCensus: "112",
  typeOfPatient: "Long-term & Short-term",
  previousCoverageFromMedelite: "Yes",
  previousProviderPerformanceFromMedelite: "About 30 patients/day",
  medicalCoverage: "Optometry, PCP, Podiatry",
} satisfies ManualInputs;

describe("buildFacilityAssessmentReport", () => {
  it("maps all MVP fields into the canonical report model", () => {
    expect(buildFacilityAssessmentReport(facility, manualInputs)).toEqual({
      branding: {
        platform: REPORT_BRAND_PLATFORM,
        title: REPORT_TITLE,
        state: "FL",
      },
      facility: {
        name: "Kendall Lakes Operator LLC",
        location: "5280 SW 157th Ave, Miami, FL",
        ccn: "686123",
        medicareUrl:
          "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
      },
      operations: {
        emr: "PCC",
        censusCapacity: "120",
        currentCensus: "112",
        patientType: "Long-term & Short-term",
        previousCoverageFromMedelite: "Yes",
        previousProviderPerformance: "About 30 patients/day",
        medicalCoverage: "Optometry, PCP, Podiatry",
      },
      ratings: {
        overall: "1",
        healthInspection: "1",
        staffing: "2",
        qualityOfResidentCare: "4",
      },
    });
  });

  it("uses safe placeholders for missing CMS and manual values", () => {
    const report = buildFacilityAssessmentReport(
      {
        ...facility,
        address: {
          ...facility.address,
          full: "",
          state: "",
        },
        certifiedBeds: null,
        ratings: {
          overall: null,
          healthInspection: null,
          staffing: null,
          qualityOfResidentCare: null,
        },
      },
      {
        ...manualInputs,
        emr: "",
        currentCensus: "",
        typeOfPatient: "",
        previousCoverageFromMedelite: "",
        previousProviderPerformanceFromMedelite: "",
        medicalCoverage: "",
      },
    );

    expect(report.facility.location).toBe("N/A");
    expect(report.branding.state).toBe("N/A");
    expect(report.facility.medicareUrl).toBe(
      "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=",
    );
    expect(report.operations).toEqual({
      emr: "N/A",
      censusCapacity: "—",
      currentCensus: "N/A",
      patientType: "N/A",
      previousCoverageFromMedelite: "N/A",
      previousProviderPerformance: "N/A",
      medicalCoverage: "N/A",
    });
    expect(report.ratings).toEqual({
      overall: "—",
      healthInspection: "—",
      staffing: "—",
      qualityOfResidentCare: "—",
    });
  });

  it("uses manual facility name override for the report body name", () => {
    const report = buildFacilityAssessmentReport(facility, {
      ...manualInputs,
      facilityNameOverride: "  Manual Facility Display Name  ",
    });

    expect(report.facility.name).toBe("Manual Facility Display Name");
  });

  it("keeps branding static and impossible to derive from facility or manual names", () => {
    const report = buildFacilityAssessmentReport(
      {
        ...facility,
        providerName: "Different Provider",
        legalBusinessName: "Different Legal Name",
      },
      {
        ...manualInputs,
        facilityNameOverride: "Different Manual Name",
      },
    );

    expect(report.branding.platform).toBe("INFINITE — Managed by MEDELITE");
    expect(report.branding.title).toBe("FACILITY ASSESSMENT SNAPSHOT");
  });

  it("builds the Medicare URL from CCN and state", () => {
    expect(buildFacilityAssessmentReport(facility, manualInputs).facility.medicareUrl).toBe(
      "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
    );
  });
});
