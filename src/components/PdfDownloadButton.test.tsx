import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { FacilityAssessmentReport } from "@/types/report";

import { PdfDownloadButton } from "./PdfDownloadButton";

const pdfMocks = vi.hoisted(() => {
  const toBlobMock = vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
  const pdfMock = vi.fn(() => ({
    toBlob: toBlobMock,
  }));

  return {
    pdfMock,
    toBlobMock,
  };
});

vi.mock("@react-pdf/renderer", () => ({
  Document: "Document",
  Link: "Link",
  Page: "Page",
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  Text: "Text",
  View: "View",
  pdf: pdfMocks.pdfMock,
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

describe("PdfDownloadButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    pdfMocks.pdfMock.mockClear();
    pdfMocks.toBlobMock.mockClear();
  });

  it("downloads the generated PDF with a clean filename", async () => {
    const revokeObjectUrl = vi.fn();
    const createObjectUrl = vi.fn().mockReturnValue("blob:facility-assessment");

    vi.stubGlobal("URL", {
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });

    render(<PdfDownloadButton report={readyReport} />);

    const click = vi.fn();
    const anchor = document.createElement("a");
    const append = vi.spyOn(document.body, "append");
    const remove = vi.spyOn(anchor, "remove");
    vi.spyOn(anchor, "click").mockImplementation(click);
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    await waitFor(() => {
      expect(pdfMocks.pdfMock).toHaveBeenCalledTimes(1);
      expect(pdfMocks.toBlobMock).toHaveBeenCalledTimes(1);
      expect(click).toHaveBeenCalledTimes(1);
    });

    expect(anchor.download).toBe("facility-assessment-686123.pdf");
    expect(anchor.href).toBe("blob:facility-assessment");
    expect(append).toHaveBeenCalledWith(anchor);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:facility-assessment");
  });

  it("is disabled for incomplete report data", () => {
    render(
      <PdfDownloadButton
        report={{
          ...readyReport,
          operations: {
            ...readyReport.operations,
            currentCensus: "N/A",
          },
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Download PDF" })).toBeDisabled();
  });

  it("shows a safe error when PDF generation fails", async () => {
    pdfMocks.pdfMock.mockReturnValueOnce({
      toBlob: vi.fn().mockRejectedValue(new Error("PDF failed")),
    });

    render(<PdfDownloadButton report={readyReport} />);
    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "PDF export failed. Please try again.",
    );
  });
});
