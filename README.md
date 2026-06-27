# form-builder

Open-source, self-hosted alternative to Typeform — with **unlimited responses**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fform-builder&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL&envDescription=Supabase%20project%20credentials%20and%20your%20app%20URL)

## Why

Typeform's free plan limits you to **10 responses/month**. Their paid plans start at $29/month and lock key features (conditional logic, custom branding, CSV export) behind $59–$99/month tiers.

form-builder gives you the same conversational form UX, self-hosted on infrastructure you control — no response limits, no seat pricing, no vendor lock-in.

## Features

- **Conversational mode** — one question at a time, full-screen, smooth transitions (Typeform-style)
- **Classic mode** — all questions on one page
- **8 question types** — text, email, number, multiple choice, checkboxes, rating, date, file upload
- **Conditional logic** — branch questions based on responses
- **Unlimited responses** — no caps, ever
- **Response management** — table view, CSV and JSON export
- **Brand customization** — colors, logo, thank-you message
- **Embed anywhere** — iframe or popup embed code
- **Email notifications** — get notified on each submission
- **Webhook support** — push data to n8n, Zapier, or any endpoint
- **Google OAuth** — one-click sign in

## Tech Stack

- **[Next.js 15](https://nextjs.org)** (App Router, TypeScript strict)
- **[Supabase](https://supabase.com)** (PostgreSQL, Auth, RLS)
- **[Tailwind CSS v4](https://tailwindcss.com)** + **[shadcn/ui](https://ui.shadcn.com)**
- **[Vercel](https://vercel.com)** for deployment

## Quick Start

### 1. Deploy to Vercel (recommended)

Click the button above. You'll need a free [Supabase](https://supabase.com) project.

### 2. Self-host locally

**Prerequisites:** Node.js 18+, a [Supabase](https://supabase.com) project

```bash
git clone https://github.com/postcabinets-jp/form-builder
cd form-builder
npm install
cp .env.example .env.local
# → Fill in your Supabase credentials
npm run dev
```

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor to set up the database.

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Comparison

| Feature | form-builder | Typeform Free | Typeform Basic ($29) |
|---------|:---:|:---:|:---:|
| Unlimited responses | ✅ | ❌ (10/mo) | ❌ (100/mo) |
| Conversational UI | ✅ | ✅ | ✅ |
| Conditional logic | ✅ | ❌ | ❌ |
| Custom branding | ✅ | ❌ | ❌ |
| CSV/JSON export | ✅ | ❌ | ✅ |
| Self-hostable | ✅ | ❌ | ❌ |
| Open source | ✅ | ❌ | ❌ |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # login, register, forgot-password
│   ├── actions/          # Server Actions (forms, questions, submissions, auth)
│   ├── auth/callback/    # OAuth callback handler
│   ├── dashboard/        # Protected dashboard
│   │   └── [formId]/     # edit, responses, share, settings
│   └── f/[slug]/         # Public form viewer
├── components/
│   ├── dashboard/        # Sidebar, header, export button
│   ├── form-builder/     # Drag-and-drop builder, question editor
│   ├── form-viewer/      # Conversational + classic form views
│   └── ui/               # shadcn/ui components
├── lib/supabase/         # Browser + server Supabase clients
└── types/                # Database types + application types
supabase/
├── migrations/           # SQL migrations
└── seed.sql              # Realistic demo data
```

## License

MIT — free to use, modify, and self-host.

---

Built by [POST CABINETS](https://postcabinets.co.jp)
