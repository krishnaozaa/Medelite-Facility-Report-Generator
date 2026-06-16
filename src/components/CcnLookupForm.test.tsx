import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrandHeader, REPORT_BRAND_PLATFORM } from "./BrandHeader";
import { CcnLookupForm } from "./CcnLookupForm";

vi.mock("@react-pdf/renderer", () => ({
  Document: "Document",
  Image: "Image",
  Link: "Link",
  Page: "Page",
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  Text: "Text",
  View: "View",
  pdf: vi.fn(() => ({
    toBlob: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
  })),
}));

const facilityProfile = {
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
  hospitalizationMetrics: {
    strHospitalization: 18.7,
    strHospitalizationNationalAvg: 21.5,
    strHospitalizationStateAvg: 23.8,
    strEdVisit: 13.9,
    strEdVisitNationalAvg: 11.6,
    strEdVisitStateAvg: 9.3,
    ltHospitalization: 1.86,
    ltHospitalizationNationalAvg: 1.65,
    ltHospitalizationStateAvg: 1.95,
    ltEdVisit: 6.94,
    ltEdVisitNationalAvg: 1.65,
    ltEdVisitStateAvg: 1.21,
  },
  medicareUrl:
    "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
};

function submitLookup(value?: string) {
  if (value !== undefined) {
    fireEvent.change(screen.getByLabelText("CMS Certification Number / CCN"), {
      target: { value },
    });
  }

  fireEvent.click(screen.getByRole("button", { name: "Search" }));
}

function fillRequiredManualInputs() {
  fireEvent.change(screen.getByLabelText("EMR"), { target: { value: "PCC" } });
  fireEvent.change(screen.getByLabelText("Current Census"), { target: { value: "112" } });
  fireEvent.change(screen.getByLabelText("Type of Patient"), {
    target: { value: "Long-term & Short-term" },
  });
  fireEvent.change(screen.getByLabelText("Previous Coverage from Medelite"), {
    target: { value: "Yes" },
  });
  fireEvent.change(screen.getByLabelText("Previous Provider Performance from Medelite"), {
    target: { value: "About 30 patients/day" },
  });
  fireEvent.change(screen.getByLabelText("Medical Coverage"), {
    target: { value: "Optometry, PCP, Podiatry" },
  });
}

describe("CcnLookupForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a validation error for an empty CCN", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<CcnLookupForm />);
    submitLookup();

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a CCN.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a validation error for an invalid CCN", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<CcnLookupForm />);
    submitLookup("123");

    expect(screen.getByRole("alert")).toHaveTextContent("CCN must be exactly 6 characters.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a contextual CCN prompt while the lookup field is focused", () => {
    vi.stubGlobal("fetch", vi.fn());

    render(<CcnLookupForm />);

    const ccnInput = screen.getByLabelText("CMS Certification Number / CCN");
    expect(screen.getByText("Six characters, preserved exactly.")).toBeInTheDocument();

    fireEvent.focus(ccnInput);
    expect(screen.getByText("Please type your 6-character CCN.")).toBeInTheDocument();
  });

  it("shows loading, disables duplicate submit, and renders normalized facility data", async () => {
    let resolveFetch: (response: Response) => void = () => undefined;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(fetchPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(<CcnLookupForm />);
    submitLookup("686123");

    expect(screen.getByRole("status")).toHaveTextContent("Looking up facility data...");
    expect(screen.getByRole("button", { name: "Searching..." })).toBeDisabled();

    fireEvent.submit(screen.getByRole("button", { name: "Searching..." }).closest("form") as HTMLFormElement);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(
      new Response(JSON.stringify(facilityProfile), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(await screen.findByRole("heading", { level: 2, name: "Manual report details" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Kendall Lakes Operator LLC" })).toBeInTheDocument();
    expect(screen.getByText("CCN 686123")).toBeInTheDocument();
    expect(screen.getByText("5280 SW 157th Ave, Miami, FL")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("CMS average suggestion: 99")).toBeInTheDocument();
    expect(screen.getAllByText("Current Census")[1].parentElement).toHaveTextContent("N/A");
    expect(screen.getByText("Overall rating").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("Health inspection").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("Staffing").nextSibling).toHaveTextContent("2");
    expect(screen.getByText("Quality of resident care").nextSibling).toHaveTextContent("4");
    expect(screen.getByText("Short Term Hospitalization").nextSibling).toHaveTextContent("18.7%");
    expect(screen.getByText("LT ED Visits State Avg.").nextSibling).toHaveTextContent("1.21");

    const sourceLink = screen.getByRole("link", { name: "Medicare source" });
    expect(sourceLink).toHaveAttribute("href", facilityProfile.medicareUrl);
    expect(fetchMock).toHaveBeenCalledWith("/api/facility/686123");
  });

  it("keeps the Download PDF button disabled until required manual fields exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(facilityProfile), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<CcnLookupForm />);
    submitLookup("686123");

    const downloadButton = await screen.findByRole("button", { name: "Download PDF" });
    expect(downloadButton).toBeDisabled();

    fillRequiredManualInputs();

    expect(downloadButton).toBeEnabled();
  });

  it("keeps exports disabled when manual inputs are present but invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(facilityProfile), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<CcnLookupForm />);
    submitLookup("686123");

    const pdfButton = await screen.findByRole("button", { name: "Download PDF" });
    const docxButton = screen.getByRole("button", { name: "Download DOCX" });

    fillRequiredManualInputs();
    fireEvent.change(screen.getByLabelText("Current Census"), { target: { value: "-1" } });

    expect(pdfButton).toBeDisabled();
    expect(docxButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Apply details" }));
    expect(screen.getByText("Current Census cannot be negative.")).toBeInTheDocument();
  });

  it("renders manual fields after lookup and validates required values", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(facilityProfile), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<CcnLookupForm />);
    submitLookup("686123");

    expect(await screen.findByLabelText("Facility Name Override")).toBeInTheDocument();
    expect(screen.getByLabelText("EMR")).toBeInTheDocument();
    expect(screen.getByLabelText("Current Census")).toBeInTheDocument();
    expect(screen.getByLabelText("Type of Patient")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous Coverage from Medelite")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous Provider Performance from Medelite")).toBeInTheDocument();
    expect(screen.getByLabelText("Medical Coverage")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Apply details" }));

    expect(screen.getByText("Enter the EMR.")).toBeInTheDocument();
    expect(screen.getByText("Enter the Current Census.")).toBeInTheDocument();
    expect(screen.getByText("Enter the Type of Patient.")).toBeInTheDocument();
    expect(screen.getByText("Select previous Medelite coverage.")).toBeInTheDocument();
    expect(screen.getByText("Enter previous provider performance.")).toBeInTheDocument();
    expect(screen.getByText("Enter medical coverage.")).toBeInTheDocument();
  });

  it("confirms when required manual details are applied", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(facilityProfile), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<CcnLookupForm />);
    submitLookup("686123");

    await screen.findByLabelText("EMR");
    fillRequiredManualInputs();
    fireEvent.click(screen.getByRole("button", { name: "Apply details" }));

    expect(screen.getByText("Details applied to preview.")).toBeInTheDocument();
  });

  it("keeps Current Census editable after prefilling from CMS average residents", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(facilityProfile), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<CcnLookupForm />);
    submitLookup("686123");

    const currentCensus = await screen.findByLabelText("Current Census");
    expect(currentCensus).toHaveValue(null);
    expect(screen.getByText("CMS average suggestion: 99")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Prefill" }));
    expect(currentCensus).toHaveValue(99);

    fireEvent.change(currentCensus, { target: { value: "112" } });
    expect(currentCensus).toHaveValue(112);
    expect(screen.getAllByText("Current Census")[1].parentElement).toHaveTextContent("112");
  });

  it("uses facility name override in report body preview without changing branding", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(facilityProfile), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(
      <>
        <BrandHeader />
        <CcnLookupForm />
      </>,
    );
    submitLookup("686123");

    expect(await screen.findByRole("heading", { level: 2, name: "Kendall Lakes Operator LLC" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Facility Name Override"), {
      target: { value: "Manual Facility Display Name" },
    });

    expect(
      screen.getByRole("heading", { level: 2, name: "Manual Facility Display Name" }),
    ).toBeInTheDocument();
    expect(screen.getByText(REPORT_BRAND_PLATFORM)).toBeInTheDocument();
  });

  it("shows a clean not-found state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "FACILITY_NOT_FOUND",
              message: "No facility was found for the supplied CCN.",
            },
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    render(<CcnLookupForm />);
    submitLookup("686123");

    expect(await screen.findByText("No facility was found for that CCN.")).toBeInTheDocument();
  });

  it("shows a retryable API error state", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "CMS_LOOKUP_FAILED",
            message: "CMS provider lookup failed.",
          },
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<CcnLookupForm />);
    submitLookup("686123");

    expect(await screen.findByRole("alert")).toHaveTextContent("Facility lookup failed.");
    expect(screen.getByRole("alert")).toHaveTextContent("CMS provider lookup failed.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
