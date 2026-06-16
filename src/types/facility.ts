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
  hospitalizationMetrics: {
    strHospitalization: number | null;
    strHospitalizationNationalAvg: number | null;
    strHospitalizationStateAvg: number | null;
    strEdVisit: number | null;
    strEdVisitNationalAvg: number | null;
    strEdVisitStateAvg: number | null;
    ltHospitalization: number | null;
    ltHospitalizationNationalAvg: number | null;
    ltHospitalizationStateAvg: number | null;
    ltEdVisit: number | null;
    ltEdVisitNationalAvg: number | null;
    ltEdVisitStateAvg: number | null;
  };
  medicareUrl: string;
};
