import type { FacilityAssessmentReport } from "@/types/report";

type FacilitySummaryProps = {
  report: FacilityAssessmentReport;
};

type SummaryRow = {
  label: string;
  value: string;
};

type RatingCard = SummaryRow & {
  accentClassName: string;
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

function getOperationsRows(report: FacilityAssessmentReport): SummaryRow[] {
  return [
    { label: "EMR", value: report.operations.emr },
    { label: "Current Census", value: report.operations.currentCensus },
    { label: "Type of Patient", value: report.operations.patientType },
    {
      label: "Previous Coverage from Medelite",
      value: report.operations.previousCoverageFromMedelite,
    },
    {
      label: "Previous Provider Performance from Medelite",
      value: report.operations.previousProviderPerformance,
    },
    { label: "Medical Coverage", value: report.operations.medicalCoverage },
  ];
}

function getRatingCards(report: FacilityAssessmentReport): RatingCard[] {
  return [
    {
      label: "Overall rating",
      value: report.ratings.overall,
      accentClassName: "border-l-infinite",
    },
    {
      label: "Health inspection",
      value: report.ratings.healthInspection,
      accentClassName: "border-l-medelite",
    },
    {
      label: "Staffing",
      value: report.ratings.staffing,
      accentClassName: "border-l-fuchsia-500",
    },
    {
      label: "Quality of resident care",
      value: report.ratings.qualityOfResidentCare,
      accentClassName: "border-l-slate-500",
    },
  ];
}

function InfoCard({ label, value }: SummaryRow) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="mt-2 break-words text-base font-semibold leading-6 text-ink">{value}</dd>
    </div>
  );
}

function RatingCard({ label, value, accentClassName }: RatingCard) {
  return (
    <div
      className={`min-w-0 rounded-md border border-l-4 border-slate-200 bg-white p-4 shadow-sm ${accentClassName}`}
    >
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="mt-3 flex items-baseline gap-2 text-3xl font-semibold leading-none text-ink">
        {value}
        <span className="text-sm font-medium text-slate-500">/ 5</span>
      </dd>
    </div>
  );
}

function MetricCard({ label, value }: SummaryRow) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <dt className="text-sm font-medium leading-5 text-slate-600">{label}</dt>
      <dd className="mt-3 text-2xl font-semibold leading-none text-ink">{value}</dd>
    </div>
  );
}

export function FacilitySummary({ report }: FacilitySummaryProps) {
  const hospitalizationRows = getHospitalizationRows(report);
  const operationsRows = getOperationsRows(report);
  const ratingCards = getRatingCards(report);

  return (
    <section
      aria-labelledby="facility-summary-title"
      className="space-y-5"
    >
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-medelite">
              Facility summary
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

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-4">
            <dt className="text-sm font-medium text-slate-600">Name of Facility</dt>
            <dd className="mt-2 break-words text-base font-semibold leading-6 text-ink">
              {report.facility.name}
            </dd>
          </div>
          <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-4">
            <dt className="text-sm font-medium text-slate-600">Location</dt>
            <dd className="mt-2 break-words text-base font-semibold leading-6 text-ink">
              {report.facility.location}
            </dd>
          </div>
          <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-4">
            <dt className="text-sm font-medium text-slate-600">Certified beds</dt>
            <dd className="mt-2 text-base font-semibold text-ink">{report.operations.censusCapacity}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-medelite">
            Manual operations
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink">Operational report values</h3>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {operationsRows.map((row) => (
            <InfoCard key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-medelite">
          Star ratings
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ratingCards.map((rating) => (
            <RatingCard
              accentClassName={rating.accentClassName}
              key={rating.label}
              label={rating.label}
              value={rating.value}
            />
          ))}
        </dl>
      </div>

      {hospitalizationRows.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-medelite">
            Hospitalization and ED metrics
          </h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hospitalizationRows.map((row) => (
              <MetricCard key={row.label} label={row.label} value={row.value} />
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
