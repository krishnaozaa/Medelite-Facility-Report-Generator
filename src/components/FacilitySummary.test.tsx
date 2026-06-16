import { render, screen, within } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import type { FacilityAssessmentReport } from "@/types/report";

import { FacilitySummary } from "./FacilitySummary";

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

describe("FacilitySummary", () => {
  it("renders responsive facility and manual operations cards", () => {
    render(<FacilitySummary report={report} />);

    expect(screen.getByRole("heading", { name: "Kendall Lakes Operator LLC" })).toBeInTheDocument();
    expect(screen.getByText("Facility summary")).toBeInTheDocument();
    expect(screen.getByText("Manual operations")).toBeInTheDocument();
    expect(screen.getByText("Operational report values")).toBeInTheDocument();
    expect(screen.getByText("PCC")).toBeInTheDocument();
    expect(screen.getByText("Optometry, PCP, Podiatry")).toBeInTheDocument();
  });

  it("renders the four star rating cards", () => {
    render(<FacilitySummary report={report} />);

    const starRatings = screen.getByText("Star ratings").parentElement as HTMLElement;

    expect(within(starRatings).getByText("Overall rating").parentElement).toHaveTextContent("1/ 5");
    expect(within(starRatings).getByText("Health inspection").parentElement).toHaveTextContent(
      "1/ 5",
    );
    expect(within(starRatings).getByText("Staffing").parentElement).toHaveTextContent("2/ 5");
    expect(within(starRatings).getByText("Quality of resident care").parentElement).toHaveTextContent(
      "4/ 5",
    );
  });

  it("renders hospitalization metric cards with N/A values without crashing", () => {
    render(
      <FacilitySummary
        report={{
          ...report,
          hospitalizationMetrics: {
            ...report.hospitalizationMetrics,
            strHospitalization: "N/A",
            ltEdVisit: "N/A",
          },
        }}
      />,
    );

    expect(screen.getByText("Hospitalization and ED metrics")).toBeInTheDocument();
    expect(screen.getByText("Short Term Hospitalization").parentElement).toHaveTextContent("N/A");
    expect(screen.getByText("ED Visit").parentElement).toHaveTextContent("N/A");
    expect(screen.getByRole("img", { name: "STR Hospitalization Facility: N/A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "LT ED Visit Facility: N/A" })).toBeInTheDocument();
  });

  it("renders comparison charts for facility, state, and nation metrics", () => {
    render(<FacilitySummary report={report} />);

    expect(screen.getByText("3D metric comparisons")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "STR Hospitalization" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "STR ED Visit" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "LT Hospitalization" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "LT ED Visit" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "STR Hospitalization Facility: 18.7%" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "STR Hospitalization State: 23.8%" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "STR Hospitalization Nation: 21.5%" }),
    ).toBeInTheDocument();
  });

  it("omits hospitalization metric cards when optional metrics are unavailable", () => {
    render(<FacilitySummary report={{ ...report, hospitalizationMetrics: undefined }} />);

    expect(screen.queryByText("Hospitalization and ED metrics")).not.toBeInTheDocument();
    expect(screen.queryByText("3D metric comparisons")).not.toBeInTheDocument();
  });
});
