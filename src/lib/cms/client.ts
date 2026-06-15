import type { FacilityProfile } from "@/types/facility";

import {
  CMS_PROVIDER_INFORMATION_ENDPOINT,
  CMS_PROVIDER_SELECT_FIELDS,
  CMS_REQUEST_TIMEOUT_MS,
} from "./constants";
import { mapCmsProviderRowToFacilityProfile } from "./mapper";

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
  url.searchParams.set("cms_certification_number_ccn", ccn);
  url.searchParams.set("$limit", "1");
  url.searchParams.set("$select", CMS_PROVIDER_SELECT_FIELDS.join(","));

  return url;
}

export async function fetchFacilityProfileByCcn(ccn: string): Promise<FacilityProfile | null> {
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

    if (!Array.isArray(payload)) {
      throw new CmsNetworkError("CMS provider lookup returned an unexpected payload.");
    }

    if (payload.length === 0) {
      return null;
    }

    return mapCmsProviderRowToFacilityProfile(payload[0]);
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
