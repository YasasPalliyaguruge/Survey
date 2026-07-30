# Survey

![Survey project cover](assets/recruiter/cover.png)

> **Portfolio lens:** A focused survey workflow that connects authoring, a public response path, and result review without burying the core interaction in dashboard noise.

Survey is a React/Vite application for creating surveys, sharing a public `/survey/:id` link, collecting responses, and reviewing the results. The app stores surveys and responses in Supabase.

## Before running it

Create a local environment file with the Supabase browser credentials used by the app:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The client can create, update, and delete surveys and can submit responses. Configure Row Level Security in Supabase before exposing the application publicly; the browser key is not a substitute for database access rules.

## Run locally

```bash
npm ci
npm run dev
```

The dev server prints the local URL. Use `npm run build` for a production bundle and `npm run lint` for the ESLint check.

## Main routes

- `/` — survey dashboard
- `/create` — survey builder
- `/survey/:id` — public response form

`npm run deploy` publishes the built `dist` directory through `gh-pages`. Confirm the repository Pages configuration and the application base URL before using it.
