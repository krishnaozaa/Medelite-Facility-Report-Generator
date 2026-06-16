import type { FacilityProfile } from "@/types/facility";

export type CmsClaimsQualityMeasureRow = Record<string, unknown>;
export type CmsStateUsAveragesRow = Record<string, unknown>;

export const CLAIMS_MEASURE_CODES = {
  shortStayHospitalization: "521",
  shortStayEdVisit: "522",
  longStayHospitalization: "551",
  longStayEdVisit: "552",
} as const;

const fieldAliases = {
  measureCode: ["Measure Code", "measure_code"],
  measureDescription: ["Measure Description", "measure_description"],
  residentType: ["Resident type", "resident_type"],
  adjustedScore: ["Adjusted Score", "adjusted_score"],
  observedScore: ["Observed Score", "observed_score"],
  footnote: ["Footnote for the Measure Score", "footnote_for_the_measure_score"],
} as const;

const stateAverageFieldAliases = {
  shortStayHospitalization: [
    "Percentage of short stay residents who were rehospitalized after a nursing home admission",
    "percentage_of_short_stay_residents_who_were_rehospitalized__1d02",
  ],
  shortStayEdVisit: [
    "Percentage of short stay residents who had an outpatient emergency department visit",
    "percentage_of_short_stay_residents_who_had_an_outpatient_em_d911",
  ],
  longStayHospitalization: [
    "Number of hospitalizations per 1000 long-stay resident days",
    "number_of_hospitalizations_per_1000_longstay_resident_days",
  ],
  longStayEdVisit: [
    "Number of outpatient emergency department visits per 1000 long-stay resident days",
    "number_of_outpatient_emergency_department_visits_per_1000_l_de9d",
  ],
} as const;

export const emptyHospitalizationMetrics: FacilityProfile["hospitalizationMetrics"] = {
  strHospitalization: null,
  strHospitalizationNationalAvg: null,
  strHospitalizationStateAvg: null,
  strEdVisit: null,
  strEdVisitNationalAvg: null,
  strEdVisitStateAvg: null,
  ltHospitalization: null,
  ltHospitalizationNationalAvg: null,
  ltHospitalizationStateAvg: null,
  ltEdVisit: null,
  ltEdVisitNationalAvg: null,
  ltEdVisitStateAvg: null,
};

function readString(row: Record<string, unknown>, aliases: readonly string[]) {
  for (const alias of aliases) {
    const value = row[alias];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function readNullableNumber(row: Record<string, unknown>, aliases: readonly string[]) {
  const value = readString(row, aliases);

  if (value.length === 0) {
    return null;
  }

  const parsed = Number(value.replaceAll(",", ""));

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasFootnote(row: CmsClaimsQualityMeasureRow) {
  return readString(row, fieldAliases.footnote).length > 0;
}

function readClaimsScore(row: CmsClaimsQualityMeasureRow | undefined) {
  if (!row || hasFootnote(row)) {
    return null;
  }

  return (
    readNullableNumber(row, fieldAliases.adjustedScore) ??
    readNullableNumber(row, fieldAliases.observedScore)
  );
}

function claimMatches(
  row: CmsClaimsQualityMeasureRow,
  measureCode: string,
  descriptionMatcher: (description: string, residentType: string) => boolean,
) {
  const rowMeasureCode = readString(row, fieldAliases.measureCode);
  const description = normalizeForMatch(readString(row, fieldAliases.measureDescription));
  const residentType = normalizeForMatch(readString(row, fieldAliases.residentType));

  return rowMeasureCode === measureCode || descriptionMatcher(description, residentType);
}

function findClaimsScore(
  rows: CmsClaimsQualityMeasureRow[],
  measureCode: string,
  descriptionMatcher: (description: string, residentType: string) => boolean,
) {
  return readClaimsScore(rows.find((row) => claimMatches(row, measureCode, descriptionMatcher)));
}

function readAverage(row: CmsStateUsAveragesRow | null, aliases: readonly string[]) {
  return row ? readNullableNumber(row, aliases) : null;
}

function isShortStay(description: string, residentType: string) {
  return description.includes("short stay") || residentType.includes("short");
}

function matchesShortStayHospitalization(description: string, residentType: string) {
  return (
    isShortStay(description, residentType) &&
    description.includes("rehospitalized") &&
    description.includes("nursing home admission")
  );
}

function matchesShortStayEdVisit(description: string, residentType: string) {
  return (
    isShortStay(description, residentType) &&
    description.includes("outpatient emergency department visit")
  );
}

function matchesLongStayHospitalization(description: string) {
  return (
    description.includes("hospitalizations per 1000") &&
    description.includes("long stay resident days")
  );
}

function matchesLongStayEdVisit(description: string) {
  return (
    description.includes("outpatient emergency department visits per 1000") &&
    description.includes("long stay resident days")
  );
}

export function mapCmsHospitalizationMetrics(
  claimsRows: CmsClaimsQualityMeasureRow[],
  stateAveragesRow: CmsStateUsAveragesRow | null,
  nationalAveragesRow: CmsStateUsAveragesRow | null,
): FacilityProfile["hospitalizationMetrics"] {
  return {
    strHospitalization: findClaimsScore(
      claimsRows,
      CLAIMS_MEASURE_CODES.shortStayHospitalization,
      matchesShortStayHospitalization,
    ),
    strHospitalizationNationalAvg: readAverage(
      nationalAveragesRow,
      stateAverageFieldAliases.shortStayHospitalization,
    ),
    strHospitalizationStateAvg: readAverage(
      stateAveragesRow,
      stateAverageFieldAliases.shortStayHospitalization,
    ),
    strEdVisit: findClaimsScore(
      claimsRows,
      CLAIMS_MEASURE_CODES.shortStayEdVisit,
      matchesShortStayEdVisit,
    ),
    strEdVisitNationalAvg: readAverage(
      nationalAveragesRow,
      stateAverageFieldAliases.shortStayEdVisit,
    ),
    strEdVisitStateAvg: readAverage(stateAveragesRow, stateAverageFieldAliases.shortStayEdVisit),
    ltHospitalization: findClaimsScore(
      claimsRows,
      CLAIMS_MEASURE_CODES.longStayHospitalization,
      matchesLongStayHospitalization,
    ),
    ltHospitalizationNationalAvg: readAverage(
      nationalAveragesRow,
      stateAverageFieldAliases.longStayHospitalization,
    ),
    ltHospitalizationStateAvg: readAverage(
      stateAveragesRow,
      stateAverageFieldAliases.longStayHospitalization,
    ),
    ltEdVisit: findClaimsScore(
      claimsRows,
      CLAIMS_MEASURE_CODES.longStayEdVisit,
      matchesLongStayEdVisit,
    ),
    ltEdVisitNationalAvg: readAverage(
      nationalAveragesRow,
      stateAverageFieldAliases.longStayEdVisit,
    ),
    ltEdVisitStateAvg: readAverage(stateAveragesRow, stateAverageFieldAliases.longStayEdVisit),
  };
}
