import { describe, expect, it } from "vitest";

import { manualInputsSchema } from "./manualInputs";

describe("manualInputsSchema", () => {
  it("validates complete manual inputs", () => {
    const result = manualInputsSchema.safeParse({
      facilityNameOverride: "",
      emr: "PCC",
      currentCensus: "112",
      typeOfPatient: "Long-term & Short-term",
      previousCoverageFromMedelite: "Yes",
      previousProviderPerformanceFromMedelite: "About 30 patients/day",
      medicalCoverage: "Optometry, PCP, Podiatry",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentCensus).toBe(112);
    }
  });

  it("rejects missing required manual inputs", () => {
    const result = manualInputsSchema.safeParse({
      facilityNameOverride: "",
      emr: "",
      currentCensus: "",
      typeOfPatient: "",
      previousCoverageFromMedelite: "",
      previousProviderPerformanceFromMedelite: "",
      medicalCoverage: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        emr: ["Enter the EMR."],
        currentCensus: ["Enter the Current Census."],
        typeOfPatient: ["Enter the Type of Patient."],
        previousCoverageFromMedelite: ["Select previous Medelite coverage."],
        previousProviderPerformanceFromMedelite: ["Enter previous provider performance."],
        medicalCoverage: ["Enter medical coverage."],
      });
    }
  });

  it("requires Current Census to be a non-negative whole number", () => {
    const result = manualInputsSchema.safeParse({
      facilityNameOverride: "",
      emr: "PCC",
      currentCensus: "112.5",
      typeOfPatient: "Long-term",
      previousCoverageFromMedelite: "No",
      previousProviderPerformanceFromMedelite: "None",
      medicalCoverage: "PCP",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.currentCensus).toEqual([
        "Current Census must be a whole number.",
      ]);
    }
  });
});
