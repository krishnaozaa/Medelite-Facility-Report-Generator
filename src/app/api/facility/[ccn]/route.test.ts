import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const cmsRow = {
  cms_certification_number_ccn: "686123",
  provider_name: "Kendall Lakes Healthcare and Rehab Center",
  legal_business_name: "Kendall Lakes Operator LLC",
  provider_address: "5280 SW 157th Ave",
  citytown: "Miami",
  state: "FL",
  zip_code: "33185",
  location: "5280 SW 157th Ave, Miami, FL",
  number_of_certified_beds: "120",
  average_number_of_residents_per_day: "98.7",
  overall_rating: "1",
  health_inspection_rating: "1",
  staffing_rating: "2",
  qm_rating: "4",
};

function routeContext(ccn: string) {
  return {
    params: Promise.resolve({ ccn }),
  };
}

async function readJson(response: Response) {
  return response.json() as Promise<unknown>;
}

describe("GET /api/facility/[ccn]", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a normalized facility profile for a matching CCN", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [cmsRow] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/api/facility/686123"), routeContext("686123"));
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      ccn: "686123",
      providerName: "Kendall Lakes Healthcare and Rehab Center",
      legalBusinessName: "Kendall Lakes Operator LLC",
      address: {
        state: "FL",
      },
      ratings: {
        overall: 1,
        healthInspection: 1,
        staffing: 2,
        qualityOfResidentCare: 4,
      },
    });

    const requestUrl = new URL(fetchMock.mock.calls[0][0].toString());
    expect(requestUrl.pathname).toBe("/provider-data/api/1/datastore/query/4pq5-n9py/0");
    expect(requestUrl.searchParams.get("conditions[0][property]")).toBe("cms_certification_number_ccn");
    expect(requestUrl.searchParams.get("conditions[0][value]")).toBe("686123");
    expect(requestUrl.searchParams.get("conditions[0][operator]")).toBe("=");
    expect(requestUrl.searchParams.get("size")).toBe("1");
  });

  it("trims CCN route params before lookup", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [cmsRow] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/api/facility/686123"), routeContext(" 686123 "));

    expect(response.status).toBe(200);
    const requestUrl = new URL(fetchMock.mock.calls[0][0].toString());
    expect(requestUrl.searchParams.get("conditions[0][value]")).toBe("686123");
  });

  it("returns 400 for an invalid CCN", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/api/facility/123"), routeContext("123"));
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json).toEqual({
      error: {
        code: "INVALID_CCN",
        message: "CCN must be exactly 6 characters.",
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 404 when CMS has no matching facility", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ results: [] }),
      }),
    );

    const response = await GET(new Request("http://localhost/api/facility/686123"), routeContext("686123"));
    const json = await readJson(response);

    expect(response.status).toBe(404);
    expect(json).toEqual({
      error: {
        code: "FACILITY_NOT_FOUND",
        message: "No facility was found for the supplied CCN.",
      },
    });
  });

  it("returns 502 when the CMS request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    const response = await GET(new Request("http://localhost/api/facility/686123"), routeContext("686123"));
    const json = await readJson(response);

    expect(response.status).toBe(502);
    expect(json).toEqual({
      error: {
        code: "CMS_LOOKUP_FAILED",
        message: "CMS provider lookup failed.",
      },
    });
  });

  it("returns 504 when the CMS request times out", async () => {
    const abortError = new Error("Request aborted");
    abortError.name = "AbortError";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    const response = await GET(new Request("http://localhost/api/facility/686123"), routeContext("686123"));
    const json = await readJson(response);

    expect(response.status).toBe(504);
    expect(json).toEqual({
      error: {
        code: "CMS_TIMEOUT",
        message: "CMS provider lookup timed out.",
      },
    });
  });

  it("returns a safe 500 when CMS data cannot be normalized", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ results: [{ cms_certification_number_ccn: "686123" }] }),
      }),
    );

    const response = await GET(new Request("http://localhost/api/facility/686123"), routeContext("686123"));
    const json = await readJson(response);

    expect(response.status).toBe(500);
    expect(json).toEqual({
      error: {
        code: "FACILITY_SCHEMA_ERROR",
        message: "CMS provider data could not be normalized.",
      },
    });
  });

  it("returns sparse but valid normalized data when CMS address, beds, and ratings are missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          results: [
            {
              cms_certification_number_ccn: "123456",
              provider_name: "Sparse Facility",
            },
          ],
        }),
      }),
    );

    const response = await GET(new Request("http://localhost/api/facility/123456"), routeContext("123456"));
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      ccn: "123456",
      providerName: "Sparse Facility",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        full: "",
      },
      certifiedBeds: null,
      ratings: {
        overall: null,
        healthInspection: null,
        staffing: null,
        qualityOfResidentCare: null,
      },
    });
  });
});
