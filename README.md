# DocToObject MVP

Public SaaS MVP for processing PDF, DOCX, and XLSX documents into JSON, Markdown, CSV, or Summary output with optional custom AI instructions.

## Stack

- Next.js App Router + TypeScript + Tailwind
- Prisma + SQLite
- Auth.js (credentials flow)
- Redis + BullMQ for background jobs
- OpenAI for AI extraction/formatting

## Setup

1. Copy env template:

```bash
copy .env.example .env
```

Set these if you want analytics and canonical SEO URLs:

- `NEXT_PUBLIC_SITE_URL` (production app URL, e.g. `https://example.com`)
- `NEXT_PUBLIC_GA_ID` (Google Analytics Measurement ID)

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and migrate:

```bash
npm run prisma:generate
npx prisma migrate dev --name init
```

4. Start app:

```bash
npm run dev
```

5. Start worker (separate terminal):

```bash
npm run worker
```

## Implemented MVP Surface

- Public pages: `/`, `/contact`, `/login`, `/register`
- Private pages: `/dashboard`, `/dashboard/upload`, `/dashboard/documents`, `/dashboard/documents/[id]`, `/dashboard/history`, `/dashboard/settings`
- API routes:
  - `POST /api/contact`
  - `POST /api/upload`
  - `POST /api/process`
  - `GET /api/documents`
  - `GET /api/documents/:id`
  - `GET /api/documents/:id/export`
  - `GET /api/me/usage`
  - `POST /api/cron/cleanup` (requires `x-cleanup-secret`)

## Notes

- Tries are consumed only after a document is accepted and queued.
- Uploaded files are stored in local filesystem under `uploads/`.
- Cleanup route marks expired documents as deleted and removes physical files.