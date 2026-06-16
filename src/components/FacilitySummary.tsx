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
  tone: {
    primary: string;
    deep: string;
    highlight: string;
  };
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
        {
          label: "Facility",
          value: report.hospitalizationMetrics.strHospitalization,
          tone: { primary: "#0f766e", deep: "#064e46", highlight: "#5eead4" },
        },
        {
          label: "State",
          value: report.hospitalizationMetrics.strHospitalizationStateAvg,
          tone: { primary: "#2563eb", deep: "#1e3a8a", highlight: "#93c5fd" },
        },
        {
          label: "Nation",
          value: report.hospitalizationMetrics.strHospitalizationNationalAvg,
          tone: { primary: "#c026d3", deep: "#86198f", highlight: "#f0abfc" },
        },
      ],
    },
    {
      title: "STR ED Visit",
      points: [
        {
          label: "Facility",
          value: report.hospitalizationMetrics.strEdVisit,
          tone: { primary: "#0f766e", deep: "#064e46", highlight: "#5eead4" },
        },
        {
          label: "State",
          value: report.hospitalizationMetrics.strEdVisitStateAvg,
          tone: { primary: "#2563eb", deep: "#1e3a8a", highlight: "#93c5fd" },
        },
        {
          label: "Nation",
          value: report.hospitalizationMetrics.strEdVisitNationalAvg,
          tone: { primary: "#c026d3", deep: "#86198f", highlight: "#f0abfc" },
        },
      ],
    },
    {
      title: "LT Hospitalization",
      points: [
        {
          label: "Facility",
          value: report.hospitalizationMetrics.ltHospitalization,
          tone: { primary: "#0f766e", deep: "#064e46", highlight: "#5eead4" },
        },
        {
          label: "State",
          value: report.hospitalizationMetrics.ltHospitalizationStateAvg,
          tone: { primary: "#2563eb", deep: "#1e3a8a", highlight: "#93c5fd" },
        },
        {
          label: "Nation",
          value: report.hospitalizationMetrics.ltHospitalizationNationalAvg,
          tone: { primary: "#c026d3", deep: "#86198f", highlight: "#f0abfc" },
        },
      ],
    },
    {
      title: "LT ED Visit",
      points: [
        {
          label: "Facility",
          value: report.hospitalizationMetrics.ltEdVisit,
          tone: { primary: "#0f766e", deep: "#064e46", highlight: "#5eead4" },
        },
        {
          label: "State",
          value: report.hospitalizationMetrics.ltEdVisitStateAvg,
          tone: { primary: "#2563eb", deep: "#1e3a8a", highlight: "#93c5fd" },
        },
        {
          label: "Nation",
          value: report.hospitalizationMetrics.ltEdVisitNationalAvg,
          tone: { primary: "#c026d3", deep: "#86198f", highlight: "#f0abfc" },
        },
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

function getChartId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function ComparisonColumns({ chart }: { chart: ComparisonChart }) {
  const parsedValues = chart.points.map((point) => parseMetricValue(point.value));
  const maxValue = Math.max(...parsedValues.map((value) => value ?? 0), 0);
  const topValue = maxValue > 0 ? maxValue.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "N/A";
  // Keep this visualization SVG-only to avoid adding charting-library weight for four static comparisons.
  const chartId = getChartId(chart.title);
  const baseY = 262;
  const cylinderWidth = 76;
  const cylinderRadiusY = 14;

  return (
    <article className="overflow-hidden border border-line bg-white shadow-soft">
      <div className="border-b border-line bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-medelite">
              Benchmark model
            </p>
            <h4 className="mt-2 text-lg font-semibold text-ink">{chart.title}</h4>
          </div>
          <div className="border border-line bg-surface px-3 py-2 text-right shadow-sm">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Scale max
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{topValue}</p>
          </div>
        </div>
      </div>

      <div className="bg-[radial-gradient(circle_at_18%_8%,rgba(15,118,110,0.13),transparent_30%),linear-gradient(135deg,#f8fbff_0%,#ffffff_54%,#f7f9fd_100%)] p-4 sm:p-5">
        <svg
          aria-label={`${chart.title} 3D benchmark comparison`}
          className="h-auto w-full"
          role="img"
          viewBox="0 0 720 360"
        >
          <defs>
            <filter id={`${chartId}-soft-shadow`} x="-30%" y="-30%" width="160%" height="180%">
              <feDropShadow dx="0" dy="14" floodColor="#0f172a" floodOpacity="0.18" stdDeviation="10" />
            </filter>
            <linearGradient id={`${chartId}-stage`} x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#eef6fb" />
            </linearGradient>
            {chart.points.map((point) => {
              const pointId = `${chartId}-${point.label.toLowerCase()}`;

              return (
                <linearGradient id={`${pointId}-body`} key={pointId} x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor={point.tone.highlight} />
                  <stop offset="18%" stopColor={point.tone.primary} />
                  <stop offset="72%" stopColor={point.tone.primary} />
                  <stop offset="100%" stopColor={point.tone.deep} />
                </linearGradient>
              );
            })}
          </defs>

          <rect fill="transparent" height="360" width="720" />
          <polygon
            fill={`url(#${chartId}-stage)`}
            points="82,266 658,266 612,326 36,326"
            stroke="#d6e1eb"
            strokeWidth="1.5"
          />
          <path d="M118 288H586" stroke="#cbd7e4" strokeDasharray="7 8" strokeWidth="1.4" />
          <path d="M166 246H632" stroke="#e2e8f0" strokeDasharray="6 9" strokeWidth="1.2" />
          <path d="M210 205H640" stroke="#edf2f7" strokeDasharray="6 9" strokeWidth="1.2" />

          {chart.points.map((point, index) => {
            const value = parsedValues[index];
            const height = value === null || maxValue === 0 ? 0 : Math.max((value / maxValue) * 184, 24);
            const x = 164 + index * 196;
            const topY = baseY - height;
            const pointId = `${chartId}-${point.label.toLowerCase()}`;

            return (
              <g filter={`url(#${chartId}-soft-shadow)`} key={point.label}>
                <ellipse cx={x + 11} cy={baseY + 18} fill="#0f172a" opacity="0.14" rx="64" ry="13" />
                <rect
                  fill={`url(#${pointId}-body)`}
                  height={height}
                  rx="2"
                  width={cylinderWidth}
                  x={x - cylinderWidth / 2}
                  y={topY}
                />
                <path
                  d={`M${x - cylinderWidth / 2} ${topY} C${x - 22} ${topY + 18} ${x - 20} ${baseY - 18} ${x - cylinderWidth / 2} ${baseY} V${topY}Z`}
                  fill="#ffffff"
                  opacity="0.16"
                />
                <path
                  d={`M${x + cylinderWidth / 2} ${topY} C${x + 21} ${topY + 18} ${x + 21} ${baseY - 18} ${x + cylinderWidth / 2} ${baseY} V${topY}Z`}
                  fill="#0f172a"
                  opacity="0.16"
                />
                <ellipse
                  cx={x}
                  cy={topY}
                  fill={point.tone.highlight}
                  opacity="0.95"
                  rx={cylinderWidth / 2}
                  ry={cylinderRadiusY}
                  stroke="#ffffff"
                  strokeOpacity="0.62"
                  strokeWidth="2"
                />
                <ellipse
                  cx={x}
                  cy={baseY}
                  fill={point.tone.deep}
                  opacity="0.2"
                  rx={cylinderWidth / 2}
                  ry={cylinderRadiusY}
                />
                <rect
                  fill="#ffffff"
                  height="32"
                  rx="0"
                  stroke="#d6e1eb"
                  strokeWidth="1.4"
                  width="74"
                  x={x - 37}
                  y={Math.max(topY - 48, 18)}
                />
                <text
                  fill="#172033"
                  fontSize="18"
                  fontWeight="700"
                  textAnchor="middle"
                  x={x}
                  y={Math.max(topY - 26, 40)}
                >
                  {point.value}
                </text>
                <text
                  fill="#64748b"
                  fontSize="17"
                  fontWeight="700"
                  letterSpacing="3"
                  textAnchor="middle"
                  x={x}
                  y="336"
                >
                  {point.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="sr-only">
          {chart.points.map((point) => (
            <span aria-label={`${chart.title} ${point.label}: ${point.value}`} key={point.label} role="img" />
          ))}
        </div>
      </div>
    </article>
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
              3D metric comparisons
            </h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {comparisonCharts.map((chart) => (
                <ComparisonColumns chart={chart} key={chart.title} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
