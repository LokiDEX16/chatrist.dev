# Chatrist - Supabase Setup Guide

## 🎯 Simplified Architecture

We've migrated from a complex NestJS + PostgreSQL + Redis setup to **Supabase** for maximum simplicity!

### What Changed
- ❌ **Removed**: NestJS backend, PostgreSQL, Redis, BullMQ, Custom JWT auth
- ✅ **Added**: Supabase (handles everything!)

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google
4. Click "New Project"
5. Fill in:
   - **Name**: chatrist
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait 2 minutes for setup

### 2. Get Your Credentials

In your Supabase project:

1. Click **Settings** (⚙️) in sidebar
2. Click **API**
3. Find these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### 3. Update .env File

```bash
cd chatrist
nano .env
```

Replace with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Instagram API (leave empty for now)
INSTAGRAM_CLIENT_ID=""
INSTAGRAM_CLIENT_SECRET=""

# App
NODE_ENV="development"
```

### 4. Create Database Schema

In Supabase Dashboard:

1. Click **SQL Editor** in sidebar
2. Click **New query**
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Instagram Accounts
create table instagram_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ig_user_id text unique not null,
  username text not null,
  access_token text,
  token_expiry timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Campaigns
create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  instagram_account_id uuid references instagram_accounts(id),
  name text not null,
  description text,
  status text default 'DRAFT' check (status in ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
  trigger_type text not null check (trigger_type in ('COMMENT', 'STORY_REPLY', 'DM_KEYWORD', 'NEW_FOLLOWER')),
  trigger_config jsonb default '{}'::jsonb,
  flow_id uuid,
  hourly_limit int default 20,
  daily_limit int default 100,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Flows
create table flows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  is_template boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add foreign key for flow_id after flows table is created
alter table campaigns
  add constraint campaigns_flow_id_fkey
  foreign key (flow_id) references flows(id);

-- Leads
create table leads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ig_user_id text not null,
  ig_username text not null,
  email text,
  name text,
  custom_fields jsonb,
  tags text[] default array[]::text[],
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, ig_user_id)
);

-- Triggers
create table triggers (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  ig_user_id text not null,
  ig_username text not null,
  type text not null,
  source_id text,
  source_text text,
  metadata jsonb,
  processed_at timestamptz,
  status text default 'PENDING' check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED')),
  created_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  trigger_id uuid references triggers(id),
  ig_user_id text not null,
  content text not null,
  message_type text not null check (message_type in ('TEXT', 'BUTTON', 'LINK', 'IMAGE')),
  metadata jsonb,
  status text default 'QUEUED' check (status in ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED')),
  sent_at timestamptz,
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

-- Campaign Analytics
create table campaign_analytics (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  date date not null,
  trigger_count int default 0,
  dms_sent int default 0,
  dms_delivered int default 0,
  replies int default 0,
  button_clicks int default 0,
  link_clicks int default 0,
  emails_captured int default 0,
  flow_completions int default 0,
  unique(campaign_id, date)
);

-- Enable Row Level Security
alter table instagram_accounts enable row level security;
alter table campaigns enable row level security;
alter table flows enable row level security;
alter table leads enable row level security;
alter table triggers enable row level security;
alter table messages enable row level security;
alter table campaign_analytics enable row level security;

-- RLS Policies: Users can only access their own data

-- Instagram Accounts
create policy "Users can view own instagram accounts"
  on instagram_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own instagram accounts"
  on instagram_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own instagram accounts"
  on instagram_accounts for update
  using (auth.uid() = user_id);

-- Campaigns
create policy "Users can view own campaigns"
  on campaigns for select
  using (auth.uid() = user_id);

create policy "Users can insert own campaigns"
  on campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update own campaigns"
  on campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete own campaigns"
  on campaigns for delete
  using (auth.uid() = user_id);

-- Flows
create policy "Users can view own flows"
  on flows for select
  using (auth.uid() = user_id);

create policy "Users can insert own flows"
  on flows for insert
  with check (auth.uid() = user_id);

create policy "Users can update own flows"
  on flows for update
  using (auth.uid() = user_id);

create policy "Users can delete own flows"
  on flows for delete
  using (auth.uid() = user_id);

-- Leads
create policy "Users can view own leads"
  on leads for select
  using (auth.uid() = user_id);

create policy "Users can insert own leads"
  on leads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own leads"
  on leads for update
  using (auth.uid() = user_id);

create policy "Users can delete own leads"
  on leads for delete
  using (auth.uid() = user_id);

-- Triggers (via campaigns)
create policy "Users can view own triggers"
  on triggers for select
  using (exists (
    select 1 from campaigns
    where campaigns.id = triggers.campaign_id
    and campaigns.user_id = auth.uid()
  ));

-- Messages (via triggers)
create policy "Users can view own messages"
  on messages for select
  using (exists (
    select 1 from triggers
    join campaigns on campaigns.id = triggers.campaign_id
    where triggers.id = messages.trigger_id
    and campaigns.user_id = auth.uid()
  ));

-- Campaign Analytics (via campaigns)
create policy "Users can view own analytics"
  on campaign_analytics for select
  using (exists (
    select 1 from campaigns
    where campaigns.id = campaign_analytics.campaign_id
    and campaigns.user_id = auth.uid()
  ));
```

4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success"

### 5. Enable Email Auth

1. In Supabase Dashboard, click **Authentication**
2. Click **Providers**
3. **Email** should be enabled by default
4. (Optional) Disable email confirmation for development:
   - Click **Email** provider
   - Toggle OFF "Confirm email"
   - Click **Save**

### 6. Start the App

```bash
cd chatrist/apps/web
pnpm dev
```

Visit: http://localhost:3000

### 7. Create Your Account

1. Click "Get Started" or "Sign Up"
2. Enter your details
3. Click "Create Account"
4. You're in! 🎉

## ✅ What Works Now

- ✅ User signup and login (Supabase Auth)
- ✅ Dashboard with statistics
- ✅ Campaign CRUD operations
- ✅ Flow management
- ✅ Lead management
- ✅ Real-time updates (automatic!)
- ✅ Secure data access (Row Level Security)

## 🎨 Features

### Auth (Built-in)
- Email/password authentication
- Session management
- Password reset (built-in)
- OAuth providers (can add later)

### Database (Real-time)
- Automatic API generation
- Real-time subscriptions
- Row Level Security
- Automatic backups

### Storage (if needed)
- File uploads
- Image optimization
- CDN delivery

## 🔧 Troubleshooting

### Can't connect to Supabase
- Check your `.env` file has correct URL and key
- Make sure you copied the **anon public** key (not service key)
- Restart dev server after changing `.env`

### RLS Errors
- Make sure you're logged in
- Check policies are created correctly
- View **Authentication** → **Users** to see if user exists

### Tables not found
- Run the SQL script completely
- Check **Database** → **Tables** to verify tables exist

## 🚀 Next Steps

1. **Test the app**:
   - Create a campaign
   - Build a flow
   - Add a lead

2. **Configure Instagram**:
   - Get Instagram API credentials
   - Add to `.env`
   - Connect your account

3. **Deploy** (optional):
   - Vercel (automatic with Supabase)
   - Or any hosting platform

## 💡 Supabase Features You Get

✅ **No backend code** - Everything handled by Supabase
✅ **Auto-scaling** - Handles traffic automatically
✅ **Real-time** - Live updates without polling
✅ **Auth built-in** - OAuth, magic links, phone auth
✅ **Free tier** - 50,000 monthly active users free
✅ **Dashboard** - Visual database management
✅ **Backups** - Automatic daily backups
✅ **Monitoring** - Built-in performance monitoring

## 📚 Supabase Resources

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Auth Docs](https://supabase.com/docs/guides/auth)
- [Database Docs](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**That's it! Much simpler than before!** 🎉

Now you have a production-ready backend without writing any backend code!
