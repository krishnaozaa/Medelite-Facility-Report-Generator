import { describe, expect, it } from "vitest";

import type { FacilityAssessmentReport } from "@/types/report";

import {
  buildFacilityAssessmentPdfFileName,
  getFacilityAssessmentPdfRows,
  isFacilityAssessmentReportPdfReady,
} from "./pdfExport";

const report = {
  branding: {
    platform: "INFINITE — Managed by MEDELITE",
    title: "FACILITY ASSESSMENT SNAPSHOT",
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
} satisfies FacilityAssessmentReport;

describe("pdfExport helpers", () => {
  it("builds a clean PDF filename", () => {
    expect(buildFacilityAssessmentPdfFileName(report)).toBe("facility-assessment-686123.pdf");
  });

  it("marks the report as ready only when required MVP fields exist", () => {
    expect(isFacilityAssessmentReportPdfReady(report)).toBe(true);
    expect(
      isFacilityAssessmentReportPdfReady({
        ...report,
        operations: {
          ...report.operations,
          currentCensus: "N/A",
        },
      }),
    ).toBe(false);
  });

  it("keeps missing optional metrics out of MVP PDF rows", () => {
    const rows = getFacilityAssessmentPdfRows(report);

    expect(rows.facilityRows).toEqual([
      { label: "Name of Facility", value: "Kendall Lakes Operator LLC" },
      { label: "Location", value: "5280 SW 157th Ave, Miami, FL" },
    ]);
    expect(rows.ratingRows[0]).toEqual({ label: "Overall Star Rating", value: "1" });
    expect(rows).not.toHaveProperty("hospitalizationMetrics");
  });

  it("preserves the Medicare URL in the report model", () => {
    expect(report.facility.medicareUrl).toBe(
      "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
    );
  });
});
