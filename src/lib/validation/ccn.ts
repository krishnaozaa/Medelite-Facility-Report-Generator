import { z } from "zod";

export const ccnSchema = z
  .string({ required_error: "CCN is required." })
  .trim()
  .length(6, "CCN must be exactly 6 characters.");

export function parseCcn(value: unknown) {
  return ccnSchema.safeParse(value);
}
