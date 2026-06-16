import type { FacilityAssessmentReport } from "@/types/report";

type FacilitySummaryProps = {
  report: FacilityAssessmentReport;
};

function getHospitalizationRows(report: FacilityAssessmentReport) {
  if (!report.hospitalizationMetrics) {
    return [];
  }

  return [
    { label: "Short Term Hospitalization", value: report.hospitalizationMetrics.strHospitalization },
    {
      label: "STR National Avg. for Hospitalization",
      value: report.hospitalizationMetrics.strHospitalizationNationalAvg,
    },
    {
      label: "STR State National Avg. for Hospitalization",
      value: report.hospitalizationMetrics.strHospitalizationStateAvg,
    },
    { label: "STR ED Visit", value: report.hospitalizationMetrics.strEdVisit },
    {
      label: "STR ED Visits National Avg.",
      value: report.hospitalizationMetrics.strEdVisitNationalAvg,
    },
    { label: "STR ED Visits State Avg.", value: report.hospitalizationMetrics.strEdVisitStateAvg },
    { label: "LT Hospitalization", value: report.hospitalizationMetrics.ltHospitalization },
    {
      label: "LT National Avg. for Hospitalization",
      value: report.hospitalizationMetrics.ltHospitalizationNationalAvg,
    },
    {
      label: "LT State National Avg. for Hospitalization",
      value: report.hospitalizationMetrics.ltHospitalizationStateAvg,
    },
    { label: "ED Visit", value: report.hospitalizationMetrics.ltEdVisit },
    {
      label: "LT ED Visits National Avg.",
      value: report.hospitalizationMetrics.ltEdVisitNationalAvg,
    },
    { label: "LT ED Visits State Avg.", value: report.hospitalizationMetrics.ltEdVisitStateAvg },
  ];
}

export function FacilitySummary({ report }: FacilitySummaryProps) {
  const hospitalizationRows = getHospitalizationRows(report);

  return (
    <section
      aria-labelledby="facility-summary-title"
      className="border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-medelite">
            Report body preview
          </p>
          <h2 id="facility-summary-title" className="mt-2 text-2xl font-semibold text-ink">
            {report.facility.name}
          </h2>
          <p className="mt-2 text-sm text-slate-600">CCN {report.facility.ccn}</p>
        </div>
        <a
          className="inline-flex min-h-10 items-center justify-center border border-slate-300 px-4 text-sm font-semibold text-infinite transition hover:border-infinite hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-infinite focus:ring-offset-2"
          href={report.facility.medicareUrl}
          rel="noreferrer"
          target="_blank"
        >
          Medicare source
        </a>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-slate-200 p-4 lg:col-span-2">
          <dt className="text-sm font-medium text-slate-600">Name of Facility</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.facility.name}</dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Location</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.facility.location}</dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Certified beds</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.operations.censusCapacity}</dd>
        </div>
      </dl>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">EMR</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.operations.emr}</dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Current Census</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.operations.currentCensus}</dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Type of Patient</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.operations.patientType}</dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Previous Coverage from Medelite</dt>
          <dd className="mt-2 text-base font-semibold text-ink">
            {report.operations.previousCoverageFromMedelite}
          </dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">
            Previous Provider Performance from Medelite
          </dt>
          <dd className="mt-2 text-base font-semibold text-ink">
            {report.operations.previousProviderPerformance}
          </dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Medical Coverage</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.operations.medicalCoverage}</dd>
        </div>
      </dl>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Overall rating</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.ratings.overall}</dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Health inspection</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.ratings.healthInspection}</dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Staffing</dt>
          <dd className="mt-2 text-base font-semibold text-ink">{report.ratings.staffing}</dd>
        </div>
        <div className="border border-slate-200 p-4">
          <dt className="text-sm font-medium text-slate-600">Quality of resident care</dt>
          <dd className="mt-2 text-base font-semibold text-ink">
            {report.ratings.qualityOfResidentCare}
          </dd>
        </div>
      </dl>

      {hospitalizationRows.length > 0 ? (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-medelite">
            Hospitalization and ED metrics
          </h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hospitalizationRows.map((row) => (
              <div className="border border-slate-200 p-4" key={row.label}>
                <dt className="text-sm font-medium text-slate-600">{row.label}</dt>
                <dd className="mt-2 text-base font-semibold text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
