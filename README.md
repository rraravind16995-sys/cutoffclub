# CutoffClub — UPSC preparation workspace

CutoffClub is a responsive Next.js App Router workspace for source-backed current affairs, Prelims MCQs, Mains practice/model answers, subject-wise browsing, learner accounts, bookmarks and notes, quiz history, and an editorial admin studio.

## Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS and Lucide icons
- Supabase Auth + Postgres with row-level security
- Vercel deployment

## Local setup
Requirements: Node.js 20.9+ (Node 22 recommended) and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. The publishable key is intended for browser use; never commit a Supabase service-role/secret key or expose one in a `NEXT_PUBLIC_` variable.

## Database
The Supabase project ref is `xhqvtyxrtqvqckqtzlll` (region `ap-south-1`). Three timestamped migrations are in `supabase/migrations`. The database contains 10 subject categories, one static Article 21 practice MCQ with a separately stored answer key, and one Mains practice question/model answer. It contains no fabricated current-affairs stories or claimed UPSC PYQs.

If linking Supabase CLI, run `supabase link --project-ref xhqvtyxrtqvqckqtzlll` and inspect `supabase migration list` before applying migrations. The live database already has these migration versions; do not apply the initial migration a second time.

## Admin access
Editorial access requires the server-controlled JWT claim `app_metadata.role = "admin"`. Promote the initial admin using a trusted server-side administrative workflow; do not grant the role through client-editable `user_metadata`.

## Checks
```bash
npm run verify:migration
npm run typecheck
npm run build
```

The migration verification script is a lightweight guard, not a replacement for RLS integration tests or production/browser checks. Before broad launch, test sign-up/sign-in and password recovery, row isolation across users, quiz scoring, admin-only writes, scheduled publishing, keyboard navigation and mobile layouts.

## Content integrity
Current-affairs items must be editor-verified and retain HTTPS source URLs. A Mains item should be labelled as an actual PYQ only when its year and traceable source are provided; otherwise label it as practice.

## Deployment
The public domain is `https://cutoffclub.vercel.app`. GitHub source control is being initialized in this repository; connect this GitHub repo to the existing Vercel project to enable push-triggered deployments. Configure the two public Supabase environment variables for Production, Preview and Development in Vercel. Configure Supabase Auth redirect/site URLs for the deployed domain before enabling learner sign-in.

## Security notes
- RLS is enabled across the app's ten public-schema tables.
- Learner-owned records are restricted by `auth.uid()`.
- Quiz answer keys are stored separately and direct anonymous access is revoked.
- `submit_quiz(jsonb)` is a constrained SECURITY DEFINER RPC for authenticated scoring; review its grants and fixed search path if quiz architecture changes.
