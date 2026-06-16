import type { FacilityProfile } from "@/types/facility";

import {
  CMS_MEDICARE_CLAIMS_QUALITY_MEASURES_ENDPOINT,
  CMS_PROVIDER_INFORMATION_ENDPOINT,
  CMS_REQUEST_TIMEOUT_MS,
  CMS_STATE_US_AVERAGES_ENDPOINT,
} from "./constants";
import {
  emptyHospitalizationMetrics,
  mapCmsHospitalizationMetrics,
  type CmsClaimsQualityMeasureRow,
  type CmsStateUsAveragesRow,
} from "./hospitalizationMetrics";
import { mapCmsProviderRowToFacilityProfile } from "./mapper";

const SUCCESS_CACHE_TTL_MS = 5 * 60 * 1_000;
const successCache = new Map<string, { expiresAt: number; facility: FacilityProfile }>();

export class CmsTimeoutError extends Error {
  constructor() {
    super("CMS provider lookup timed out.");
    this.name = "CmsTimeoutError";
  }
}

export class CmsNetworkError extends Error {
  constructor(message = "CMS provider lookup failed.") {
    super(message);
    this.name = "CmsNetworkError";
  }
}

function buildProviderLookupUrl(ccn: string) {
  const url = new URL(CMS_PROVIDER_INFORMATION_ENDPOINT);
  url.searchParams.set("conditions[0][property]", "cms_certification_number_ccn");
  url.searchParams.set("conditions[0][value]", ccn);
  url.searchParams.set("conditions[0][operator]", "=");
  url.searchParams.set("size", "1");

  return url;
}

function buildClaimsLookupUrl(ccn: string) {
  const url = new URL(CMS_MEDICARE_CLAIMS_QUALITY_MEASURES_ENDPOINT);
  url.searchParams.set("conditions[0][property]", "cms_certification_number_ccn");
  url.searchParams.set("conditions[0][value]", ccn);
  url.searchParams.set("conditions[0][operator]", "=");
  url.searchParams.set("size", "100");

  return url;
}

function buildStateAveragesLookupUrl(stateOrNation: string) {
  const url = new URL(CMS_STATE_US_AVERAGES_ENDPOINT);
  url.searchParams.set("conditions[0][property]", "state_or_nation");
  url.searchParams.set("conditions[0][value]", stateOrNation);
  url.searchParams.set("conditions[0][operator]", "=");
  url.searchParams.set("size", "1");

  return url;
}

function extractResults(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "results" in payload &&
    Array.isArray(payload.results)
  ) {
    return payload.results;
  }

  throw new CmsNetworkError("CMS provider lookup returned an unexpected payload.");
}

async function fetchJsonResults(url: URL, signal: AbortSignal, failureMessage: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new CmsNetworkError(`${failureMessage} returned ${response.status}.`);
  }

  const payload: unknown = await response.json();

  return extractResults(payload);
}

async function fetchHospitalizationMetrics(
  ccn: string,
  state: string,
  signal: AbortSignal,
): Promise<FacilityProfile["hospitalizationMetrics"]> {
  const stateAveragesPromise =
    state.length > 0
      ? fetchJsonResults(buildStateAveragesLookupUrl(state), signal, "CMS state averages lookup")
      : Promise.resolve([]);

  // Bonus metrics should degrade independently; a failed average lookup should not hide facility claims data.
  const [claimsRowsResult, stateRowsResult, nationalRowsResult] = await Promise.allSettled([
    fetchJsonResults(buildClaimsLookupUrl(ccn), signal, "CMS claims lookup"),
    stateAveragesPromise,
    fetchJsonResults(buildStateAveragesLookupUrl("NATION"), signal, "CMS national averages lookup"),
  ]);
  const claimsRows = claimsRowsResult.status === "fulfilled" ? claimsRowsResult.value : [];
  const stateRows = stateRowsResult.status === "fulfilled" ? stateRowsResult.value : [];
  const nationalRows = nationalRowsResult.status === "fulfilled" ? nationalRowsResult.value : [];

  return mapCmsHospitalizationMetrics(
    claimsRows as CmsClaimsQualityMeasureRow[],
    (stateRows[0] as CmsStateUsAveragesRow | undefined) ?? null,
    (nationalRows[0] as CmsStateUsAveragesRow | undefined) ?? null,
  );
}

async function fetchOptionalHospitalizationMetrics(
  ccn: string,
  state: string,
  signal: AbortSignal,
): Promise<FacilityProfile["hospitalizationMetrics"]> {
  try {
    return await fetchHospitalizationMetrics(ccn, state, signal);
  } catch {
    return emptyHospitalizationMetrics;
  }
}

function getCachedFacility(ccn: string) {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  const cached = successCache.get(ccn);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    successCache.delete(ccn);
    return null;
  }

  return cached.facility;
}

function cacheSuccessfulFacility(ccn: string, facility: FacilityProfile) {
  if (process.env.NODE_ENV !== "test") {
    successCache.set(ccn, {
      expiresAt: Date.now() + SUCCESS_CACHE_TTL_MS,
      facility,
    });
  }
}

export async function fetchFacilityProfileByCcn(ccn: string): Promise<FacilityProfile | null> {
  const cached = getCachedFacility(ccn);

  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CMS_REQUEST_TIMEOUT_MS);

  try {
    const results = await fetchJsonResults(
      buildProviderLookupUrl(ccn),
      controller.signal,
      "CMS provider lookup",
    );

    if (results.length === 0) {
      return null;
    }

    const providerFacility = mapCmsProviderRowToFacilityProfile(results[0]);
    const hospitalizationMetrics = await fetchOptionalHospitalizationMetrics(
      ccn,
      providerFacility.address.state,
      controller.signal,
    );
    const facility = {
      ...providerFacility,
      hospitalizationMetrics,
    };

    cacheSuccessfulFacility(ccn, facility);

    return facility;
  } catch (error) {
    if (error instanceof CmsNetworkError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new CmsTimeoutError();
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
