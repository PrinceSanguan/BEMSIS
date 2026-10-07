<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# BEMSIS — project notes

Barangay Event Management & Information System, a portfolio demo. Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4,
shadcn/ui (Radix), motion and tsparticles, plus `qr-scanner` and `qrcode.react`. It is deployed on Vercel at https://bemsis.psanguan.com.

It was converted from a Laravel 12 + Inertia + MySQL app (`D:\PAMIGAY CAPSTONE\BEMSIS`). There is **no backend and no database**.

## Commands

```bash
npm run dev      # dev server
npm run build    # production build (must pass before deploying)
npm run lint     # ESLint (eslint-config-next, incl. React Compiler hook rules)
npm run types    # tsc --noEmit
```

## Architecture

### Data

- `data/*.json` is the read-only seed: users, puroks, events, attendances, certificates, feedback, announcements, and `site.json`.
- The seed is imported at build time. It is never read with `fs` and never written at runtime.
- All dates are local `YYYY-MM-DDTHH:mm:ss` strings. On first load they are shifted from `site.json.seed_anchor_date` to today, so past events
  stay past and upcoming events stay upcoming.

### Demo store (`src/lib/demo/store.ts`)

- It holds the visitor's database in memory and in localStorage. All tabs share the database through storage events.
- The signed-in user is stored **per tab** in sessionStorage, so different tabs can be signed in as different roles. That lets you scan a
  resident's QR in one tab as the Secretary.
- Server render and the first client render use the raw seed. Role pages only render after hydration (see `RoleShell`).

### Writes (`src/lib/demo/actions/*`)

- These are the only code that writes data. They replace the Laravel controllers.
- Each action validates with Laravel-style messages, makes an immutable `commit()`, calls `flash()`, and returns an `ActionResult`.
- Pure helpers live in `src/lib/domain/`: queries, sms templates, codes, validation.

### Reads (`src/lib/views/*.ts`)

- Each function mirrors one controller method and returns the same props the old `Inertia::render()` passed.
- Views call them inside `useMemo` on top of `useDb()`.

### Routes and pages

- `src/app/**/page.tsx` are server components that set `metadata` and render a client view from `src/components/<role>/*-view.tsx`.
- URLs match the old Laravel routes. `route(name, params)` in `src/lib/routes.ts` is a Ziggy drop-in that uses the same names.
- `src/lib/use-form.ts` is an Inertia-`useForm` look-alike that runs an action.

### Role areas and auth

- `src/app/{captain,secretary,partner}/layout.tsx` and `src/app/resident/(portal)/layout.tsx` render `RoleShell`. It provides the sidebar,
  header, flash alerts, the guard (the old role middleware), the demo "switch role" menu, and "Reset demo data".
- The public certificate pages are in `src/app/resident/(public)/` so they skip the guard.
- Auth is a demo login against `users.json`. All seeded passwords are `password123`, stored in plain text, and there are one-click demo
  buttons.
- The 5-attempt lockout, the OTP password reset (the code is shown in a "Demo inbox" on the page), registration with approval, and device
  tracking all work client-side.

### Uploads and simulated services

- Uploads (event posters, valid IDs, partner certificates) are stored in IndexedDB as `idb:<id>`. Use `useAssetUrl`, `<StoredImage>` or
  `openStoredFile` to show them.
- SMS is simulated: messages are written to `sms_logs`.
- The daily reminder job (`src/lib/demo/jobs.ts`) runs on the first load of each day.

## Conventions

### Formatting

- 4-space indent, single quotes, semicolons, lines up to about 150 characters (`.prettierrc`).
- Light theme only.

### Components

- Use `<Button asChild><Link/></Button>`. Never put a button inside a link.
- Use `ConfirmDialog` instead of `window.confirm`. Never trigger browser dialogs.

### Dates

- Use the helpers in `src/lib/format.ts`. For `datetime-local` inputs use `toDateTimeLocalInput` / `fromDateTimeLocalInput`, never `toISOString()`.

### QR codes

- Render QR codes locally with `qrcode.react`. Never call external QR services.
- Camera scanning goes through `useQrScanner` and always has a manual-entry fallback.

### Deployment constraints

- Keep everything static and Vercel-friendly: no server-side writes, no runtime filesystem access, no new backend services, no env vars
  required.
- `NEXT_PUBLIC_SITE_URL` is optional and overrides `https://bemsis.psanguan.com` for metadata.
- In Next 16 a proxy goes in `src/proxy.ts`, not `middleware.ts`. None is needed.
- No `tailwind.config.js`: Tailwind v4 is CSS-first (see `globals.css`).
