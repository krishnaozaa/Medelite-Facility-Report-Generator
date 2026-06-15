"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

import { manualInputsSchema } from "@/lib/validation/manualInputs";
import type { ManualInputs } from "@/types/manualInputs";
import { PREVIOUS_COVERAGE_OPTIONS } from "@/types/manualInputs";

type ManualInputsFormProps = {
  averageResidentsPerDay: number | null;
  manualInputs: ManualInputs;
  onManualInputsChange: (manualInputs: ManualInputs) => void;
};

type ManualInputErrors = Partial<Record<keyof ManualInputs, string>>;

function getFieldErrors(manualInputs: ManualInputs) {
  const parsed = manualInputsSchema.safeParse(manualInputs);

  if (parsed.success) {
    return {};
  }

  const flattened = parsed.error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened).map(([field, messages]) => [field, messages?.[0] ?? "Invalid value."]),
  ) as ManualInputErrors;
}

function formatAverageResidents(value: number | null) {
  return value === null ? null : Math.round(value).toString();
}

export function ManualInputsForm({
  averageResidentsPerDay,
  manualInputs,
  onManualInputsChange,
}: ManualInputsFormProps) {
  const [errors, setErrors] = useState<ManualInputErrors>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const suggestedCurrentCensus = formatAverageResidents(averageResidentsPerDay);

  function updateField(field: keyof ManualInputs, value: string) {
    onManualInputsChange({
      ...manualInputs,
      [field]: value,
    });
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setSavedMessage(null);
  }

  function handleInputChange(field: keyof ManualInputs) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateField(field, event.target.value);
    };
  }

  function handlePrefillCurrentCensus() {
    if (suggestedCurrentCensus) {
      updateField("currentCensus", suggestedCurrentCensus);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = getFieldErrors(manualInputs);
    setErrors(nextErrors);
    setSavedMessage(Object.keys(nextErrors).length === 0 ? "Manual inputs saved for preview." : null);
  }

  return (
    <form
      aria-labelledby="manual-inputs-title"
      className="border border-slate-200 bg-white p-6 shadow-sm"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-medelite">
          Operational inputs
        </p>
        <h2 id="manual-inputs-title" className="mt-2 text-2xl font-semibold text-ink">
          Manual report details
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Current Census is a manual value. CMS average residents can only prefill the field as a helper.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-ink" htmlFor="facility-name-override">
            Facility Name Override
          </label>
          <input
            className="mt-2 min-h-11 w-full border border-slate-300 px-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-infinite focus:ring-2 focus:ring-infinite/20"
            id="facility-name-override"
            name="facilityNameOverride"
            onChange={handleInputChange("facilityNameOverride")}
            placeholder="Optional report body name"
            type="text"
            value={manualInputs.facilityNameOverride}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink" htmlFor="emr">
            EMR
          </label>
          <input
            aria-describedby={errors.emr ? "emr-error" : undefined}
            aria-invalid={errors.emr ? "true" : "false"}
            className="mt-2 min-h-11 w-full border border-slate-300 px-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-infinite focus:ring-2 focus:ring-infinite/20"
            id="emr"
            name="emr"
            onChange={handleInputChange("emr")}
            type="text"
            value={manualInputs.emr}
          />
          {errors.emr ? (
            <p className="mt-2 text-sm font-medium text-red-700" id="emr-error">
              {errors.emr}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink" htmlFor="current-census">
            Current Census
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              aria-describedby={errors.currentCensus ? "current-census-error" : "current-census-help"}
              aria-invalid={errors.currentCensus ? "true" : "false"}
              className="min-h-11 w-full border border-slate-300 px-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-infinite focus:ring-2 focus:ring-infinite/20"
              id="current-census"
              inputMode="numeric"
              name="currentCensus"
              onChange={handleInputChange("currentCensus")}
              type="number"
              value={manualInputs.currentCensus}
            />
            <button
              className="inline-flex min-h-11 items-center justify-center border border-slate-300 px-4 text-sm font-semibold text-infinite transition hover:border-infinite hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-infinite focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={!suggestedCurrentCensus}
              onClick={handlePrefillCurrentCensus}
              type="button"
            >
              Prefill
            </button>
          </div>
          {errors.currentCensus ? (
            <p className="mt-2 text-sm font-medium text-red-700" id="current-census-error">
              {errors.currentCensus}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-600" id="current-census-help">
              {suggestedCurrentCensus
                ? `CMS helper suggestion: ${suggestedCurrentCensus}. You can edit this value.`
                : "Enter the current census manually."}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink" htmlFor="type-of-patient">
            Type of Patient
          </label>
          <input
            aria-describedby={errors.typeOfPatient ? "type-of-patient-error" : undefined}
            aria-invalid={errors.typeOfPatient ? "true" : "false"}
            className="mt-2 min-h-11 w-full border border-slate-300 px-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-infinite focus:ring-2 focus:ring-infinite/20"
            id="type-of-patient"
            name="typeOfPatient"
            onChange={handleInputChange("typeOfPatient")}
            type="text"
            value={manualInputs.typeOfPatient}
          />
          {errors.typeOfPatient ? (
            <p className="mt-2 text-sm font-medium text-red-700" id="type-of-patient-error">
              {errors.typeOfPatient}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="block text-sm font-semibold text-ink"
            htmlFor="previous-coverage-from-medelite"
          >
            Previous Coverage from Medelite
          </label>
          <select
            aria-describedby={
              errors.previousCoverageFromMedelite
                ? "previous-coverage-from-medelite-error"
                : undefined
            }
            aria-invalid={errors.previousCoverageFromMedelite ? "true" : "false"}
            className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 text-base text-ink outline-none transition focus:border-infinite focus:ring-2 focus:ring-infinite/20"
            id="previous-coverage-from-medelite"
            name="previousCoverageFromMedelite"
            onChange={handleInputChange("previousCoverageFromMedelite")}
            value={manualInputs.previousCoverageFromMedelite}
          >
            <option value="">Select an option</option>
            {PREVIOUS_COVERAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.previousCoverageFromMedelite ? (
            <p
              className="mt-2 text-sm font-medium text-red-700"
              id="previous-coverage-from-medelite-error"
            >
              {errors.previousCoverageFromMedelite}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label
            className="block text-sm font-semibold text-ink"
            htmlFor="previous-provider-performance-from-medelite"
          >
            Previous Provider Performance from Medelite
          </label>
          <input
            aria-describedby={
              errors.previousProviderPerformanceFromMedelite
                ? "previous-provider-performance-from-medelite-error"
                : undefined
            }
            aria-invalid={errors.previousProviderPerformanceFromMedelite ? "true" : "false"}
            className="mt-2 min-h-11 w-full border border-slate-300 px-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-infinite focus:ring-2 focus:ring-infinite/20"
            id="previous-provider-performance-from-medelite"
            name="previousProviderPerformanceFromMedelite"
            onChange={handleInputChange("previousProviderPerformanceFromMedelite")}
            type="text"
            value={manualInputs.previousProviderPerformanceFromMedelite}
          />
          {errors.previousProviderPerformanceFromMedelite ? (
            <p
              className="mt-2 text-sm font-medium text-red-700"
              id="previous-provider-performance-from-medelite-error"
            >
              {errors.previousProviderPerformanceFromMedelite}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-ink" htmlFor="medical-coverage">
            Medical Coverage
          </label>
          <input
            aria-describedby={errors.medicalCoverage ? "medical-coverage-error" : undefined}
            aria-invalid={errors.medicalCoverage ? "true" : "false"}
            className="mt-2 min-h-11 w-full border border-slate-300 px-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-infinite focus:ring-2 focus:ring-infinite/20"
            id="medical-coverage"
            name="medicalCoverage"
            onChange={handleInputChange("medicalCoverage")}
            type="text"
            value={manualInputs.medicalCoverage}
          />
          {errors.medicalCoverage ? (
            <p className="mt-2 text-sm font-medium text-red-700" id="medical-coverage-error">
              {errors.medicalCoverage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="inline-flex min-h-11 items-center justify-center bg-infinite px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-infinite focus:ring-offset-2"
          type="submit"
        >
          Save manual inputs
        </button>
        {savedMessage ? (
          <p aria-live="polite" className="text-sm font-medium text-medelite">
            {savedMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
