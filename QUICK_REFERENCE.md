# Chatrist - Quick Reference Guide

## 🚀 Quick Start

```bash
cd chatrist/apps/web
pnpm install
pnpm dev
# Open http://localhost:3000
```

---

## 📦 Tech Stack at a Glance

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14+ |
| **Language** | TypeScript | Latest |
| **UI Library** | React | 18+ |
| **Components** | shadcn/ui | Latest |
| **Styling** | Tailwind CSS | 3+ |
| **Icons** | lucide-react | Latest |
| **Animations** | Framer Motion | 11+ |
| **Data Fetching** | TanStack Query | 5+ |
| **Backend** | Supabase | Latest |
| **Auth** | NextAuth.js | Latest |
| **HTTP Client** | Axios | Latest |
| **Package Manager** | pnpm | Latest |

---

## 🎨 Design System Quick Reference

### Colors
- **Primary:** Emerald (#10B981)
- **Secondary:** Blue (#3B82F6)
- **Destructive:** Red (#EF4444)
- **Muted:** Gray (#6B7280)

### Spacing Scale (Tailwind)
- `gap-2` = 8px
- `gap-4` = 16px
- `gap-6` = 24px
- `p-4` = 16px
- `py-8` = 32px

### Border Radius
- Buttons: `rounded-xl` (12px)
- Cards: `rounded-2xl` (16px)
- Small: `rounded-lg` (8px)

### Shadows
- Subtle: `shadow-sm`
- Medium: `shadow-md`
- Transition: `transition-all duration-200`

---

## 📁 Key Files Location

```
Web App Root: /apps/web/src

📄 Configuration Files
  .env.local                  Environment variables
  next.config.js             Next.js config
  tailwind.config.js         Tailwind config
  tsconfig.json              TypeScript config

📂 App Routes
  app/page.tsx               Landing page
  app/dashboard/             Dashboard (protected)
  app/(auth)/login/          Login page
  app/(auth)/register/       Register page

📂 Components
  components/ui/             shadcn components
  components/dashboard/      Dashboard components

📂 Libraries
  lib/api.ts                API client setup
  lib/utils.ts              Utility functions
  lib/supabase/             Supabase integration

📂 Styles
  app/globals.css            Global styles & tokens

📂 Types
  @types/                    Type definitions
```

---

## 🔧 Common Commands

```bash
# Development
pnpm dev                     Start dev server (port 3000)
pnpm build                   Build for production
pnpm start                   Run production build
pnpm lint                    Check code quality

# Database
pnpm db:studio              Open Supabase UI locally

# Monorepo
pnpm -r install             Install all dependencies
```

---

## 🔌 API Client Usage

### Fetching Data
```typescript
import { useQuery } from '@tanstack/react-query';
import { instagramApi } from '@/lib/api';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['instagram-accounts'],
    queryFn: () => instagramApi.accounts(),
  });
}
```

### Making Requests
```typescript
// GET
const response = await fetch('/api/endpoint');
const data = await response.json();

// POST
fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data }),
});
```

---

## 🎬 Animation Patterns

### Page Animation
```typescript
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

<motion.div variants={container} initial="hidden" animate="show">
  {/* Animated children */}
</motion.div>
```

### Hover Animation
```typescript
<motion.div whileHover={{ x: 4 }} transition={{ type: 'spring' }}>
  Content
</motion.div>
```

---

## 🗂️ Component Structure

### Creating a New Component
```typescript
'use client'; // If using client features

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  children: ReactNode;
  variant?: 'default' | 'primary';
  className?: string;
}

export function MyComponent({
  children,
  variant = 'default',
  className,
}: MyComponentProps) {
  return (
    <div className={cn('base-class', variant === 'primary' && 'primary-class', className)}>
      {children}
    </div>
  );
}
```

---

## 📊 Database Quick Access

### Supabase Connection
```typescript
import { supabase } from '@/lib/supabase';

// Query
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);

// Insert
await supabase
  .from('table_name')
  .insert({ column: value })
  .select()
  .single();

// Update
await supabase
  .from('table_name')
  .update({ column: newValue })
  .eq('id', id);

// Delete
await supabase
  .from('table_name')
  .delete()
  .eq('id', id);
```

---

## 🔐 Authentication

### Check Auth Status
```typescript
import { useSession } from 'next-auth/react';

export default function MyPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not signed in</div>;

  return <div>Welcome {session?.user?.email}</div>;
}
```

### Protected Route
```typescript
import { redirect } from 'next/navigation';
import { getSession } from 'next-auth/react';

export default async function ProtectedPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return <div>Protected content</div>;
}
```

---

## 📱 Responsive Breakpoints

Tailwind breakpoints used:
- `sm: 640px` - Tablets
- `md: 768px` - Small laptops
- `lg: 1024px` - Desktops
- `xl: 1280px` - Large screens

### Usage
```html
<!-- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns -->
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 🐛 Debugging

### Enable Debug Logging
```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### NextAuth Debug
```env
# .env.local
NEXTAUTH_DEBUG=true
```

### React Query DevTools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools />
    </>
  );
}
```

---

## ⚡ Performance Tips

1. **Use dynamic imports** for heavy components:
   ```typescript
   const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false });
   ```

2. **Optimize images** with Next.js Image:
   ```typescript
   import Image from 'next/image';
   <Image src="/image.jpg" alt="desc" width={800} height={600} />
   ```

3. **Memoize components** to prevent re-renders:
   ```typescript
   export const MyComponent = memo(function MyComponent() {
     return <div>Content</div>;
   });
   ```

4. **Use React Query caching**:
   ```typescript
   queryClient.setQueryData(['key'], data);
   ```

---

## 🚨 Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Instagram
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
NEXT_PUBLIC_INSTAGRAM_CONFIGURED=false

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## 📚 File Naming Conventions

- **Components:** PascalCase → `MyComponent.tsx`
- **Files:** kebab-case → `my-component.tsx`
- **Utilities:** camelCase → `myUtil.ts`
- **Types:** PascalCase → `MyType.ts`
- **Constants:** UPPER_SNAKE_CASE → `MY_CONSTANT.ts`

---

## 🎯 Component Template Quick Reference

### Button
```tsx
<Button onClick={handleClick} disabled={isLoading}>
  <Plus className="h-4 w-4 mr-2" />
  Label
</Button>
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Alert
```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Title</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>
```

### Dialog
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>Open</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm</AlertDialogTitle>
      <AlertDialogDescription>Are you sure?</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 🔗 Important Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Meta Developers:** https://developers.facebook.com
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind Docs:** https://tailwindcss.com/docs

---

## 💡 Tips & Tricks

1. **Use `cn()` utility** for conditional classes:
   ```typescript
   className={cn('base', isActive && 'active-class')}
   ```

2. **Always handle loading states**:
   ```typescript
   {isLoading ? <Skeleton /> : <Content />}
   ```

3. **Use skeletons for better UX** instead of spinners

4. **Prefer `motion.div`** over CSS animations for better performance

5. **Keep components small** - Single responsibility principle

6. **Use TypeScript interfaces** for all props

---

**Last Updated:** January 23, 2025
