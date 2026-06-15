import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { CmsNetworkError, CmsTimeoutError, fetchFacilityProfileByCcn } from "@/lib/cms/client";
import { parseCcn } from "@/lib/validation/ccn";

type FacilityRouteContext = {
  params: Promise<{
    ccn: string;
  }>;
};

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

export async function GET(_request: Request, context: FacilityRouteContext) {
  const { ccn: rawCcn } = await context.params;
  const parsedCcn = parseCcn(rawCcn);

  if (!parsedCcn.success) {
    return errorResponse(400, "INVALID_CCN", parsedCcn.error.issues[0]?.message ?? "Invalid CCN.");
  }

  try {
    const facility = await fetchFacilityProfileByCcn(parsedCcn.data);

    if (!facility) {
      return errorResponse(404, "FACILITY_NOT_FOUND", "No facility was found for the supplied CCN.");
    }

    return NextResponse.json(facility);
  } catch (error) {
    if (error instanceof CmsTimeoutError) {
      return errorResponse(504, "CMS_TIMEOUT", "CMS provider lookup timed out.");
    }

    if (error instanceof CmsNetworkError) {
      return errorResponse(502, "CMS_LOOKUP_FAILED", "CMS provider lookup failed.");
    }

    if (error instanceof ZodError) {
      return errorResponse(500, "FACILITY_SCHEMA_ERROR", "CMS provider data could not be normalized.");
    }

    return errorResponse(500, "UNEXPECTED_ERROR", "Facility lookup failed.");
  }
}
