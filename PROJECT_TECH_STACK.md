# Chatrist - Project Technical Stack & Architecture

## Project Overview

**Chatrist** is an Instagram DM automation platform built with modern web technologies. It allows users to create campaigns that automatically respond to Instagram messages, comments, and story replies based on configurable triggers and flows.

**Type:** SaaS Web Application
**Current Version:** 1.0.0
**Status:** Active Development

---

## Technology Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router
  - Server-side rendering (SSR)
  - Static generation (SSG)
  - API Routes
  - Built-in optimization

### UI & Styling
- **React 18** - UI library with hooks
- **TypeScript** - Type safety for JavaScript
- **Tailwind CSS** - Utility-first CSS framework
  - Custom design tokens
  - Dark mode support
  - Responsive design
- **shadcn/ui** - High-quality React components built on Radix UI
  - Card, Button, Dialog, Alert, Badge components
  - Customizable via Tailwind CSS
  - Accessibility-first approach

### Component Libraries
- **lucide-react** - Icon library with React components
- **Framer Motion** - Animation library for React
  - Page transitions
  - Staggered animations
  - Interactive micro-interactions
  - Gesture animations

### State Management & Data Fetching
- **@tanstack/react-query** - Data fetching and caching
  - Server state management
  - Automatic refetching
  - Query deduplication
  - Optimistic updates
- **Zustand** - Lightweight state management (if used)
- **NextAuth.js** - Authentication & session management
  - Credentials provider
  - JWT-based sessions
  - Custom callbacks

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row-level security (RLS)
  - Authentication integration
- **@supabase/supabase-js** - JavaScript client
- **@supabase/auth-helpers-nextjs** - NextAuth integration

### Instagram Integration
- **Instagram Graph API** - Meta's official API
  - Long-lived access tokens
  - OAuth 2.0 authentication
  - Business/Creator account support
- **Facebook OAuth 2.0** - OAuth provider (Instagram uses Meta OAuth)

### Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **pnpm** - Package manager
  - Monorepo support
  - Workspace protocol

### HTTP Client
- **Axios** - HTTP client for API requests
  - Request/response interceptors
  - Error handling
  - Token management

### Form Handling (if applicable)
- **React Hook Form** - Efficient form management
- **Zod** - TypeScript-first schema validation

---

## Design System

### Design Principles
- **Modern SaaS Aesthetic** - Linear/Vercel/Notion style
- **Visual Hierarchy** - Clear content prioritization
- **Whitespace Over Borders** - Breathing room in layouts
- **Accessibility First** - WCAG compliant
- **Mobile-First** - Responsive design
- **Micro-interactions** - Subtle animations for feedback

### Color Palette
```
Primary: Emerald/Green
Secondary: Blue
Destructive: Red
Muted: Gray tones
Background: White/Light Gray
Foreground: Dark Gray/Black
```

### Typography
- **Font Family:** System fonts (SF Pro Display, Segoe UI, etc.)
- **Font Sizes:**
  - Page Title: 24px (text-2xl)
  - Heading: 20px (text-xl)
  - Body: 14px (text-sm)
  - Caption: 12px (text-xs)

### Border Radius
- Buttons: `rounded-xl` (12px)
- Cards: `rounded-2xl` (16px)
- Smaller Elements: `rounded-lg` (8px)

### Shadows
- Subtle: `shadow-sm` - Hover states
- Medium: `shadow-md` - Elevated elements
- Soft transitions with `duration-200`

### Animations
- **Duration:** 200ms-300ms for smooth feel
- **Easing:** `ease-out` for natural motion
- **Stagger:** 0.1s between child elements
- **Spring Physics:** For interactive elements

---

## Project Structure

```
chatrist/
├── apps/
│   └── web/                          # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── api/
│       │   │   │   ├── auth/         # Authentication routes
│       │   │   │   ├── instagram/    # Instagram OAuth & account management
│       │   │   │   │   ├── connect/
│       │   │   │   │   ├── callback/
│       │   │   │   │   └── accounts/
│       │   │   │   └── ...
│       │   │   ├── (auth)/           # Auth layout group
│       │   │   │   ├── login/
│       │   │   │   └── register/
│       │   │   ├── dashboard/        # Dashboard layout & pages
│       │   │   │   ├── campaigns/    # Campaign management
│       │   │   │   ├── leads/        # Lead management
│       │   │   │   ├── analytics/    # Analytics & insights
│       │   │   │   ├── instagram/    # Instagram accounts
│       │   │   │   ├── flows/        # Flow builder
│       │   │   │   └── layout.tsx    # Dashboard shell
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── globals.css       # Global styles & design tokens
│       │   │   └── layout.tsx        # Root layout
│       │   ├── components/
│       │   │   ├── ui/               # shadcn components
│       │   │   │   ├── card.tsx
│       │   │   │   ├── button.tsx
│       │   │   │   ├── dialog.tsx
│       │   │   │   ├── alert.tsx
│       │   │   │   ├── badge.tsx
│       │   │   │   ├── skeleton.tsx
│       │   │   │   └── ...
│       │   │   └── dashboard/        # Dashboard-specific components
│       │   ├── lib/
│       │   │   ├── api.ts            # API client setup
│       │   │   ├── utils.ts          # Utility functions
│       │   │   └── supabase/
│       │   │       ├── client.ts     # Supabase client
│       │   │       ├── auth.ts       # Auth helpers
│       │   │       └── database.ts   # Database queries
│       │   └── styles/               # Additional styles
│       ├── public/                   # Static assets
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       ├── next.config.js
│       └── .env.local                # Environment variables
├── packages/
│   └── shared/                       # Shared types & utilities
│       └── src/
│           └── types/
├── supabase/
│   ├── migrations/                   # Database migrations
│   └── schema.sql                    # Database schema
└── docs/                             # Documentation
```

---

## Database Schema

### Tables

#### `auth.users`
- Supabase auth table
- Email, password hash, metadata

#### `instagram_accounts`
```sql
CREATE TABLE instagram_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ig_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  profile_picture_url TEXT,
  name TEXT,
  access_token TEXT,
  token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `campaigns`
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  instagram_account_id UUID REFERENCES instagram_accounts(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'DRAFT', -- DRAFT, ACTIVE, PAUSED, COMPLETED
  trigger_type TEXT NOT NULL, -- COMMENT, STORY_REPLY, DM_KEYWORD, NEW_FOLLOWER
  trigger_config JSONB,
  flow_id UUID REFERENCES flows(id),
  hourly_limit INTEGER DEFAULT 100,
  daily_limit INTEGER DEFAULT 1000,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `flows`
```sql
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB, -- Flow builder nodes
  edges JSONB, -- Flow builder connections
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `leads`
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ig_username TEXT NOT NULL,
  email TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `triggers`
```sql
CREATE TABLE triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  source_type TEXT, -- COMMENT, DM, STORY_REPLY
  source_id TEXT
);
```

---

## API Routes

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handler

### Instagram
- `GET /api/instagram/connect` - Redirect to OAuth
- `GET /api/instagram/callback` - OAuth callback handler
- `GET /api/instagram/accounts` - List user's accounts
- `GET /api/instagram/accounts/[id]` - Get account details
- `POST /api/instagram/accounts/[id]` - Refresh access token
- `DELETE /api/instagram/accounts/[id]` - Disconnect account

### Campaigns (Delegated to backend)
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/[id]` - Get campaign
- `POST /api/campaigns` - Create campaign
- `PATCH /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign

### Leads (Delegated to backend)
- `GET /api/leads` - List leads
- `PATCH /api/leads/[id]` - Update lead
- `POST /api/leads/export` - Export leads

### Analytics (Delegated to backend)
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/campaigns/[id]` - Campaign analytics

---

## Components Library

### UI Components (shadcn/ui based)

#### Card
- Elevated container with soft shadow
- Rounded corners (rounded-2xl)
- Hover state with enhanced shadow
- Used for content grouping

#### Button
- Multiple variants: solid, outline, ghost
- Sizes: sm, md, lg
- Rounded corners (rounded-xl)
- Active scale effect (scale-98)
- Smooth transitions

#### Skeleton
- Placeholder for loading states
- Animated pulse effect
- Customizable dimensions
- SkeletonCard variant for card placeholders

#### Dialog/Alert Dialog
- Modal overlays for confirmations
- Smooth animations
- Rounded-2xl corners
- Accessible focus management

#### Badge
- Status indicators
- Color variants for different states
- Animated pulse dots for active states
- Rounded-full style

#### Alert
- Dismissible notifications
- Variants: default, destructive, warning
- Icon support
- Clear typography hierarchy

### Page Components

#### Dashboard Layout
- Sidebar navigation with collapse
- Mobile hamburger menu
- Backdrop blur for mobile overlay
- Smooth animations

#### Dashboard Page
- Welcome section with stats
- Quick action cards with hover animations
- Loading skeletons
- Staggered animation on load

#### Instagram Dashboard
- Connected accounts grid
- Profile picture display
- Token expiry warnings
- Connect/Disconnect actions
- Refresh token functionality

#### Campaigns Page
- Campaign table with status badges
- Trigger icons for different types
- Campaign count per account
- Action buttons (Edit, Pause, Delete)

#### Leads Page
- Lead statistics cards
- Searchable/filterable table
- Instagram profile integration
- Tag management
- Bulk export functionality

#### Analytics Page
- Key metric cards
- Activity timeline
- Color-coded activity types
- Date range filtering

#### Auth Pages
- Split-screen layout
- Left side: Brand/features gradient
- Right side: Form
- Animated form validation
- Social auth buttons (if configured)

---

## Environment Variables

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://chjzhcuyqbmlxpzukpkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

### Instagram/Meta API
```env
INSTAGRAM_CLIENT_ID=your_app_id
INSTAGRAM_CLIENT_SECRET=your_app_secret
NEXT_PUBLIC_INSTAGRAM_CONFIGURED=true
```

### App Configuration
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Authentication
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Optional: External API
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account
- Meta for Developers account

### Installation

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
cd chatrist/apps/web
pnpm install

# Copy environment template
cp .env.example .env.local

# Fill in environment variables
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# INSTAGRAM_CLIENT_ID
# INSTAGRAM_CLIENT_SECRET
# NEXTAUTH_SECRET
# NEXTAUTH_URL
```

### Instagram OAuth Setup

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a Business app
3. Add Instagram Graph API product
4. Configure OAuth:
   - Redirect URI: `http://localhost:3000/api/instagram/callback`
5. Copy App ID and Secret to `.env.local`
6. Set `NEXT_PUBLIC_INSTAGRAM_CONFIGURED=true`

### Running Development Server

```bash
# Start Next.js dev server
pnpm dev

# App will be available at http://localhost:3000
```

### Building for Production

```bash
# Build optimized bundle
pnpm build

# Run production server
pnpm start
```

---

## Key Features Implemented

### ✅ UI/UX Improvements
- Modern SaaS design system
- Smooth page transitions and animations
- Loading skeletons for all data-fetching pages
- Empty states with clear call-to-actions
- Token expiry warnings
- Responsive mobile-first design
- Accessibility features (WCAG compliant)

### ✅ Instagram Integration
- OAuth 2.0 authentication
- Long-lived access token management
- Account connection/disconnection
- Token refresh functionality
- Campaign tracking per account
- Profile picture display

### ✅ Dashboard Features
- Campaign management (CRUD)
- Lead management and tagging
- Analytics and insights
- Flow builder (Xflow-based)
- Instagram account management

### 🔄 In Progress
- Real-time message automation
- Advanced analytics
- Team collaboration features

### 📋 TODO
- Webhook integration for real-time triggers
- Message scheduling
- A/B testing for responses
- Template library
- Advanced reporting

---

## Performance Optimizations

### Code Splitting
- Automatic chunking by Next.js
- Route-based code splitting
- Dynamic imports for heavy components

### Image Optimization
- Next.js Image component
- Automatic WebP conversion
- Responsive image serving
- Lazy loading

### Data Fetching
- React Query caching
- Request deduplication
- Automatic refetching
- Optimistic updates

### Bundle Size
- Tree shaking
- Minification
- CSS extraction
- Font optimization

---

## Development Best Practices

### File Organization
- Components grouped by feature/domain
- Shared utilities in `/lib`
- Styles colocated with components
- Type definitions in `/types`

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Consistent naming conventions

### Component Patterns
- Function components with hooks
- Custom hooks for logic reuse
- Compound components for complex UIs
- Prop interfaces for type safety

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Toast notifications for feedback
- Error boundaries for React errors

### Testing (When Applicable)
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Playwright/Cypress

---

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Database
pnpm db:push          # Push schema to Supabase (if using Drizzle/Prisma)
pnpm db:studio        # Open Supabase Studio

# Monorepo
pnpm -r install       # Install all workspace packages
pnpm -r build         # Build all packages
```

---

## Resources & Documentation

### Framework & Libraries
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### UI & Components
- [shadcn/ui Components](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)
- [Framer Motion](https://www.framer.com/motion)

### Backend & Database
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-graph-api)

### Tools & Utilities
- [React Query Documentation](https://tanstack.com/query/latest)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Axios Documentation](https://axios-http.com/docs)

---

## Team Notes

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Components follow shadcn/ui patterns
- [ ] Responsive design tested on mobile
- [ ] Animations are subtle and purposeful
- [ ] Error states are handled gracefully
- [ ] Loading states show skeletons
- [ ] Accessibility is maintained (keyboard navigation, ARIA labels)
- [ ] No console errors/warnings

### Common Issues & Solutions

#### Issue: Supabase connection fails
**Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

#### Issue: Instagram OAuth redirect not working
**Solution:** Ensure redirect URI in Meta app matches `http://localhost:3000/api/instagram/callback`

#### Issue: Tailwind styles not applying
**Solution:** Check `tailwind.config.js` includes correct template paths

#### Issue: Framer Motion animations not smooth
**Solution:** Use `will-change` CSS class on animated elements, reduce `transition: staggerChildren`

---

## Version History

### v1.0.0 (Current)
- Initial release with core features
- Modern UI/UX design system
- Instagram OAuth integration
- Campaign management
- Lead management
- Analytics dashboard

---

**Last Updated:** January 23, 2025
**Maintained By:** Development Team
**Status:** Active Development
