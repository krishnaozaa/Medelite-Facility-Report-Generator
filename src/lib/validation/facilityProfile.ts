import { z } from "zod";

export const nullableNumberSchema = z.number().finite().nullable();

export const facilityProfileSchema = z.object({
  ccn: z.string().length(6),
  providerName: z.string().min(1),
  legalBusinessName: z.string().min(1).nullable(),
  cmsDisplayName: z.string().min(1),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2),
    zip: z.string().min(1),
    full: z.string().min(1),
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
