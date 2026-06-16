import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { FacilityAssessmentReport } from "@/types/report";

import { DocxDownloadButton } from "./DocxDownloadButton";

const docxMocks = vi.hoisted(() => ({
  buildFacilityDocx: vi.fn().mockResolvedValue(
    new Blob(["docx"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
  ),
}));

vi.mock("@/lib/report/docx/buildFacilityDocx", () => ({
  buildFacilityDocx: docxMocks.buildFacilityDocx,
}));

const readyReport = {
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

describe("DocxDownloadButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    docxMocks.buildFacilityDocx.mockClear();
  });

  it("downloads the generated DOCX with a clean filename", async () => {
    const revokeObjectUrl = vi.fn();
    const createObjectUrl = vi.fn().mockReturnValue("blob:facility-assessment-docx");

    vi.stubGlobal("URL", {
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });

    render(<DocxDownloadButton report={readyReport} />);

    const click = vi.fn();
    const anchor = document.createElement("a");
    const append = vi.spyOn(document.body, "append");
    const remove = vi.spyOn(anchor, "remove");
    vi.spyOn(anchor, "click").mockImplementation(click);
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    fireEvent.click(screen.getByRole("button", { name: "Download DOCX" }));

    await waitFor(() => {
      expect(docxMocks.buildFacilityDocx).toHaveBeenCalledWith(readyReport);
      expect(click).toHaveBeenCalledTimes(1);
    });

    expect(anchor.download).toBe("facility-assessment-686123.docx");
    expect(anchor.href).toBe("blob:facility-assessment-docx");
    expect(append).toHaveBeenCalledWith(anchor);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:facility-assessment-docx");
  });

  it("is disabled until a report has required manual values", () => {
    render(
      <DocxDownloadButton
        report={{
          ...readyReport,
          operations: {
            ...readyReport.operations,
            currentCensus: "N/A",
          },
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Download DOCX" })).toBeDisabled();
  });

  it("shows a safe error when DOCX generation fails", async () => {
    docxMocks.buildFacilityDocx.mockRejectedValueOnce(new Error("DOCX failed"));

    render(<DocxDownloadButton report={readyReport} />);
    fireEvent.click(screen.getByRole("button", { name: "Download DOCX" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "DOCX export failed. Please try again.",
    );
  });
});
