# Survey

![Survey project cover](assets/recruiter/cover.png)

> **Portfolio lens:** A focused survey workflow that connects authoring, a public response path, and result review without burying the core interaction in dashboard noise.

Survey is a React/Vite application for creating surveys, sharing a public response link, collecting submissions, and reviewing results. Supabase stores the survey definitions and response records.

## Product workflow

1. Create a survey and its questions.
2. Share the generated `/survey/:id` route.
3. Collect responses through the public form.
4. Review response statistics and individual submissions from the dashboard.

## Technology

- React and TypeScript
- Vite
- React Router
- Supabase/PostgreSQL
- Tailwind CSS and Radix UI
- Chart.js and Recharts

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

The same checks run in GitHub Actions for pull requests and pushes to `main`.

## Main routes

- `/` — survey dashboard and response review
- `/create` — survey builder
- `/survey/:id` — public response form

## Security boundary

The committed Supabase migration uses permissive demonstration policies because the project does not currently include authentication or survey ownership. Do not deploy those policies with real or confidential data. See [SECURITY.md](SECURITY.md) for the production requirements and recommended authorization model.

## Deployment

`npm run deploy` publishes the built `dist` directory through `gh-pages`. Confirm the repository Pages configuration, application base URL, Supabase allowed origins, and production RLS policies before publishing.

## Current limitations

- No user authentication or ownership model
- Demonstration-only Row Level Security policies
- No automated browser or integration tests yet
- No rate limiting for anonymous survey responses
