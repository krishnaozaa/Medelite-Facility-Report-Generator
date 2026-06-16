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

type ComparisonPoint = {
  label: "Facility" | "State" | "Nation";
  value: string;
};

type ComparisonChart = {
  title: string;
  points: ComparisonPoint[];
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

function parseMetricValue(value: string) {
  const normalized = value.replace("%", "").trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function getComparisonCharts(report: FacilityAssessmentReport): ComparisonChart[] {
  if (!report.hospitalizationMetrics) {
    return [];
  }

  return [
    {
      title: "STR Hospitalization",
      points: [
        { label: "Facility", value: report.hospitalizationMetrics.strHospitalization },
        { label: "State", value: report.hospitalizationMetrics.strHospitalizationStateAvg },
        { label: "Nation", value: report.hospitalizationMetrics.strHospitalizationNationalAvg },
      ],
    },
    {
      title: "STR ED Visit",
      points: [
        { label: "Facility", value: report.hospitalizationMetrics.strEdVisit },
        { label: "State", value: report.hospitalizationMetrics.strEdVisitStateAvg },
        { label: "Nation", value: report.hospitalizationMetrics.strEdVisitNationalAvg },
      ],
    },
    {
      title: "LT Hospitalization",
      points: [
        { label: "Facility", value: report.hospitalizationMetrics.ltHospitalization },
        { label: "State", value: report.hospitalizationMetrics.ltHospitalizationStateAvg },
        { label: "Nation", value: report.hospitalizationMetrics.ltHospitalizationNationalAvg },
      ],
    },
    {
      title: "LT ED Visit",
      points: [
        { label: "Facility", value: report.hospitalizationMetrics.ltEdVisit },
        { label: "State", value: report.hospitalizationMetrics.ltEdVisitStateAvg },
        { label: "Nation", value: report.hospitalizationMetrics.ltEdVisitNationalAvg },
      ],
    },
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

function ComparisonBars({ chart }: { chart: ComparisonChart }) {
  const parsedValues = chart.points.map((point) => parseMetricValue(point.value));
  const maxValue = Math.max(...parsedValues.map((value) => value ?? 0), 0);

  return (
    <div className="border border-line bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-ink">{chart.title}</h4>
      <div className="mt-4 space-y-3">
        {chart.points.map((point, index) => {
          const value = parsedValues[index];
          const width = value === null || maxValue === 0 ? 0 : Math.max((value / maxValue) * 100, 6);

          return (
            <div className="grid grid-cols-[4.5rem_1fr_4rem] items-center gap-3" key={point.label}>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {point.label}
              </span>
              <div
                aria-label={`${chart.title} ${point.label}: ${point.value}`}
                className="h-2.5 overflow-hidden bg-slate-100"
                role="img"
              >
                <div
                  className="h-full bg-medelite"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-right text-sm font-semibold text-ink">{point.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
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
    <div className="min-w-0 border border-line bg-white p-4 shadow-sm">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-2 break-words text-base font-semibold leading-6 text-ink">{value}</dd>
    </div>
  );
}

function RatingCard({ label, value, accentClassName }: RatingCard) {
  return (
    <div
      className={`min-w-0 border border-l-4 border-line bg-white p-4 shadow-card ${accentClassName}`}
    >
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-3 flex items-baseline gap-2 text-3xl font-semibold leading-none text-ink">
        {value}
        <span className="text-sm font-medium text-muted">/ 5</span>
      </dd>
    </div>
  );
}

function MetricCard({ label, value }: SummaryRow) {
  return (
    <div className="min-w-0 border border-line bg-white p-4 shadow-sm">
      <dt className="text-sm font-medium leading-5 text-muted">{label}</dt>
      <dd className="mt-3 text-2xl font-semibold leading-none text-ink">{value}</dd>
    </div>
  );
}

export function FacilitySummary({ report }: FacilitySummaryProps) {
  const hospitalizationRows = getHospitalizationRows(report);
  const operationsRows = getOperationsRows(report);
  const ratingCards = getRatingCards(report);
  const comparisonCharts = getComparisonCharts(report);

  return (
    <section
      aria-labelledby="facility-summary-title"
      className="space-y-5"
    >
      <div className="border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-medelite">
              Facility summary
            </p>
            <h2 id="facility-summary-title" className="mt-2 text-2xl font-semibold leading-tight text-ink">
              {report.facility.name}
            </h2>
            <p className="mt-2 text-sm font-medium text-muted">CCN {report.facility.ccn}</p>
          </div>
          <a
            className="inline-flex min-h-10 items-center justify-center border border-line bg-white px-4 text-sm font-semibold text-infinite shadow-sm transition hover:border-infinite hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-infinite/10"
            href={report.facility.medicareUrl}
            rel="noreferrer"
            target="_blank"
          >
            Medicare source
          </a>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 border border-line bg-surface p-4">
            <dt className="text-sm font-medium text-muted">Name of Facility</dt>
            <dd className="mt-2 break-words text-base font-semibold leading-6 text-ink">
              {report.facility.name}
            </dd>
          </div>
          <div className="min-w-0 border border-line bg-surface p-4">
            <dt className="text-sm font-medium text-muted">Location</dt>
            <dd className="mt-2 break-words text-base font-semibold leading-6 text-ink">
              {report.facility.location}
            </dd>
          </div>
          <div className="min-w-0 border border-line bg-surface p-4">
            <dt className="text-sm font-medium text-muted">Certified beds</dt>
            <dd className="mt-2 text-base font-semibold text-ink">{report.operations.censusCapacity}</dd>
          </div>
        </dl>
      </div>

      <div className="border border-line bg-white p-5 shadow-soft sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-medelite">
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
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-medelite">
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
        <>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-medelite">
              Hospitalization and ED metrics
            </h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hospitalizationRows.map((row) => (
                <MetricCard key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-medelite">
              Metric comparisons
            </h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {comparisonCharts.map((chart) => (
                <ComparisonBars chart={chart} key={chart.title} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
