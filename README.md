<div align="center">

# BEMSIS

### Barangay Event Management & Information System

A barangay event and resident information system: event approval workflow, QR code attendance, certificates, announcements and
role-based dashboards for the Barangay Captain, Secretary, partner agencies and residents.

**Live demo: https://bemsis.psanguan.com**

</div>

---

## About this version

BEMSIS started as a Laravel 12 + Inertia + React + MySQL capstone project. This repository is the **portfolio edition**. It is rewritten in
**Next.js 16** so it can be hosted on Vercel for free with no server and no database:

- The demo data lives in **JSON files** under [`data/`](data).
- Each visitor gets their own copy of that data in the browser (localStorage). Approvals, new events, registrations, scans and feedback
  persist in that browser and never affect other visitors.
- **Reset demo data** (account menu, top-right) restores the original data at any time.
- Every Laravel controller has a matching function in [`src/lib/demo/actions`](src/lib/demo/actions), with the same validation rules and
  messages.

## Demo accounts

Open **/login** and click a role to sign in instantly, or use the role buttons on the landing page. Once inside, use the account menu to
**switch roles** without logging out.

| Role                         | Email                 | Password      |
| ---------------------------- | --------------------- | ------------- |
| **Captain** (admin)          | `captain@gmail.com`   | `password123` |
| **Secretary** (coordinator)  | `secretary@gmail.com` | `password123` |
| **Resident**                 | `resident@gmail.com`  | `password123` |
| **Partner agency**           | `partner@gmail.com`   | `password123` |

Additional accounts:
- Approved residents `resident2@gmail.com`, `resident4@gmail.com` and `resident5@gmail.com`.
- Pending accounts `resident3@gmail.com` and `partner2@gmail.com`, which are waiting for the Secretary's approval.

> **Tip:** each browser tab keeps its own login. Open the Secretary in one tab and the Resident in another to try the full QR attendance
> flow. The Resident copies their code and the Secretary enters it under Attendance → *Enter code manually*, or scans it with a camera.

## Features

**Event management and approval**
- The Secretary and partner agencies create events with a poster, venue, schedule, target puroks and an optional certificate.
- Duplicate-event detection (same venue, schedule and audience).
- The Captain approves or declines pending events. Approval sends an SMS to the targeted residents (simulated in the demo).
- Calendar and list views.

**QR code attendance**
- Each registration gets a QR code.
- The Secretary scans it with the camera, or types the code: the first scan records time-in (On-Time/Late), the second records time-out.
- Attendance rates per event, the attendee list, and a CSV export.

**Certificates and feedback**
- Residents who complete an event submit feedback with a rating.
- For events that offer a certificate, a certificate is issued with a unique code and a QR code.
- Certificates have a public, printable verification page (`/resident/certificates/view/<code>`).

**Users and roles**
- Resident and partner registration with valid-ID upload, Globe/TM phone validation and password rules.
- The Secretary approves registrations; the Captain and Secretary activate or deactivate accounts.
- Purok-scoped events and announcements.

**Security features (working client-side in the demo)**
- Account lockout after 5 failed logins (15 minutes).
- OTP password reset. The OTP appears in a "Demo inbox" because no email is sent.
- Trusted device tracking.

## Tech stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, Turbopack), React 19, TypeScript     |
| Styling    | Tailwind CSS 4, shadcn/ui (Radix UI), lucide-react           |
| Motion     | motion, tsparticles                                          |
| QR         | `qrcode.react` (generate), `qr-scanner` (camera)             |
| Data       | JSON seed + per-visitor localStorage store, IndexedDB uploads |
| Hosting    | Vercel                                                       |

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm run lint`, `npm run types`, `npm run format`.

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` is optional; it overrides the site URL used in link previews (default
`https://bemsis.psanguan.com`).

## Deploying to Vercel (bemsis.psanguan.com)

1. Push this folder to a GitHub repository.
2. On [vercel.com/new](https://vercel.com/new), import the repository. Vercel detects Next.js, so keep the defaults and deploy.
3. In **Project → Settings → Domains**, add `bemsis.psanguan.com`.
4. At the DNS provider for `psanguan.com`, add the record Vercel shows. For a subdomain this is usually:
   `CNAME  bemsis  cname.vercel-dns.com`
5. Wait for Vercel to issue the HTTPS certificate. The camera QR scanner needs HTTPS, which Vercel provides.

## Editing the demo data

The seed is plain JSON. Edit it, then redeploy. Visitors' saved data is discarded automatically when the seed changes.

| File                      | Contents                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `data/site.json`          | Barangay name/address, captain's name, late threshold, lockout and OTP settings, seed anchor date |
| `data/users.json`         | Accounts for every role (plain-text demo passwords)                                          |
| `data/puroks.json`        | Purok 1–7                                                                                    |
| `data/events.json`        | Events (status `pending`/`approved`/`declined`, `purok_ids: null` = all residents)           |
| `data/attendances.json`   | Registrations with QR codes and time-in/time-out                                             |
| `data/certificates.json`  | Issued certificates                                                                          |
| `data/feedback.json`      | Feedback and ratings                                                                         |
| `data/announcements.json` | Announcements (`target_puroks: null` = all puroks)                                           |

Dates in the seed are written relative to `seed_anchor_date`. On each visitor's first load they are shifted to the current day, so past
events stay in the past and upcoming events stay upcoming.

## Project structure

```
data/                        JSON seed (the "database")
public/assets/images/        landing art, certificate seals and signature
src/app/                     routes (same URLs as the Laravel app)
  captain/ secretary/ partner/ resident/(portal)/   role areas (guarded by RoleShell)
  resident/(public)/certificates/                   public certificate view + preview
src/components/<role>/       page views ported from resources/js/pages
src/components/layout/       RoleShell: sidebar, header, guard, demo menu
src/lib/demo/                browser store, actions (controllers), flash, uploads, daily jobs
src/lib/domain/              queries, validation, SMS templates, codes
src/lib/views/               page data builders (what each controller passed to Inertia)
```

## How the demo backend works

```
data/*.json ──(build-time import)──▶ seed ──(first visit: shift dates)──▶ localStorage "bemsis:db:<version>"
                                                                              │   ▲
                                         useDb() / view builders ◀────────────┘   │ commit()
                                                                                  │
                         UI ──▶ actions (validate → new DB → flash) ──────────────┘
```

Things that needed a server in the Laravel app are simulated:

- **SMS:** messages are stored in `sms_logs`.
- **Email:** the OTP is shown on the page.
- **Scheduler:** event reminders run on the first visit of each day.

## License

MIT. See [LICENSE](LICENSE).

Built by [Prince Sanguan](https://github.com/PrinceSanguan).
