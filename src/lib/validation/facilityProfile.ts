import { z } from "zod";

export const nullableNumberSchema = z.number().finite().nullable();

export const facilityProfileSchema = z.object({
  ccn: z.string().length(6),
  providerName: z.string().min(1),
  legalBusinessName: z.string().min(1).nullable(),
  cmsDisplayName: z.string().min(1),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    full: z.string(),
  }),
  certifiedBeds: nullableNumberSchema,
  averageResidentsPerDay: nullableNumberSchema,
  ratings: z.object({
    overall: nullableNumberSchema,
    healthInspection: nullableNumberSchema,
    staffing: nullableNumberSchema,
    qualityOfResidentCare: nullableNumberSchema,
  }),
  medicareUrl: z.string().url(),
});
