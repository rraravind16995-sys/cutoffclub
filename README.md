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

## Production deployment
The intended production URL is https://cutoffclub.vercel.app, with `main` as the deployment branch. After connecting this repository to the existing Vercel project, pushes to `main` should trigger a production deployment. Verify a deployment's details show this GitHub repository and branch, then confirm the production domain points to that deployment.

## Security and launch checklist
Configure Supabase Auth site and redirect URLs for the production domain. Grant admin access only through a trusted server-side workflow setting `app_metadata.role = "admin"`; never trust client-editable metadata. Test auth flows, RLS data isolation, quiz scoring, admin permissions and mobile accessibility before inviting learners.

Run `npm run build` and `npm run typecheck` before production changes.


## Email sign-up and verification
The production app uses `NEXT_PUBLIC_SITE_URL=https://cutoffclub.vercel.app` for Supabase confirmation links. In the Supabase dashboard for project `xhqvtyxrtqvqckqtzlll`:

1. In Authentication → Sign In / Providers, enable new user sign-ups and turn on Confirm Email for the Email provider.
2. In Authentication → URL Configuration, set the Site URL to `https://cutoffclub.vercel.app` and add `https://cutoffclub.vercel.app/**` to Redirect URLs.
3. Configure Custom SMTP in Authentication settings before inviting general users. Supabase's default sender is restricted to addresses belonging to the project's organization and is rate-limited; without custom SMTP, confirmation emails may not reach learners.

The app shows a confirmation reminder after signup, supports resending the confirmation message, reports auth-link errors, and redirects signup confirmation to the canonical production URL. Never commit SMTP credentials or Supabase secret/service-role keys.


## Current-affairs filters
The Current Affairs section supports subject filtering, PIB-sourced releases, and schemes grouped by government and ministry/department. Use `content_type = 'scheme'`, `scheme_jurisdiction = 'india'` or `'tamil_nadu'`, and set `ministry` to the exact matching option label in the UI. For ordinary current-affairs records, keep `content_type = 'current_affair'` and leave the scheme metadata columns null. PIB releases are filtered by `source_name` containing “PIB” or a source URL on `pib.gov.in`. The list uses the optional subject relation to `public.subjects`.
