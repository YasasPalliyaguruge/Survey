# Survey

![Survey project cover](assets/recruiter/cover.png)

> **Portfolio lens:** A focused survey workflow that connects authoring, a public response path, and result review without burying the core interaction in dashboard noise.

Survey is a React/Vite application for creating surveys, sharing a public response link, collecting submissions, and reviewing results. Supabase stores the survey definitions and response records.

## Product workflow

1. Create a survey and its questions.
2. Share the generated `/survey/:id` route.
3. Collect responses through the public form.
4. Review response statistics and individual submissions from the dashboard.
5. Export response data as CSV or Excel when needed.

## Technology

- React and TypeScript
- Vite
- React Router
- Supabase/PostgreSQL
- Tailwind CSS and Radix UI
- Chart.js and Recharts
- SheetJS (`xlsx`) for Excel export

## Local setup

Use Node.js 20 or later.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Configure `.env.local` with your Supabase browser credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Apply the SQL under `supabase/migrations/` to a development Supabase project before using the data workflows.

## Quality checks

```bash
npm run lint
npm run build
```

GitHub Actions performs a clean install, a production-dependency audit, linting and the production build for pull requests and pushes to `main`.

The recruiter-readiness branch removed unused Firebase, Firestore, TanStack Table and React Router v5 type dependencies and regenerated the lockfile through npm. A clean CI install now audits 478 packages rather than 646. The production-only audit has no critical findings; its remaining findings are two moderate React Router advisories and one high advisory on the npm-distributed `xlsx` package.

Lint now completes with 0 errors and 7 non-blocking Fast Refresh warnings. Explicit `any` warnings in the shared chart wrapper and legacy SQLite abstraction were removed with concrete TypeScript/sql.js types.

A major React Router migration is intentionally not being forced solely to clear the audit. This application uses browser/declarative routing with internal application destinations, so a major-version migration should be handled with separate navigation regression testing.

Excel export remains an implemented feature. The application generates spreadsheets from already-loaded survey responses and does not accept spreadsheet uploads. CSV and Excel exports neutralise cells that could otherwise be interpreted as spreadsheet formulas; CSV output also escapes commas, quotes and line breaks correctly. The `xlsx` package is lazy-loaded only when Excel export is requested, so its code and advisory-bearing dependency are not part of the initial application chunk. This reduces startup cost but does not resolve the underlying `xlsx` advisory.

The main route bodies are also lazy-loaded. The verified production build now emits an initial application chunk of about 310 kB (99 kB gzip), separate Home/CreateSurvey/SurveyForm chunks, a separate Supabase chunk, and an on-demand `xlsx` chunk of about 429 kB (143 kB gzip). No generated JavaScript chunk exceeds Vite's 500 kB warning threshold.

## Main routes

- `/` — survey dashboard and response review
- `/create` — survey builder
- `/survey/:id` — public response form

## Security boundary

The committed Supabase migration uses permissive demonstration policies because the project does not currently include authentication or survey ownership. Do not deploy those policies with real or confidential data. See [SECURITY.md](SECURITY.md) for the production requirements and recommended authorization model.

The dependency audit is tracked separately in issue #3. The remaining production findings are non-critical, but they should still be reviewed before describing the application as production-ready.

## Deployment

`npm run deploy` publishes the built `dist` directory through `gh-pages`. Confirm the repository Pages configuration, application base URL, Supabase allowed origins, and production RLS policies before publishing.

## Current limitations

- No user authentication or ownership model
- Demonstration-only Row Level Security policies
- Remaining non-critical production dependency advisories tracked in issue #3
- The npm-distributed `xlsx` dependency currently has no npm audit fix for its remaining advisory
- No automated browser or integration tests yet
- No rate limiting for anonymous survey responses
- Seven non-blocking Fast Refresh lint warnings remain in shared component/provider modules
