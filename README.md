# Chatrist - Instagram DM Automation Platform

A creator-focused Instagram DM automation platform with visual flow builder, campaign management, and safety-first architecture.

## Features

- **Visual Flow Builder**: Create complex automation flows with drag-and-drop simplicity
- **Multi-Trigger Support**: Respond to comments, story replies, DM keywords, and new followers
- **Campaign Management**: Full CRUD operations with activation/deactivation and draft mode
- **Lead Capture**: Email capture, user tagging, and basic CRM functionality
- **Analytics Dashboard**: Real-time metrics and campaign performance tracking

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Database, Auth, Realtime)
- **Tailwind CSS**
- **shadcn/ui** components
- **React Flow** for visual flow builder
- **TanStack Query** for data fetching

## Prerequisites

- Node.js 18+
- pnpm
- Supabase account

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chatrist
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API

### 4. Set Up Environment Variables

Create `.env.local` in `apps/web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Start Development Server

```bash
pnpm dev
```

The app will be available at http://localhost:3000

## Project Structure

```
chatrist/
├── apps/
│   └── web/                    # Next.js Frontend
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   ├── components/    # React components
│       │   ├── lib/           # Utilities, Supabase client
│       │   └── types/         # TypeScript types
│       └── package.json
│
├── packages/
│   └── shared/                # Shared types & constants
│
├── turbo.json                 # Turborepo config
└── package.json               # Root workspace
```

## Available Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Lint code
```

## Frontend Pages

- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/dashboard/campaigns` - Campaign management
- `/dashboard/flows` - Flow builder
- `/dashboard/leads` - Lead management
- `/dashboard/analytics` - Analytics
- `/dashboard/settings` - User settings

## Deployment

Deploy to Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

## License

This project is proprietary and confidential.
