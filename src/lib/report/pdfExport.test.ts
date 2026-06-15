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

  it("builds one ordered reference snapshot table for MVP rows", () => {
    const rows = getFacilityAssessmentPdfRows(report);

    expect(rows).toEqual([
      { label: "Name of Facility", value: "Kendall Lakes Operator LLC" },
      { label: "Location", value: "5280 SW 157th Ave, Miami, FL" },
      { label: "EMR", value: "PCC" },
      { label: "Census Capacity", value: "120" },
      { label: "Current Census", value: "112" },
      { label: "Type of Patient", value: "Long-term & Short-term" },
      { label: "Previous Coverage from Medelite", value: "Yes" },
      {
        label: "Previous Provider Performance from Medelite",
        value: "About 30 patients/day",
      },
      { label: "Medical Coverage", value: "Optometry, PCP, Podiatry" },
      { label: "Overall Star Rating", value: "1" },
      { label: "Health Inspection", value: "1" },
      { label: "Staffing", value: "2" },
      { label: "Quality of Resident Care", value: "4" },
    ]);
  });

  it("adds hospitalization rows only when optional metrics are present", () => {
    const rows = getFacilityAssessmentPdfRows({
      ...report,
      hospitalizationMetrics: {
        strHospitalization: "18.7%",
        strHospitalizationNationalAvg: "21.5%",
        strHospitalizationStateAvg: "23.8%",
        strEdVisit: "13.9%",
        strEdVisitNationalAvg: "11.6%",
        strEdVisitStateAvg: "9.3%",
        ltHospitalization: "1.86",
        ltHospitalizationNationalAvg: "1.65",
        ltHospitalizationStateAvg: "1.95",
        ltEdVisit: "6.94",
        ltEdVisitNationalAvg: "1.65",
        ltEdVisitStateAvg: "1.21",
      },
    });

    expect(rows).toHaveLength(25);
    expect(rows.slice(-12)).toEqual([
      { label: "Short Term Hospitalization", value: "18.7%" },
      { label: "STR National Avg. for Hospitalization", value: "21.5%" },
      { label: "STR State National Avg. for Hospitalization", value: "23.8%" },
      { label: "STR ED Visit", value: "13.9%" },
      { label: "STR ED Visits National Avg.", value: "11.6%" },
      { label: "STR ED Visits State Avg.", value: "9.3%" },
      { label: "LT Hospitalization", value: "1.86" },
      { label: "LT National Avg. for Hospitalization", value: "1.65" },
      { label: "LT State National Avg. for Hospitalization", value: "1.95" },
      { label: "ED Visit", value: "6.94" },
      { label: "LT ED Visits National Avg.", value: "1.65" },
      { label: "LT ED Visits State Avg.", value: "1.21" },
    ]);
  });

  it("preserves the Medicare URL in the report model", () => {
    expect(report.facility.medicareUrl).toBe(
      "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
    );
  });
});
