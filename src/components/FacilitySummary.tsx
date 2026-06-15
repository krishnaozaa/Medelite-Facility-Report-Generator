import type { FacilityAssessmentReport } from "@/types/report";

type FacilitySummaryProps = {
  report: FacilityAssessmentReport;
};

export function FacilitySummary({ report }: FacilitySummaryProps) {
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
    </section>
  );
}
