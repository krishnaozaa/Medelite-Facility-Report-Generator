"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

import type { FacilityProfile } from "@/types/facility";
import { emptyManualInputs, type ManualInputs } from "@/types/manualInputs";
import { buildFacilityAssessmentReport } from "@/lib/report/buildFacilityAssessmentReport";

import { DocxDownloadButton } from "./DocxDownloadButton";
import { FacilitySummary } from "./FacilitySummary";
import { ManualInputsForm } from "./ManualInputsForm";
import { PdfDownloadButton } from "./PdfDownloadButton";

type LookupStatus = "idle" | "loading" | "success" | "not-found" | "error";

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

function validateCcn(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "Enter a CCN.";
  }

  if (trimmed.length !== 6) {
    return "CCN must be exactly 6 characters.";
  }

  return null;
}

async function readApiError(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.error?.message ?? "Facility lookup failed.";
  } catch {
    return "Facility lookup failed.";
  }
}

export function CcnLookupForm() {
  const [ccn, setCcn] = useState("");
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [facility, setFacility] = useState<FacilityProfile | null>(null);
  const [manualInputs, setManualInputs] = useState<ManualInputs>(emptyManualInputs);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const inFlightLookupRef = useRef(false);

  const isLoading = status === "loading";
  const report = useMemo(
    () => (facility ? buildFacilityAssessmentReport(facility, manualInputs) : null),
    [facility, manualInputs],
  );

  async function lookupFacility(nextCcn: string) {
    if (inFlightLookupRef.current) {
      return;
    }

    const validationMessage = validateCcn(nextCcn);

    if (validationMessage) {
      setValidationError(validationMessage);
      setApiError(null);
      setFacility(null);
      setManualInputs(emptyManualInputs);
      setStatus("idle");
      return;
    }

    setValidationError(null);
    setApiError(null);
    setFacility(null);
    setManualInputs(emptyManualInputs);
    setStatus("loading");
    inFlightLookupRef.current = true;

    try {
      const trimmedCcn = nextCcn.trim();
      const response = await fetch(`/api/facility/${encodeURIComponent(trimmedCcn)}`);

      if (response.status === 404) {
        setStatus("not-found");
        return;
      }

      if (!response.ok) {
        setApiError(await readApiError(response));
        setStatus("error");
        return;
      }

      const profile = (await response.json()) as FacilityProfile;
      setFacility(profile);
      setManualInputs(emptyManualInputs);
      setStatus("success");
    } catch {
      setApiError("Facility lookup is temporarily unavailable. Please try again.");
      setStatus("error");
    } finally {
      inFlightLookupRef.current = false;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading || inFlightLookupRef.current) {
      return;
    }

    await lookupFacility(ccn);
  }

  async function handleRetry() {
    if (!isLoading && !inFlightLookupRef.current) {
      await lookupFacility(ccn);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        className="border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-ink" htmlFor="ccn">
              CMS Certification Number / CCN
            </label>
            <input
              aria-describedby={validationError ? "ccn-error" : "ccn-help"}
              aria-invalid={validationError ? "true" : "false"}
              className="mt-2 min-h-11 w-full border border-slate-300 px-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-infinite focus:ring-2 focus:ring-infinite/20"
              disabled={isLoading}
              id="ccn"
              inputMode="numeric"
              maxLength={12}
              name="ccn"
              onChange={(event) => setCcn(event.target.value)}
              placeholder="686123"
              type="text"
              value={ccn}
            />
            {validationError ? (
              <p className="mt-2 text-sm font-medium text-red-700" id="ccn-error" role="alert">
                {validationError}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-600" id="ccn-help">
                Enter a 6-character CCN.
              </p>
            )}
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center bg-infinite px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-infinite focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div
          aria-live="polite"
          className="border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900"
          role="status"
        >
          Looking up facility data...
        </div>
      ) : null}

      {status === "not-found" ? (
        <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">
          No facility was found for that CCN.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-950" role="alert">
          <p className="font-semibold">Facility lookup failed.</p>
          <p className="mt-1">{apiError ?? "Please try again."}</p>
          <button
            className="mt-3 inline-flex min-h-10 items-center justify-center border border-red-300 px-4 text-sm font-semibold text-red-900 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
            onClick={handleRetry}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : null}

      {status === "success" && facility && report ? (
        <>
          <ManualInputsForm
            averageResidentsPerDay={facility.averageResidentsPerDay}
            manualInputs={manualInputs}
            onManualInputsChange={setManualInputs}
          />
          <div className="flex flex-col gap-4 border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-medelite">
                Export
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Facility snapshot exports</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <PdfDownloadButton report={report} />
              <DocxDownloadButton report={report} />
            </div>
          </div>
          <FacilitySummary report={report} />
        </>
      ) : null}
    </div>
  );
}
