import JSZip from "jszip";
import { Packer } from "docx";
import { describe, expect, it } from "vitest";

import type { FacilityAssessmentReport } from "@/types/report";

import {
  buildFacilityAssessmentDocxFileName,
  buildFacilityDocx,
  buildFacilityDocxDocument,
  isFacilityAssessmentReportDocxReady,
} from "./buildFacilityDocx";

const completeReport = {
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
} satisfies FacilityAssessmentReport;

async function readDocxXml(report: FacilityAssessmentReport) {
  const zip = await JSZip.loadAsync(await Packer.toBuffer(buildFacilityDocxDocument(report)));
  const documentXml = await zip.file("word/document.xml")?.async("string");
  const relationshipsXml = await zip.file("word/_rels/document.xml.rels")?.async("string");

  return {
    documentXml: documentXml ?? "",
    relationshipsXml: relationshipsXml ?? "",
  };
}

describe("buildFacilityDocx", () => {
  it("builds a DOCX from a complete canonical report object", async () => {
    const blob = await buildFacilityDocx(completeReport);
    const { documentXml, relationshipsXml } = await readDocxXml(completeReport);

    expect(blob.size).toBeGreaterThan(1000);
    expect(documentXml).toContain("FACILITY ASSESSMENT SNAPSHOT");
    expect(documentXml).toContain("Kendall Lakes Operator LLC");
    expect(documentXml).toContain("Short Term Hospitalization");
    expect(relationshipsXml).toContain(completeReport.facility.medicareUrl.replace(/&/g, "&amp;"));
  });

  it("builds a DOCX when optional hospitalization metrics are missing", async () => {
    const blob = await buildFacilityDocx({
      ...completeReport,
      hospitalizationMetrics: undefined,
    });
    const { documentXml } = await readDocxXml({
      ...completeReport,
      hospitalizationMetrics: undefined,
    });

    expect(blob.size).toBeGreaterThan(1000);
    expect(documentXml).toContain("Quality of Resident Care");
    expect(documentXml).not.toContain("Short Term Hospitalization");
  });

  it("keeps brand text static and separate from the facility name", async () => {
    const { documentXml } = await readDocxXml({
      ...completeReport,
      facility: {
        ...completeReport.facility,
        name: "INFINITE should not come from facility data",
      },
    });

    expect(documentXml).toContain("INFINITE — Managed by MEDELITE");
    expect(documentXml).toContain("INFINITE should not come from facility data");
  });

  it("exposes filename and readiness helpers for the download button", () => {
    expect(buildFacilityAssessmentDocxFileName(completeReport)).toBe(
      "facility-assessment-686123.docx",
    );
    expect(isFacilityAssessmentReportDocxReady(completeReport)).toBe(true);
    expect(
      isFacilityAssessmentReportDocxReady({
        ...completeReport,
        operations: {
          ...completeReport.operations,
          currentCensus: "N/A",
        },
      }),
    ).toBe(false);
    expect(buildFacilityDocxDocument(completeReport)).toBeDefined();
  });
});
