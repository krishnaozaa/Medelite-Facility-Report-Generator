# Medelite Facility Assessment Report Generator

A lightweight Next.js application for creating polished Facility Assessment Snapshot reports. The app will use a CMS Certification Number / CCN to fetch public CMS nursing-home data, combine it with Medelite operational inputs, and export a report-ready snapshot.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- `@react-pdf/renderer`
- Vitest
- Vercel-ready project structure

## Local Setup

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## MVP Checklist

- [x] Project foundation and App Router shell
- [x] Server-side CMS provider lookup by CCN
- [x] Normalized CMS facility type and mapper
- [x] CCN lookup UI and facility preview
- [x] Manual operational input form
- [x] Facility assessment snapshot preview
- [x] PDF export with `@react-pdf/renderer`
- [x] Reference-aligned PDF branding and table layout
- [x] Error, loading, and empty states for the full workflow

## Facility Lookup UI

The landing page includes a CCN lookup form backed by `GET /api/facility/[ccn]`.

The UI supports:

- Client-side CCN validation before an API request
- Disabled search button and loading state while a request is in flight
- Clean no-result messaging for unknown CCNs
- Retryable messaging for CMS/API failures
- A normalized facility preview with facility name, CCN, location, certified beds, CMS average residents per day, ratings, and a Medicare source link

`averageResidentsPerDay` is displayed only as a CMS helper value. It is not treated as Current Census; Current Census will be entered manually in a later MVP step.

To test locally:

```bash
npm run dev
```

Open `http://localhost:3000`, enter `686123`, and submit the lookup form.

## Testing

Run the full local quality gate before deployment:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

The automated suite covers:

- happy-path lookup and report rendering with mocked CCN `686123`
- empty and invalid CCN validation
- no CMS result
- CMS timeout and network failures
- missing CMS ratings, address fields, and certified beds
- manual input validation
- facility name override behavior
- canonical report model assertions
- PDF readiness, disabled/enabled behavior, filename generation, generation failure, and Medicare URL presence

## Manual Operational Inputs

After a successful facility lookup, the app renders manual fields for operational report details:

| Field | Required | Notes |
| --- | --- | --- |
| Facility Name Override | No | Optional report body display name |
| EMR | Yes | Free-text value such as `PCC` |
| Current Census | Yes | Manual numeric value |
| Type of Patient | Yes | Free-text patient mix |
| Previous Coverage from Medelite | Yes | `Yes` or `No` |
| Previous Provider Performance from Medelite | Yes | Free-text performance context |
| Medical Coverage | Yes | Free-text coverage list |

Current Census must remain user-entered and editable. CMS `averageResidentsPerDay` may be used only through the helper prefill button, and the user can still change the value after prefilling.

Facility name display for the report body uses this merge rule:

```ts
const cmsName = facility.legalBusinessName || facility.providerName;
const reportFacilityName = manual.facilityNameOverride?.trim() || cmsName;
```

The optional override changes only the report body preview field `Name of Facility`. It must never replace the static brand text `INFINITE — Managed by MEDELITE`.

## Canonical Report Model

All report surfaces should use one canonical model built by `buildFacilityAssessmentReport` in `src/lib/report`.

The builder accepts the normalized CMS `FacilityProfile` plus manual operational inputs, then returns a `FacilityAssessmentReport` object with:

- static report branding
- report body facility identity
- operational fields
- string-formatted ratings
- string-formatted census capacity
- dynamic Medicare URL built from CCN and state

Preview, PDF, and future DOCX exports should render from `FacilityAssessmentReport` instead of duplicating CMS/manual mapping logic in each surface. Missing text values render as `N/A`; missing numeric CMS values and ratings render as `—`.

The branding fields are literal static values:

```ts
branding: {
  platform: "INFINITE — Managed by MEDELITE";
  title: "FACILITY ASSESSMENT SNAPSHOT";
}
```

## MVP PDF Export

PDF export uses `@react-pdf/renderer` and renders from the canonical `FacilityAssessmentReport` model. The UI enables `Download PDF` only after required MVP report fields are present, including manual operational inputs.

The MVP PDF follows the provided Facility Assessment Snapshot reference structure:

- Medelite/INFINITE logo image from `public/branding-medelite.png`
- centered `FACILITY ASSESSMENT SNAPSHOT` heading
- centered dynamic state abbreviation
- one bordered two-column table with bold labels and report values
- clickable Medicare Care Compare source hyperlink

The MVP table includes:

- `INFINITE — Managed by MEDELITE`
- `FACILITY ASSESSMENT SNAPSHOT`
- dynamic state
- Name of Facility
- Location
- EMR
- Census Capacity
- Current Census
- Type of Patient
- Previous Coverage from Medelite
- Previous Provider Performance from Medelite
- Medical Coverage
- Overall Star Rating
- Health Inspection
- Staffing
- Quality of Resident Care
- clickable Medicare Care Compare hyperlink

Downloaded files use the format `facility-assessment-{ccn}.pdf`, for example `facility-assessment-686123.pdf`.

The PDF renderer can include the 12 hospitalization/ED rows when `hospitalizationMetrics` exists on the canonical report model. The MVP does not yet fetch Medicare Claims Quality Measures or State/US Averages, so those values are not fabricated or hardcoded.

Manual QA checklist:

- Look up CCN `686123`.
- Complete all required manual operational inputs.
- Confirm `Download PDF` is disabled before required inputs and enabled after required inputs.
- Download the PDF and confirm the logo, centered title/state, and bordered two-column table match the reference snapshot structure.
- Confirm `INFINITE — Managed by MEDELITE` appears through the logo/metadata and is not replaced by the facility name.
- Confirm the PDF contains all MVP fields.
- Confirm the Medicare Care Compare hyperlink is clickable.

## CMS Data Sources

The MVP currently uses the CMS Provider Information dataset:

| Dataset | ID | Purpose |
| --- | --- | --- |
| Provider Information | `4pq5-n9py` | Facility identity, address, certified beds, average residents per day, and star ratings |

CMS integration lives server-side under `src/lib/cms` and uses the Provider Data datastore endpoint `/provider-data/api/1/datastore/query/4pq5-n9py/0`. UI code should consume normalized internal types rather than CMS field names.

Successful CMS provider lookups use a short in-memory TTL cache of 5 minutes per server instance. Failed lookups, empty results, and invalid payloads are not cached.

## API Routes

### `GET /api/facility/[ccn]`

Looks up one facility by CMS Certification Number / CCN.

CCN validation:

- Required route parameter
- Trimmed before lookup
- Must be exactly 6 characters
- Preserved as a string, including leading zeros

Successful responses return a normalized `FacilityProfile` JSON object:

```ts
type FacilityProfile = {
  ccn: string;
  providerName: string;
  legalBusinessName: string | null;
  cmsDisplayName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    full: string;
  };
  certifiedBeds: number | null;
  averageResidentsPerDay: number | null;
  ratings: {
    overall: number | null;
    healthInspection: number | null;
    staffing: number | null;
    qualityOfResidentCare: number | null;
  };
  medicareUrl: string;
};
```

### Provider Information Mapping

| CMS field | Internal field |
| --- | --- |
| CMS Certification Number (CCN) | `ccn` |
| Provider Name | `providerName` |
| Legal Business Name | `legalBusinessName` |
| Provider Address | `address.street` |
| City/Town | `address.city` |
| State | `address.state` |
| ZIP Code | `address.zip` |
| Location | `address.full` |
| Number of Certified Beds | `certifiedBeds` |
| Average Number of Residents per Day | `averageResidentsPerDay` |
| Overall Rating | `ratings.overall` |
| Health Inspection Rating | `ratings.healthInspection` |
| Staffing Rating | `ratings.staffing` |
| QM Rating | `ratings.qualityOfResidentCare` |

The mapper accepts both CMS display-name fields and machine-style API keys where known. If `Legal Business Name` is missing, it falls back to `Provider Name`. If `Location` is missing, the address is composed from street, city, state, and ZIP. Missing numeric metrics normalize to `null`.

### API Error Handling

| Status | Code | Meaning |
| --- | --- | --- |
| `400` | `INVALID_CCN` | CCN is missing or not exactly 6 trimmed characters |
| `404` | `FACILITY_NOT_FOUND` | CMS returned no matching facility |
| `502` | `CMS_LOOKUP_FAILED` | CMS returned an error or invalid payload |
| `504` | `CMS_TIMEOUT` | CMS lookup exceeded the configured timeout |
| `500` | `FACILITY_SCHEMA_ERROR` | CMS data could not be normalized into `FacilityProfile` |

All API errors return a safe JSON shape:

```json
{
  "error": {
    "code": "INVALID_CCN",
    "message": "CCN must be exactly 6 characters."
  }
}
```

## Deployment

The app is ready for Vercel deployment as a standard Next.js App Router project.

Deploy from the Vercel dashboard or CLI:

```bash
npm install
npm run build
vercel deploy
```

No environment variables are required for the MVP. The app only calls public CMS Provider Data APIs and does not use a database.

Recommended Vercel settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave unset for Next.js
- Environment variables: none required

## MVP Assumptions

- CCNs are always preserved as strings because leading zeros are valid.
- Current Census is always a manual input.
- CMS `averageResidentsPerDay` can only prefill Current Census as a user-editable helper.
- `INFINITE — Managed by MEDELITE` is static brand text and is never replaced by facility names.
- Facility name override affects only report body display.
- Missing text fields render as `N/A`; missing numeric CMS values and ratings render as `—`.
- CMS provider lookup is server-side only.

## Known Limitations

- DOCX export is not implemented.
- Hospitalization and ED metrics are not implemented.
- PDF visual QA should be completed in a normal browser because the Codex in-app browser does not support file downloads.
- The uploaded branding PNG has not yet been integrated into the PDF or preview; current MVP uses the required static brand text.
- The CMS cache is in-memory per server instance and may not persist across serverless cold starts.
- `npm audit --audit-level=high` passes. A remaining moderate PostCSS advisory is nested under Next.js and npm currently suggests only a breaking `--force` path, so it is documented rather than force-applied.

## Bonus Checklist

- [ ] Hospitalization and ED metrics
- [ ] DOCX export
- [ ] Cards and charts
- [ ] Advanced CMS error handling and retry behavior

## Bonus Roadmap

- Add Medicare Claims Quality Measures and State US Averages datasets.
- Add hospitalization and ED visit metrics to the canonical report model.
- Add DOCX export from the canonical report model.
- Integrate the uploaded Medelite/INFINITE branding PNG into preview and export layouts.
- Add chart/card visualizations for ratings and future metric comparisons.
- Add deploy-time monitoring and structured logging for CMS failures.

## Test CCN

Use `686123` for the golden test facility during CMS integration and fixture-based tests.

## Branding Guardrail

The app and generated reports must always use the static brand text:

`INFINITE — Managed by MEDELITE`

Never replace `INFINITE` with the facility name, CMS provider name, legal business name, or manual override. Facility names belong only in report body fields such as `Name of Facility`.
