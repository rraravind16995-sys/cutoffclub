# CutoffClub

A source-backed UPSC preparation workspace deployed at https://cutoffclub.vercel.app.

## Features
- Daily current affairs with published source links
- Prelims MCQs and explanations
- Mains practice questions and published model answers
- Subject-wise dashboard aligned to General Studies
- Supabase sign-in and account creation
- Responsive Next.js App Router UI

## Stack
Next.js, TypeScript, Tailwind CSS, Supabase, Vercel.

## Local development
Use Node.js 20.9+ (Node 22 recommended):

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. The publishable key is intended for browser use. Never put a service-role or secret key in client code or a `NEXT_PUBLIC_` variable.

## Production database
Supabase project ref: `xhqvtyxrtqvqckqtzlll` in Mumbai (`ap-south-1`). The production database is already provisioned. The current-affairs feed intentionally remains empty until verified articles are published.

## Content integrity
Current-affairs items should include traceable sources. Label a Mains question as an actual UPSC PYQ only when its year and source can be verified; otherwise label it as practice.

## Security and launch checklist
Configure Supabase Auth site and redirect URLs for the production domain. Grant admin access only through a trusted server-side workflow setting `app_metadata.role = "admin"`; never trust client-editable metadata. Test auth flows, RLS data isolation, quiz scoring, admin permissions and mobile accessibility before inviting learners.

Run `npm run build` and `npm run typecheck` before production changes.
