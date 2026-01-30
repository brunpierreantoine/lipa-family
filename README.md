# Lipa Family | Magical Family Workspace 📖✨

Lipa Family is a modern platform designed to transform the bedtime ritual. It allows parents to generate personalized, safe, and engaging stories for their children using an AI specifically configured for their family context.

## 🚀 Product Vision

* **Total Security**: Google OAuth authentication with a restricted allow-list and Middleware-level session enforcement.
* **Family Context**: Shared family profiles allow the AI to learn preferences, names, and values for deeply personal stories.
* **"Instant" Performance**: Optimized SSR architecture with parallel data fetching to eliminate perceptible loading times.
* **Premium Aesthetics**: A custom design system built with dynamic light/dark themes and a focus on mobile-first readability.

## 🛠 Tech Stack

* **Framework**: [Next.js 16.1](https://nextjs.org/) (App Router, Server Components)
* **Library**: [React 19](https://react.dev/)
* **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, RLS policies, SSR Auth)
* **AI**: OpenAI (Synchronized prompt engineering for child-safe content)
* **Styling**: Vanilla CSS 3 + [Tailwind CSS 4](https://tailwindcss.com/)
* **Language**: TypeScript

## 📂 Architecture

`agents/` — Specialized AI agent instructions for Architect, Backend, and Frontend roles.
`supabase/` — Secure SQL migrations and declarative Row Level Security (RLS).
`src/lib/supabase/` — Unified SSR-safe client initialization (Server, Client, Middleware).
`src/app/` — Performance-optimized routes with consolidated auth gates.

## ⚙️ Local Setup

1. **Installation**: `npm install`
2. **Environment Variables** (`.env.local`):

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    OPENAI_API_KEY=your_openai_key
    ```

3. **Launch**: `npm run dev`

## 📊 Status & Roadmap

* [x] Initial story generation MVP
* [x] Mobile-responsive layout
* [x] Secure Family Workspace (Auth & Onboarding)
* [ ] User authentication for saving favorites
* [ ] Multiple language support
* [ ] Audio narration (TTS integration)

---
*Developed with passion for children's joy and parents' peace of mind.*
