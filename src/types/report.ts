export type FacilityAssessmentReport = {
  branding: {
    platform: "INFINITE — Managed by MEDELITE";
    title: "FACILITY ASSESSMENT SNAPSHOT";
    state: string;
  };
  facility: {
    name: string;
    location: string;
    ccn: string;
    medicareUrl: string;
  };
  operations: {
    emr: string;
    censusCapacity: string;
    currentCensus: string;
    patientType: string;
    previousCoverageFromMedelite: string;
    previousProviderPerformance: string;
    medicalCoverage: string;
  };
  ratings: {
    overall: string;
    healthInspection: string;
    staffing: string;
    qualityOfResidentCare: string;
  };
  hospitalizationMetrics?: {
    strHospitalization: string;
    strHospitalizationNationalAvg: string;
    strHospitalizationStateAvg: string;
    strEdVisit: string;
    strEdVisitNationalAvg: string;
    strEdVisitStateAvg: string;
    ltHospitalization: string;
    ltHospitalizationNationalAvg: string;
    ltHospitalizationStateAvg: string;
    ltEdVisit: string;
    ltEdVisitNationalAvg: string;
    ltEdVisitStateAvg: string;
  };
};
