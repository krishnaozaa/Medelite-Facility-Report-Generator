import { z } from "zod";

export const manualInputsSchema = z.object({
  facilityNameOverride: z.string().trim().optional().default(""),
  emr: z.string().trim().min(1, "Enter the EMR."),
  currentCensus: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim().length === 0) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: "Enter the Current Census.",
        required_error: "Enter the Current Census.",
      })
      .int("Current Census must be a whole number.")
      .nonnegative("Current Census cannot be negative."),
  ),
  typeOfPatient: z.string().trim().min(1, "Enter the Type of Patient."),
  previousCoverageFromMedelite: z.enum(["Yes", "No"], {
    errorMap: () => ({ message: "Select previous Medelite coverage." }),
  }),
  previousProviderPerformanceFromMedelite: z
    .string()
    .trim()
    .min(1, "Enter previous provider performance."),
  medicalCoverage: z.string().trim().min(1, "Enter medical coverage."),
});

export type ValidatedManualInputs = z.infer<typeof manualInputsSchema>;
