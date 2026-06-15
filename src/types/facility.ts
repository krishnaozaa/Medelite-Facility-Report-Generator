export type FacilityProfile = {
  ccn: string;
  providerName: string;
  legalBusinessName: string | null;
  cmsDisplayName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    full: string;
  };
  certifiedBeds: number | null;
  averageResidentsPerDay: number | null;
  ratings: {
    overall: number | null;
    healthInspection: number | null;
    staffing: number | null;
    qualityOfResidentCare: number | null;
  };
  medicareUrl: string;
};
