# CLAUDE.md — ClientPulse Agent Instructions

> This file is the single source of truth for the AI coding agent working on **ClientPulse**.
> Read this **fully** before writing any code, making any architectural decisions, or suggesting changes.
> The project was scaffolded with [better-t-stack](https://www.better-t-stack.dev/) — respect the conventions it established.

---

## 🚦 BUILD STATUS — READ THIS FIRST

Last updated: March 15, 2026 — PR #7 merged to master.

### ✅ COMPLETED (all merged to master)
- Monorepo scaffolded via better-t-stack
- Auth system: email/password + Google OAuth + Microsoft OAuth + 2FA (PRs #1–5)
- DB schema: all business models in `packages/db/prisma/schema/schema.prisma`, migration run
- `packages/env` server + web env vars fully expanded
- `apps/server/src/index.ts`: Hono with tRPC, Better Auth, CORS, portal REST routes, webhooks
- `packages/api/src/context.ts`: session + db + workspace resolution per request
- All 8 tRPC routers: `workspace`, `clients`, `projects`, `deliverables`, `feedback`, `invoices`, `team`, `notifications`
- Server services: `email.ts` (Resend), `storage.ts` (R2), `stripe.ts`
- Portal REST routes: `apps/server/src/routes/portal.ts`
- Stripe webhook: `apps/server/src/routes/webhooks/stripe.ts`
- shadcn UI components installed in `packages/ui`: button, card, checkbox, dialog, dropdown-menu, field, input-otp, input, label, separator, skeleton, sonner, avatar, badge, progress, select, sheet, sidebar, tabs, textarea, tooltip
- `apps/web/src/proxy.ts` — Next.js 16 auth guard (replaces middleware.ts)
- Dashboard layout: `SidebarProvider` + `AppSidebar` + `SidebarInset`
- Dashboard home page with stats cards + recent projects/invoices

### ❌ NOT STARTED — FRONTEND PAGES (do these in order)
- **Branch 12**: Clients pages — `dashboard/clients/page.tsx` (list) + `dashboard/clients/[id]/page.tsx` (detail) + `components/clients/`
- **Branch 13**: Projects pages — `dashboard/projects/page.tsx` + `new/` + `[id]/` + `[id]/settings/` + `components/projects/`
- **Branch 14**: Deliverables upload UI — `components/projects/deliverable-upload.tsx`, `deliverable-row.tsx`, `portal-link-copier.tsx`
- **Branch 15**: Client Portal — `app/portal/[token]/page.tsx` + feedback + invoice subpages + `components/portal/`
- **Branch 16**: Invoices pages — `dashboard/invoices/` list + create + detail + `components/invoices/`
- **Branch 17**: Settings page — `dashboard/settings/page.tsx` + `dashboard/team/page.tsx`
- **Branch 18**: Shared utilities — `lib/constants.ts`, `lib/utils.ts`, `hooks/use-workspace.ts`, `hooks/use-plan-gate.ts`, `hooks/use-portal.ts`, `components/shared/`
- **Branch 19**: Email templates package — `packages/email-templates/`
- **Branch 20**: Background jobs — `apps/server/src/jobs/` (invoice-reminder, mark-overdue, send-approval-request) + `apps/server/src/services/pdf.ts`
- **Branch 21**: Polish — empty states, error boundaries, mobile responsiveness

### ⚠️ CRITICAL TECHNICAL NOTES FOR NEXT AGENT
1. **Next.js 16** is installed (CLAUDE.md originally said 15) — uses `proxy.ts` NOT `middleware.ts`. The exported function is `export default async function proxy`. `typedRoutes: true` is set in `next.config.ts` so Link `href` must be typed — use `href={"/path" as any}` when needed.
2. **Package manager is `bun`** (not pnpm). All install commands use `bun add`, run commands use `bun`.
3. **Base UI components** — `dropdown-menu.tsx` and `sidebar.tsx` in `packages/ui` use `@base-ui/react`. These do NOT support `asChild` prop. Use the `render` prop instead: `<SidebarMenuButton render={<Link href={"/path" as any} />}>`. `DropdownMenuTrigger` also uses `render` prop.
4. **Auth pages** are at `apps/web/src/app/(auth)/sign-in/` and `(auth)/sign-up/` — not `/login/` or `/register/`.
5. **Git workflow** — every branch MUST be individually pushed and merged via its own PR before moving to the next. Do NOT bundle multiple branches into one PR.
6. **`pdf.ts` service** and **`apps/server/src/jobs/`** have not been created yet.
7. **`packages/email-templates/`** package does not exist yet — needs to be created.

---

---

## 🧭 Project Overview

**ClientPulse** is a B2B SaaS platform for freelancers and small agencies. It gives them a
professional client portal where clients can review deliverables, approve work, leave feedback,
and pay invoices — all through a single shareable link, with no client account required.

**Target Users:** Solo freelancers (designers, developers, copywriters, consultants) and small agencies (2–10 people).

**Core Value Proposition:** Replace WhatsApp chaos, email threads, and Google Drive links with one clean, professional portal per project.

---

## 🏗️ Tech Stack

### Frontend — `apps/web`
- **Framework:** Next.js 16 with App Router (`typedRoutes: true` — use `href={path as any}` when needed)
- **Auth Guard:** `src/proxy.ts` (Next.js 16 — replaces `middleware.ts`; export is `export default async function proxy`)
- **Language:** TypeScript strict mode — no `any` unless explicitly justified
- **Styling:** Tailwind CSS v4 + shared `packages/ui` (shadcn/ui components)
- **API Layer:** tRPC client via `src/utils/trpc.ts` — **all server calls go through tRPC, never raw fetch to the server**
- **Auth Client:** Better Auth via `src/lib/auth-client.ts`
- **State:** TanStack Query (bundled with tRPC) for server state; Zustand for local UI state
- **Forms:** React Hook Form + Zod (schemas live in `packages/api`)
- **Rich Text:** Tiptap (feedback/comments)
- **Date Handling:** date-fns — never moment.js
- **Icons:** Lucide React
- **Toasts:** Sonner (already in `packages/ui/src/components/sonner.tsx`)

### Backend — `apps/server`
- **Runtime:** Node.js, built with tsdown (`tsdown.config.ts`)
- **HTTP Framework:** Hono.js — serves both the tRPC handler AND standalone REST routes (portal, webhooks)
- **Entry point:** `apps/server/src/index.ts`
- **tRPC router:** mounted from `packages/api` — imported into the Hono server
- **File Storage:** Cloudflare R2 via AWS S3-compatible SDK
- **Email:** Resend + React Email templates
- **Background Jobs:** Trigger.dev v3
- **PDF Generation:** @react-pdf/renderer (invoice PDFs)

### API / tRPC — `packages/api`
- **Router index:** `packages/api/src/index.ts` — root `appRouter`, exported for both server and client
- **Sub-routers:** one file per domain inside `packages/api/src/routers/`
- **Context:** `packages/api/src/context.ts` — resolved per-request (session, db, workspace)
- **Validation:** Zod schemas defined inside each router file (or a co-located `*.schema.ts`)
- **Rule:** Every public procedure that touches workspace data must call `requireWorkspace(ctx)` first

### Auth — `packages/auth`
- **Library:** Better Auth (`packages/auth/src/index.ts`)
- **Strategy:** Email + password (primary), Google OAuth (secondary)
- **Sessions:** Stored in Postgres via Better Auth's DB adapter (maps to `auth.prisma` schema)
- **Multi-tenancy:** Each user creates one `Workspace` on first login. `WorkspaceMember` links users to workspaces with roles.
- **Client Portal:** Token-based only — no Better Auth session. Each `Project` has a unique `portalToken`. Clients receive `https://clientpulse.io/portal/[token]`. The token is validated on the Hono server in a dedicated REST route (NOT tRPC).

### Database — `packages/db`
- **ORM:** Prisma (`packages/db/src/index.ts` exports the Prisma client singleton)
- **Schema:** Split files in `packages/db/prisma/schema/`
  - `auth.prisma` — Better Auth managed tables (User, Session, Account, Verification) — **never edit manually**
  - `schema.prisma` — All ClientPulse business models (Workspace, Project, etc.)
- **Config:** `packages/db/prisma.config.ts`
- **Migrations:** `prisma migrate dev` only — never edit the DB manually
- **Seed:** Add `packages/db/prisma/seed.ts` for dev data

### Environment — `packages/env`
- **Server env:** `packages/env/src/server.ts` — Zod-validated server-side env vars
- **Web env:** `packages/env/src/web.ts` — Zod-validated public env vars (`NEXT_PUBLIC_*`)
- **Rule:** Never access `process.env` directly anywhere in the codebase. Always import from `packages/env`.

### Shared UI — `packages/ui`
- shadcn/ui primitive components live here (Button, Card, Input, etc.)
- `packages/ui/src/styles/globals.css` — global styles + Tailwind variables
- When adding new shadcn components: run the CLI inside `packages/ui`, not inside `apps/web`

### Tooling
- **Monorepo:** Turborepo (`turbo.json`)
- **Linter/Formatter:** Biome (`biome.json`) — no ESLint, no Prettier
- **Package Manager:** `bun` — use `bun add`, `bun run`, never `npm` or `pnpm`
- **Build:** `tsdown` for the server (`apps/server/tsdown.config.ts`)

### UI Components — Important
- `packages/ui` uses `@base-ui/react` for `dropdown-menu` and `sidebar` components
- These do NOT support `asChild` — use `render` prop: `<SidebarMenuButton render={<Link href={path as any} />}>`
- `DropdownMenuTrigger` also uses `render` prop, not `asChild`

---

## 📁 Complete Target Project Structure

Files that already exist are marked ✅. Files to be created are unmarked.

```
client-pulse/
├── CLAUDE.md                               ✅
├── README.md                               ✅
├── biome.json                              ✅
├── bts.jsonc                               ✅
├── package.json                            ✅
├── tsconfig.json                           ✅
├── turbo.json                              ✅
│
├── apps/
│   ├── server/                             ✅
│   │   ├── package.json                    ✅
│   │   ├── tsconfig.json                   ✅
│   │   ├── tsdown.config.ts                ✅
│   │   └── src/
│   │       ├── index.ts                    ✅ (tRPC + Better Auth + CORS + portal routes + webhooks)
│   │       ├── routes/
│   │       │   ├── portal.ts               ✅ (all portal REST endpoints)
│   │       │   └── webhooks/
│   │       │       └── stripe.ts           ✅ (Stripe webhook handler)
│   │       ├── services/
│   │       │   ├── email.ts                ✅ (Resend wrapper)
│   │       │   ├── storage.ts              ✅ (Cloudflare R2)
│   │       │   ├── stripe.ts               ✅ (Stripe helpers)
│   │       │   └── pdf.ts                  ❌ NOT CREATED YET
│   │       └── jobs/                       ❌ NOT CREATED YET
│   │           ├── invoice-reminder.ts
│   │           ├── mark-overdue.ts
│   │           └── send-approval-request.ts
│   │
│   └── web/                                ✅
│       ├── package.json                    ✅
│       ├── next.config.ts                  ✅ (typedRoutes: true, reactCompiler: true)
│       ├── tsconfig.json                   ✅
│       ├── components.json                 ✅
│       └── src/
│           ├── proxy.ts                    ✅ (Next.js 16 auth guard — replaces middleware.ts)
│           ├── app/
│           │   ├── favicon.ico             ✅
│           │   ├── layout.tsx              ✅ (simplified — just Providers wrapper)
│           │   ├── page.tsx                ✅ (redirect → /dashboard)
│           │   ├── (auth)/
│           │   │   ├── sign-in/page.tsx    ✅
│           │   │   └── sign-up/page.tsx    ✅
│           │   ├── profile/page.tsx        ✅
│           │   └── dashboard/
│           │       ├── layout.tsx          ✅ (SidebarProvider + AppSidebar + SidebarInset)
│           │       ├── page.tsx            ✅ (stats cards + recent projects/invoices)
│           │       ├── clients/
│           │       │   ├── page.tsx        ❌ Branch 12
│           │       │   └── [id]/page.tsx   ❌ Branch 12
│           │       ├── projects/
│           │       │   ├── page.tsx        ❌ Branch 13
│           │       │   ├── new/page.tsx    ❌ Branch 13
│           │       │   └── [id]/
│           │       │       ├── page.tsx    ❌ Branch 13
│           │       │       └── settings/page.tsx ❌ Branch 13
│           │       ├── invoices/
│           │       │   ├── page.tsx        ❌ Branch 16
│           │       │   ├── new/page.tsx    ❌ Branch 16
│           │       │   └── [id]/page.tsx   ❌ Branch 16
│           │       ├── team/page.tsx       ❌ Branch 17
│           │       └── settings/page.tsx   ❌ Branch 17
│           ├── app/portal/                 ❌ Branch 15 — NO auth proxy, public
│           │   └── [token]/
│           │       ├── page.tsx
│           │       ├── feedback/page.tsx
│           │       └── invoice/[invoiceId]/page.tsx
│           ├── components/
│           │   ├── header.tsx              ✅
│           │   ├── loader.tsx              ✅
│           │   ├── mode-toggle.tsx         ✅
│           │   ├── providers.tsx           ✅
│           │   ├── theme-provider.tsx      ✅
│           │   ├── user-menu.tsx           ✅
│           │   ├── dashboard/
│           │   │   └── sidebar.tsx         ✅ (AppSidebar — uses render prop, not asChild)
│           │   ├── clients/                ❌ Branch 12
│           │   │   ├── client-form.tsx
│           │   │   └── client-card.tsx
│           │   ├── projects/               ❌ Branch 13 + 14
│           │   │   ├── project-form.tsx
│           │   │   ├── deliverable-row.tsx
│           │   │   ├── deliverable-upload.tsx
│           │   │   └── portal-link-copier.tsx
│           │   ├── invoices/               ❌ Branch 16
│           │   │   ├── invoice-builder.tsx
│           │   │   ├── invoice-line-items.tsx
│           │   │   └── currency-input.tsx
│           │   ├── portal/                 ❌ Branch 15
│           │   │   ├── portal-header.tsx
│           │   │   ├── deliverable-card.tsx
│           │   │   ├── approval-dialog.tsx
│           │   │   ├── feedback-composer.tsx
│           │   │   └── invoice-view.tsx
│           │   └── shared/                 ❌ Branch 18
│           │       ├── empty-state.tsx
│           │       ├── file-preview.tsx
│           │       ├── status-badge.tsx
│           │       └── upgrade-modal.tsx
│           ├── lib/
│           │   ├── auth-client.ts          ✅
│           │   ├── auth-utils.ts           ✅
│           │   ├── constants.ts            ❌ Branch 18 (PLAN_LIMITS, ALLOWED_MIME_TYPES)
│           │   └── utils.ts                ❌ Branch 18 (formatCurrency, formatDate, cn)
│           ├── hooks/
│           │   ├── use-workspace.ts        ❌ Branch 18
│           │   ├── use-plan-gate.ts        ❌ Branch 18
│           │   └── use-portal.ts           ❌ Branch 18
│           └── utils/
│               └── trpc.ts                 ✅
│
└── packages/
    ├── api/                                ✅
    │   ├── package.json                    ✅
    │   ├── tsconfig.json                   ✅
    │   └── src/
    │       ├── index.ts                    ✅ (full appRouter + healthCheck)
    │       ├── context.ts                  ✅ (session + db + workspace per request)
    │       └── routers/
    │           ├── index.ts                ✅
    │           ├── workspace.ts            ✅
    │           ├── projects.ts             ✅
    │           ├── deliverables.ts         ✅
    │           ├── feedback.ts             ✅
    │           ├── invoices.ts             ✅
    │           ├── clients.ts              ✅
    │           ├── team.ts                 ✅
    │           └── notifications.ts        ✅
    │
    ├── auth/                               ✅
    │   └── src/index.ts                    ✅ (email + Google + Microsoft OAuth + 2FA)
    │
    ├── db/                                 ✅
    │   ├── prisma/schema/
    │   │   ├── auth.prisma                 ✅ DO NOT EDIT
    │   │   └── schema.prisma               ✅ (all business models)
    │   └── src/index.ts                    ✅ (PrismaClient singleton)
    │
    ├── env/                                ✅
    │   └── src/
    │       ├── server.ts                   ✅ (DATABASE_URL, BETTER_AUTH_*, GOOGLE_*, MICROSOFT_*, STRIPE_*, RESEND_*, R2_*)
    │       └── web.ts                      ✅ (NEXT_PUBLIC_SERVER_URL, NEXT_PUBLIC_WEB_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    │
    ├── config/                             ✅
    │
    ├── ui/                                 ✅
    │   └── src/
    │       ├── components/                 ✅ (button, card, checkbox, dialog, dropdown-menu,
    │       │                                  field, input-otp, input, label, separator,
    │       │                                  skeleton, sonner, avatar, badge, progress,
    │       │                                  select, sheet, sidebar, tabs, textarea, tooltip)
    │       ├── hooks/use-mobile.ts         ✅
    │       ├── lib/utils.ts                ✅
    │       └── styles/globals.css          ✅
    │
    └── email-templates/                    ❌ Branch 19 — create this package
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── welcome.tsx
            ├── portal-invite.tsx
            ├── approval-request.tsx
            ├── approval-received.tsx
            ├── changes-requested.tsx
            ├── feedback-received.tsx
            ├── invoice-sent.tsx
            ├── invoice-paid.tsx
            └── invoice-reminder.tsx
```

---

## 🗄️ Database Schema

> Add everything below to `packages/db/prisma/schema/schema.prisma`.
> Never touch `auth.prisma` — Better Auth owns it.
> Do NOT add a `datasource` or `generator` block here — they already exist in `auth.prisma`.

```prisma
// packages/db/prisma/schema/schema.prisma

// ─── MULTI-TENANCY ────────────────────────────────────────────────────────────

model Workspace {
  id                   String    @id @default(cuid())
  name                 String
  slug                 String    @unique
  logoUrl              String?
  plan                 Plan      @default(FREE)
  defaultCurrency      String    @default("USD")
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  members       WorkspaceMember[]
  projects      Project[]
  clients       Client[]
  invoices      Invoice[]
  notifications NotificationPreference?
}

model WorkspaceMember {
  id          String        @id @default(cuid())
  workspaceId String
  userId      String        // references User.id from auth.prisma
  role        WorkspaceRole @default(MEMBER)
  createdAt   DateTime      @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@index([userId])
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

model Client {
  id          String   @id @default(cuid())
  workspaceId String
  name        String
  email       String
  company     String?
  phone       String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  projects  Project[]
  invoices  Invoice[]

  @@unique([workspaceId, email])
  @@index([workspaceId])
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

model Project {
  id            String        @id @default(cuid())
  workspaceId   String
  clientId      String
  name          String
  description   String?
  status        ProjectStatus @default(ACTIVE)
  portalToken   String        @unique @default(cuid())
  portalEnabled Boolean       @default(true)
  deadline      DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  workspace    Workspace        @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  client       Client           @relation(fields: [clientId], references: [id])
  deliverables Deliverable[]
  feedback     FeedbackThread[]
  invoices     Invoice[]
  activities   Activity[]

  @@index([workspaceId])
  @@index([portalToken])
}

// ─── DELIVERABLES ─────────────────────────────────────────────────────────────

model Deliverable {
  id          String            @id @default(cuid())
  projectId   String
  name        String
  description String?
  status      DeliverableStatus @default(PENDING_REVIEW)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  project  Project              @relation(fields: [projectId], references: [id], onDelete: Cascade)
  versions DeliverableVersion[]

  @@index([projectId])
}

model DeliverableVersion {
  id            String    @id @default(cuid())
  deliverableId String
  versionNumber Int
  fileUrl       String    // Public R2 URL
  fileKey       String    // R2 object key (for deletion)
  fileName      String
  fileSize      Int       // bytes
  mimeType      String
  uploadedAt    DateTime  @default(now())
  approvedAt    DateTime?
  rejectedAt    DateTime?
  clientNote    String?

  deliverable Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)

  @@unique([deliverableId, versionNumber])
  @@index([deliverableId])
}

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────

model FeedbackThread {
  id        String         @id @default(cuid())
  projectId String
  title     String
  status    FeedbackStatus @default(OPEN)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  project  Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  messages FeedbackMessage[]

  @@index([projectId])
}

model FeedbackMessage {
  id          String     @id @default(cuid())
  threadId    String
  authorName  String
  authorType  AuthorType
  body        String     // sanitized HTML from Tiptap
  attachments String[]   // R2 public URLs
  createdAt   DateTime   @default(now())

  thread FeedbackThread @relation(fields: [threadId], references: [id], onDelete: Cascade)

  @@index([threadId])
}

// ─── INVOICES ─────────────────────────────────────────────────────────────────

model Invoice {
  id                    String        @id @default(cuid())
  workspaceId           String
  clientId              String
  projectId             String?
  invoiceNumber         String        // e.g. INV-0042 — auto-generated per workspace
  status                InvoiceStatus @default(DRAFT)
  currency              String        @default("USD")
  lineItems             Json          // { description: string, quantity: number, unitPrice: number }[]
  subtotal              Int           // cents
  taxPercent            Float         @default(0)
  taxAmount             Int           @default(0)
  total                 Int           // cents
  dueDate               DateTime?
  paidAt                DateTime?
  notes                 String?
  stripePaymentLinkId   String?
  stripePaymentLinkUrl  String?
  stripePaymentIntentId String?
  pdfKey                String?       // R2 key for generated PDF
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id])
  client    Client    @relation(fields: [clientId], references: [id])
  project   Project?  @relation(fields: [projectId], references: [id])

  @@index([workspaceId])
  @@index([clientId])
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────

model Activity {
  id        String       @id @default(cuid())
  projectId String
  type      ActivityType
  actorName String
  actorType AuthorType
  metadata  Json?
  createdAt DateTime     @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

model NotificationPreference {
  id            String  @id @default(cuid())
  workspaceId   String  @unique
  onApproval    Boolean @default(true)
  onRejection   Boolean @default(true)
  onFeedback    Boolean @default(true)
  onInvoicePaid Boolean @default(true)
  emailEnabled  Boolean @default(true)

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum Plan {
  FREE
  PRO
  AGENCY
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
  ON_HOLD
}

enum DeliverableStatus {
  PENDING_REVIEW
  APPROVED
  CHANGES_REQUESTED
  SUPERSEDED
}

enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PAID
  OVERDUE
  CANCELLED
}

enum FeedbackStatus {
  OPEN
  RESOLVED
}

enum AuthorType {
  FREELANCER
  CLIENT
}

enum ActivityType {
  PROJECT_CREATED
  DELIVERABLE_UPLOADED
  DELIVERABLE_APPROVED
  DELIVERABLE_REJECTED
  FEEDBACK_LEFT
  INVOICE_SENT
  INVOICE_PAID
  CLIENT_VIEWED_PORTAL
}
```

---

## 🔐 Authentication Architecture

### Freelancer Auth (Better Auth — `packages/auth/src/index.ts`)
- Email/password + Google OAuth
- Sessions stored in Postgres (auth.prisma tables, managed by Better Auth)
- Better Auth handler mounted in Hono:
  ```typescript
  // apps/server/src/index.ts
  app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw))
  ```
- On first login → frontend calls `workspace.create` tRPC mutation to bootstrap the workspace + OWNER member record

### Client Portal Auth (Token — no account needed)
- `Project.portalToken` is a cuid — the token IS the credential
- Portal URL format: `https://clientpulse.io/portal/[token]`
- Portal data fetched via **REST routes in Hono** (not tRPC) — see `/portal/:token/*` below
- Validated by DB lookup: `prisma.project.findUnique({ where: { portalToken: token } })`
- Freelancer can regenerate the token via `projects.regenerateToken` tRPC mutation
- Rate limited: 60 req/min per IP via Upstash Redis

### Plan Gating
```typescript
// packages/api/src/trpc.ts
export const PLAN_LIMITS = {
  FREE:   { maxProjects: 2,        maxTeamMembers: 1,  customBranding: false, invoicePayments: false, maxFileMb: 25  },
  PRO:    { maxProjects: Infinity, maxTeamMembers: 1,  customBranding: true,  invoicePayments: true,  maxFileMb: 100 },
  AGENCY: { maxProjects: Infinity, maxTeamMembers: 10, customBranding: true,  invoicePayments: true,  maxFileMb: 500 },
} as const
```
Always enforce on the **server** inside tRPC procedures. Frontend gates are UX only, not security.

---

## 🔌 tRPC Router Map

All routers in `packages/api/src/routers/`. Root `appRouter` in `packages/api/src/index.ts`.
The Hono server mounts tRPC at `/trpc`.

### `workspace` router
| Procedure | Type | Description |
|-----------|------|-------------|
| `workspace.create` | mutation | Create workspace + OWNER member on first login |
| `workspace.get` | query | Get current user's workspace |
| `workspace.update` | mutation | Update name, logo, currency, slug |
| `workspace.getBillingPortalUrl` | mutation | Stripe billing portal redirect URL |

### `projects` router
| Procedure | Type | Description |
|-----------|------|-------------|
| `projects.list` | query | List with filters (status, search) |
| `projects.get` | query | Single project with deliverables + activity |
| `projects.create` | mutation | Create — enforces FREE plan 2-project limit |
| `projects.update` | mutation | Update name, status, deadline, description |
| `projects.archive` | mutation | Set status to ARCHIVED |
| `projects.regenerateToken` | mutation | New portalToken → invalidates old client link |

### `deliverables` router
| Procedure | Type | Description |
|-----------|------|-------------|
| `deliverables.list` | query | List for a project (with versions) |
| `deliverables.create` | mutation | Create deliverable slot |
| `deliverables.presignUpload` | mutation | Validate + return R2 presigned PUT URL + fileKey |
| `deliverables.confirmUpload` | mutation | Create DeliverableVersion after upload; trigger email job |
| `deliverables.delete` | mutation | Delete deliverable + R2 objects |

### `feedback` router
| Procedure | Type | Description |
|-----------|------|-------------|
| `feedback.listThreads` | query | All threads for a project |
| `feedback.getThread` | query | Thread + messages |
| `feedback.createThread` | mutation | New thread (from freelancer dashboard) |
| `feedback.postMessage` | mutation | Post message (freelancer side) |
| `feedback.resolveThread` | mutation | Mark thread resolved |

### `invoices` router
| Procedure | Type | Description |
|-----------|------|-------------|
| `invoices.list` | query | List with status filter |
| `invoices.get` | query | Single invoice |
| `invoices.create` | mutation | Create draft |
| `invoices.update` | mutation | Update draft (line items, dates, notes) |
| `invoices.send` | mutation | Finalize + Stripe Payment Link + email client |
| `invoices.markPaid` | mutation | Manually mark paid (no Stripe) |
| `invoices.generatePdf` | mutation | Render PDF → R2 → return signed URL |
| `invoices.cancel` | mutation | Cancel draft or sent invoice |

### `clients` router
| Procedure | Type | Description |
|-----------|------|-------------|
| `clients.list` | query | All workspace clients |
| `clients.get` | query | Client + projects + invoice history |
| `clients.create` | mutation | Create client |
| `clients.update` | mutation | Update contact info |
| `clients.delete` | mutation | Delete if no active projects |

### `team` router (Agency plan only)
| Procedure | Type | Description |
|-----------|------|-------------|
| `team.listMembers` | query | All workspace members |
| `team.invite` | mutation | Send invite email + create pending member |
| `team.updateRole` | mutation | Change member role |
| `team.remove` | mutation | Remove from workspace |

### `notifications` router
| Procedure | Type | Description |
|-----------|------|-------------|
| `notifications.getPreferences` | query | Get preferences |
| `notifications.update` | mutation | Update preferences |

---

## 🌐 REST Routes (Hono — non-tRPC)

Mounted directly in `apps/server/src/index.ts`.

### Portal Routes — public, token-validated, rate-limited
| Method | Path | Description |
|--------|------|-------------|
| GET | `/portal/:token` | Full portal payload: project info, deliverables, threads, invoices |
| POST | `/portal/:token/view` | Log CLIENT_VIEWED_PORTAL activity (idempotent) |
| POST | `/portal/:token/deliverables/:versionId/approve` | Approve version + log activity |
| POST | `/portal/:token/deliverables/:versionId/reject` | Reject with `{ note }` body + log activity |
| GET | `/portal/:token/feedback` | List all feedback threads + messages |
| POST | `/portal/:token/feedback/:threadId/messages` | Client posts message in thread |
| GET | `/portal/:token/invoice/:invoiceId` | Invoice data for payment page |
| POST | `/portal/:token/invoice/:invoiceId/view` | Mark invoice as VIEWED |

### Webhook Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhooks/stripe` | Stripe event handler — verify signature, handle subscription + payment events |

---

## 🌐 Environment Variables

Managed exclusively through `packages/env`. **Never use `process.env` directly.**

```typescript
// packages/env/src/server.ts
DATABASE_URL                    // Neon pooled URL
DIRECT_URL                      // Neon direct URL (migrations only)
BETTER_AUTH_SECRET              // 32+ char random string
BETTER_AUTH_URL                 // http://localhost:3001 (dev) | https://api.clientpulse.io (prod)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
STRIPE_AGENCY_PRICE_ID
RESEND_API_KEY
CLOUDFLARE_R2_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_PUBLIC_URL        // e.g. https://files.clientpulse.io

// workflow and jobs (commented out - not currently used in schema)
 INNGEST_EVENT_KEY     //from Inngest dashboard
 INNGEST_SIGNING_KEY  //from Inngest dashboard


// packages/env/src/web.ts
NEXT_PUBLIC_SERVER_URL  // eg api.clientpulse.io — used for tRPC calls and webhook URLs
NEXT_PUBLIC_WEB_URL   // eg clientpulse.io — used for portal links in emails
         
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## ☁️ File Upload Flow (R2 Presigned URLs)

```
1. Freelancer picks file in UI
2. Frontend calls: deliverables.presignUpload({ deliverableId, fileName, mimeType, fileSize })
3. Server validates:
   - MIME type is in allowed list
   - fileSize is within plan's maxFileMb limit
   - deliverableId belongs to workspace
4. Server generates R2 presigned PUT URL (15 min TTL)
5. Server returns { presignedUrl, fileKey }
6. Frontend uploads file DIRECTLY to R2 using presignedUrl (no server bandwidth used)
7. Frontend calls: deliverables.confirmUpload({ deliverableId, fileKey, fileName, fileSize, mimeType })
8. Server verifies object exists in R2, creates DeliverableVersion, triggers approval-request email job
```

**Allowed MIME types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`,
`application/pdf`, `video/mp4`, `application/zip`, `application/x-figma`

---

## 💳 Stripe Integration

### Subscription (Freelancer → ClientPulse)
- Create Stripe Customer on workspace creation
- Checkout Session for upgrades → redirect to `/dashboard/settings?upgraded=true`
- Stripe Customer Portal for management and cancellation
- Webhook events handled in `/webhooks/stripe`:
  - `customer.subscription.created` → update `workspace.plan`
  - `customer.subscription.updated` → update `workspace.plan` (upgrade/downgrade)
  - `customer.subscription.deleted` → set plan back to FREE
  - `invoice.payment_failed` → email freelancer + show dashboard banner

### Invoice Payments (Client → Freelancer, via Stripe)
When `invoices.send` tRPC mutation is called:
1. Create Stripe Payment Link for the invoice total
2. Store `stripePaymentLinkId` + `stripePaymentLinkUrl` on Invoice record
3. Set `invoice.status = SENT`
4. Email client with portal link (invoice tab has "Pay Now" button → Payment Link)

Webhook `payment_intent.succeeded`:
1. Find Invoice by `stripePaymentIntentId`
2. Set `status = PAID`, set `paidAt = now()`
3. Log `INVOICE_PAID` Activity
4. Email freelancer via `invoice-paid.tsx` template

**ClientPulse takes zero cut of invoice payments** — this builds trust and keeps it simple.

---

## 📧 Email Templates (`packages/email-templates`)

All sent via Resend from `apps/server/src/services/email.ts`.

| Template | Trigger | Recipient |
|---|---|---|
| `welcome.tsx` | User registers | Freelancer |
| `portal-invite.tsx` | First portal share | Client |
| `approval-request.tsx` | Deliverable uploaded | Client |
| `approval-received.tsx` | Client approves | Freelancer |
| `changes-requested.tsx` | Client rejects | Freelancer |
| `feedback-received.tsx` | Client posts message | Freelancer |
| `invoice-sent.tsx` | Invoice sent | Client |
| `invoice-paid.tsx` | Stripe webhook: paid | Freelancer |
| `invoice-reminder.tsx` | 3 days before due date (Trigger.dev job) | Client |

---

## 🔄 Background Jobs (Trigger.dev v3 — `apps/server/src/jobs/`)

```typescript
// invoice-reminder.ts
// Schedule: cron "0 9 * * *" (09:00 UTC daily)
// Find invoices: status=SENT AND dueDate=today+3days AND paidAt IS NULL
// Action: send invoice-reminder.tsx to client

// mark-overdue.ts
// Schedule: cron "5 0 * * *" (00:05 UTC daily)
// Find invoices: status=SENT AND dueDate < today AND paidAt IS NULL
// Action: set status=OVERDUE, log Activity

// send-approval-request.ts
// Trigger: on-demand, called from deliverables.confirmUpload tRPC procedure
// Payload: { projectId, deliverableId, versionId }
// Action: send approval-request.tsx email to project client with portal link

// send-feedback-notification.ts
// Trigger: on-demand, called from portal POST /feedback route
// Payload: { projectId, clientName, threadTitle }
// Action: send feedback-received.tsx to workspace owner
```

---

## 🎯 Plan Feature Gates

| Feature | FREE | PRO | AGENCY |
|---------|------|-----|--------|
| Active projects | 2 | ∞ | ∞ |
| Team members | 1 | 1 | 10 |
| Invoice payments via Stripe | ❌ | ✅ | ✅ |
| Deliverable version history | ❌ | ✅ | ✅ |
| Custom branding on portal | ❌ | ✅ | ✅ |
| Custom portal domain | ❌ | ❌ | ✅ |
| Activity log | ❌ | ✅ | ✅ |
| File size limit | 25MB | 100MB | 500MB |
| PDF/CSV export | ❌ | ✅ | ✅ |

When a plan gate blocks a UI action → show `<UpgradeModal />` with pricing cards, never a raw error toast.

---

## 🔒 Security Rules

1. **Workspace ownership** — every tRPC procedure must verify the resource belongs to `ctx.workspace.id`. Never trust resource IDs from the client alone.
2. **Portal rate limiting** — Upstash Redis: 60 req/min per IP on all `/portal/*` routes
3. **File type validation** — validate MIME type AND extension server-side before issuing presigned URL
4. **Stripe webhook signature** — verify `stripe-signature` header on every event; return 400 on failure
5. **XSS** — sanitize all Tiptap HTML with `isomorphic-dompurify` before storing and before rendering
6. **CORS** — Hono CORS: allow `clientpulse.io` and `localhost:3000` only
7. **No process.env** — always import from `packages/env`; never commit `.env` files
8. **No raw SQL** — Prisma only; never `$queryRaw` with user-provided values

---

## 🚦 Error Handling Conventions

### tRPC (`packages/api`)
```typescript
import { TRPCError } from '@trpc/server'

throw new TRPCError({ code: 'UNAUTHORIZED' })
throw new TRPCError({ code: 'FORBIDDEN',   message: 'Upgrade to Pro to use this feature.' })
throw new TRPCError({ code: 'NOT_FOUND',   message: 'Project not found.' })
throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invoice is already paid.' })
```

### REST (Hono portal + webhook routes)
```typescript
return c.json({ error: { code: 'TOKEN_INVALID', message: 'Portal link is invalid or expired.' } }, 401)
```

### Frontend
- TanStack Query `onError` → `sonner` toast with user-friendly message
- Map tRPC error codes to friendly strings in `apps/web/src/lib/errors.ts`
- Never expose raw stack traces
- Sentry for production error tracking

---

## 📐 Coding Standards

### General
- TypeScript strict — no `any`, no unsafe casts
- Explicit return types on all exported functions
- `const` by default; `let` only when needed
- Named constants over magic numbers — use `packages/api/src/constants.ts`
- File names: `kebab-case.ts` | Components: `PascalCase.tsx`
- **Biome** for all linting + formatting — run `biome check --apply` before committing

### React / Next.js
- Prefer Server Components for data fetching; `"use client"` only for interactivity
- All images via `next/image`, never raw `<img>`
- Always render loading (`<Skeleton />`) and error states
- Auth guard via `proxy.ts` in `apps/web/src` (Next.js 16) — redirect unauthenticated users away from `/dashboard`
- `typedRoutes: true` — use `href={path as any}` when the path is a dynamic string

### tRPC
- Thin route handlers — delegate business logic to `apps/server/src/services/`
- Always call `requireWorkspace(ctx)` helper at top of any workspace-scoped procedure
- All inputs validated with Zod before the procedure body runs

### Prisma
- Always use `select` or `include` explicitly — never return full model objects to the client
- `$transaction` for multi-step writes
- Run `pnpm db:generate` after every schema change

### Git — STRICT WORKFLOW
- **Every branch must have its own PR and be merged before starting the next branch**
- **Never bundle multiple feature branches into one PR**
- Naming: `12-clients-pages`, `13-projects-pages`, `14-deliverables-ui`, etc.
- Commits: `type(scope): message` e.g. `feat(clients): list and detail pages`
- Types: `feat` `fix` `chore` `refactor` `test` `docs`
- Workflow per branch:
  1. `git checkout -b <branch-name>`
  2. Make changes
  3. `git add -A && git commit -m "..."`
  4. `git push origin <branch-name>`
  5. `gh pr create --base master`
  6. `gh pr merge --merge --delete-branch`

---

## 🧪 Testing Strategy

- **Unit:** Vitest — Zod schemas, utility functions, service logic
- **Integration:** Vitest + isolated Neon test branch — tRPC procedure handlers
- **E2E:** Playwright — critical flows only:
  - Register → workspace created → create client → create project
  - Upload deliverable → copy portal link → client approves
  - Create invoice → send → client pays (Stripe test mode)
- Never test against the production database

---

## 📦 MVP Build Order

Each item = one git branch + one PR. Do NOT combine.

| # | Branch | Status | Description |
|---|--------|--------|-------------|
| 1–11 | (various) | ✅ DONE | Auth, DB, env, all tRPC routers, server services, portal REST, dashboard layout/sidebar |
| 12 | `12-clients-pages` | ❌ NEXT | Clients list page + detail page + client form/card components |
| 13 | `13-projects-pages` | ❌ | Projects list + new + detail + settings pages + components |
| 14 | `14-deliverables-ui` | ❌ | Deliverable upload UI, row component, portal link copier |
| 15 | `15-client-portal` | ❌ | `/portal/[token]` pages + portal components (approval, feedback, invoice view) |
| 16 | `16-invoices-pages` | ❌ | Invoices list + new + detail pages + invoice builder component |
| 17 | `17-settings-team` | ❌ | Settings page + team management page |
| 18 | `18-shared-utilities` | ❌ | `lib/constants.ts`, `lib/utils.ts`, hooks, shared components (empty-state, status-badge, upgrade-modal) |
| 19 | `19-email-templates` | ❌ | `packages/email-templates/` package with all 9 React Email templates |
| 20 | `20-background-jobs` | ❌ | `apps/server/src/jobs/` Trigger.dev jobs + `services/pdf.ts` PDF generation |
| 21 | `21-polish` | ❌ | Empty states, error boundaries, loading skeletons, mobile responsive, Sentry |

---

## 🧠 Agent Behavior Rules

- **Read the BUILD STATUS section at the top first** — it tells you exactly what's done and what's next
- **One branch = one PR = one merge** before moving on. Never bundle branches.
- **Respect monorepo boundaries:** frontend in `apps/web`, business logic in `packages/api`, server wiring in `apps/server`, DB in `packages/db`
- **Never use `process.env` directly** — always import from `packages/env`
- **Never edit `auth.prisma`** — Better Auth manages it completely
- **All frontend → server calls go through tRPC** — never raw fetch to Hono (exception: portal pages which call REST endpoints directly)
- **Always enforce plan limits on the server** — frontend gates are UX convenience, not security
- **Run `bun db:generate` after every schema change** — commit the updated Prisma client
- **Run `biome check --apply` before committing** any file
- **Add shadcn components inside `packages/ui`**, not inside `apps/web`
- **Base UI render prop pattern** — `<SidebarMenuButton render={<Link href={path as any} />}>` — never `asChild`
- **The portal is the most critical user-facing surface** — test portal flows after any change to projects, deliverables, or invoices
- **Build simpler first** — leave `// TODO: enhancement idea` comments instead of over-engineering

---

*Last updated: March 15, 2026 — PR #7 merged (branch 11)*
*Stack: better-t-stack · Next.js 16 · Hono · tRPC · Better Auth · Prisma · Neon Postgres · Cloudflare R2 · Stripe · Resend · Trigger.dev · bun*