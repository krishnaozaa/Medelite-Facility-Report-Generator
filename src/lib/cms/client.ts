import type { FacilityProfile } from "@/types/facility";

import { CMS_PROVIDER_INFORMATION_ENDPOINT, CMS_REQUEST_TIMEOUT_MS } from "./constants";
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
    const response = await fetch(buildProviderLookupUrl(ccn), {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new CmsNetworkError(`CMS provider lookup returned ${response.status}.`);
    }

    const payload: unknown = await response.json();
    const results = extractResults(payload);

    if (results.length === 0) {
      return null;
    }

    const facility = mapCmsProviderRowToFacilityProfile(results[0]);
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
