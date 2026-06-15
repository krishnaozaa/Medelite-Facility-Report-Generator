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
- [ ] Manual operational input form
- [ ] Facility assessment snapshot preview
- [ ] PDF export with `@react-pdf/renderer`
- [ ] Error, loading, and empty states for the full workflow

## CMS Data Sources

The MVP currently uses the CMS Provider Information dataset:

| Dataset | ID | Purpose |
| --- | --- | --- |
| Provider Information | `4pq5-n9py` | Facility identity, address, certified beds, average residents per day, and star ratings |

CMS integration lives server-side under `src/lib/cms`. UI code should consume normalized internal types rather than CMS field names.

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

## Bonus Checklist

- [ ] Hospitalization and ED metrics
- [ ] DOCX export
- [ ] Cards and charts
- [ ] Advanced CMS error handling and retry behavior

## Test CCN

Use `686123` for the golden test facility during CMS integration and fixture-based tests.

## Branding Guardrail

The app and generated reports must always use the static brand text:

`INFINITE — Managed by MEDELITE`

Never replace `INFINITE` with the facility name, CMS provider name, legal business name, or manual override. Facility names belong only in report body fields such as `Name of Facility`.
