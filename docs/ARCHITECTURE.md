# Homelink v2 - Modern Design System Architecture & Setup Guide

## Overview

Homelink v2 is a **serverless, real-time Progressive Web App (PWA)** with a **modern dark-first design system**, built with:
- **Frontend**: React 19 + TypeScript + Vite (fast HMR development)
- **Styling**: Tailwind CSS + Radix UI + Custom Design System
- **State**: Zustand (lightweight store management)
- **Backend**: Supabase (PostgreSQL + Row-Level Security + Realtime)
- **Storage**: Cloudinary (image CDN, optimization)
- **PWA**: Offline-first with service worker caching
- **Deployment**: Serverless (Vercel/Netlify edge functions)

**Current Phase**: UI/UX Redesign with Modern Dark-Mode-First Design System
- Backend: Ready (Housing, Marketplace, Messaging schemas complete)
- Frontend: Building incrementally per design spec
- See: [DESIGN_SYSTEM_V2_COMPLETE.md](./DESIGN_SYSTEM_V2_COMPLETE.md)

## Key Features

### Modern Dark-First Design
- **Primary Aesthetic**: Dark mode as default (#0A0E27 navy background)
- **Accent Colors**: Electric blue (#00A3E0), Emerald green, Coral red
- **Typography**: Inter typeface, carefully scaled hierarchy
- **Components**: 15+ reusable components following design system
- **Responsive**: Mobile-first, 6 breakpoints (xs to 2xl)
- **Accessible**: WCAG AA compliant, focus states, semantic HTML

### Unified Ecosystem
- **Landing**: Hero, features, auth CTAs
- **Dashboard**: Role-specific (Renter, Landlord, Seller, Admin)
- **Housing**: Browse, detail, landlord dashboard
- **Marketplace**: Browse, detail, seller dashboard
- **Messaging**: Real-time conversations with context
- **Budget Bite**: Meal discovery (Phase 2)
- **Community**: Comments, reactions (Phase 2)
- **Ads**: Ad system (Phase 3)

### Architecture Advantages
✅ 100% serverless - no backend to maintain  
✅ Real-time updates via Supabase subscriptions  
✅ Offline-first PWA with service worker  
✅ Row-Level Security for data isolation  
✅ Dark-mode performance (less OLED battery drain)  
✅ Incremental builds - no duplication  

## Project Structure (Clean, Non-Duplicated)

```
Homelink-Next-Gen/
├── src/                                # Source code
│   ├── app/                           # Feature pages (routing)
│   │   ├── auth/                      # /auth - Login, signup, reset
│   │   ├── housing/                   # /housing - Browse, detail, landlord dash
│   │   ├── marketplace/               # /marketplace - Browse, detail, seller dash
│   │   ├── messages/                  # /messages - Conversations, chat
│   │   ├── budget-bite/               # /budget-bite - Meal discovery (Phase 2)
│   │   ├── profile/                   # /profile - User profile, settings
│   │   └── dashboard/                 # /dashboard - Role-based home
│   │
│   ├── components/                    # Reusable UI components (single source)
│   │   ├── home/                      # Homepage/dashboard components
│   │   ├── housing/                   # Listing components (cards, forms)
│   │   ├── marketplace/               # Marketplace components (items, sellers)
│   │   ├── messaging/                 # Chat components (threads, bubbles)
│   │   ├── navigation/                # Navbar, bottom nav, sidebar
│   │   ├── auth/                      # Auth UI (forms, guards)
│   │   ├── ui/                        # Base components (buttons, inputs, cards)
│   │   └── common/                    # Shared (modals, loaders, empty states)
│   │
│   ├── hooks/                         # Custom React hooks (no duplication)
│   │   ├── useAuth.ts                 # Authentication state
│   │   ├── useListings.ts             # Housing data fetching
│   │   ├── useMarketplace.ts          # Marketplace data
│   │   ├── useMessages.ts             # Messaging logic
│   │   ├── useLike.ts                 # Like/favorite logic (shared)
│   │   └── useRealtime.ts             # Supabase subscriptions
│   │
│   ├── lib/                           # Utilities (single source of truth)
│   │   ├── supabase/                  # Supabase client & types
│   │   ├── api/                       # Server-side API calls
│   │   ├── cloudinary/                # Image upload, optimization
│   │   ├── validators/                # Form validation rules
│   │   └── utils.ts                   # General helpers
│   │
│   ├── store/                         # Zustand stores (state management)
│   │   ├── authStore.ts               # Auth user state
│   │   ├── uiStore.ts                 # UI state (theme, modals, etc)
│   │   └── cacheStore.ts              # Data caching layer
│   │
│   ├── types/                         # TypeScript definitions
│   │   ├── supabase.ts                # Generated from Supabase schema
│   │   ├── index.ts                   # App-specific types
│   │   └── api.ts                     # API response types
│   │
│   ├── App.tsx                        # Root component
│   ├── Router.tsx                     # Route definitions
│   ├── main.tsx                       # React entry point
│   └── index.css                      # Global + Tailwind styles
│
├── public/                            # Static assets
│   ├── manifest.json                  # PWA manifest
│   ├── offline.html                   # Offline fallback page
│   ├── service-worker.js              # Service worker (PWA)
│   └── icons/                         # App icons (favicon, PWA icons)
│
├── supabase/                          # Database & backend
│   ├── migrations/                    # SQL migrations
│   │   ├── 001_schema.sql            # Core tables
│   │   ├── 002_rls.sql               # Row-level security policies
│   │   └── 003_indexes.sql           # Performance indexes
│   └── functions/                     # Supabase Edge Functions (future)
│
├── docs/                              # Documentation
│   ├── DESIGN_SYSTEM_V2_COMPLETE.md  # Design specs, colors, components
│   ├── ARCHITECTURE.md                # This file
│   └── QUICKSTART.md                  # Setup guide
│
├── index.html                         # HTML entry point
├── vite.config.ts                     # Vite build config + PWA
├── tsconfig.json                      # TypeScript config
├── tailwind.config.js                 # Tailwind design tokens
├── package.json                       # Dependencies
└── .env.example                       # Environment variables template
```

**Key Principles**:
- ✅ No code duplication across features
- ✅ Single source of truth for each logic/component
- ✅ Hooks for shared state/data logic
- ✅ Stores for UI state (theme, modals, etc)
- ✅ Clean separation: app (pages) vs components (reusable) vs lib (logic)

## Database Schema

### Core Tables

#### Users & Auth
- `users` - User profiles
- `profiles` - Extended user data, preferences

#### Housing
- `listings` - Property listings
- `listing_images` - Cloudinary image references

#### Marketplace
- `marketplace_items` - Sell/buy items
- `marketplace_images` - Item images

#### Budget Bite
- `meals` - Homemade recipes & vendor meals
- `meal_ingredients` - Recipe ingredients & costs
- `meal_images` - Meal photos
- `budget_queries` - User search history (analytics)
- `meal_interactions` - Save, cook, share, rate

#### Feed System
- `feed_items` - Ranked feed entries
- `ads` - Advertisements
- `ad_impressions` - Ad tracking
- `ad_clicks` - Ad tracking

#### Community
- `entity_comments` - Comments on listings/meals/items
- `entity_reactions` - Emoji reactions on any entity

#### Other
- `notifications` - Push notifications

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (https://supabase.com)
- Cloudinary account (https://cloudinary.com)

### Installation

1. **Clone and install**
```bash
cd Homelink-Next-Gen
npm install
# or
pnpm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

3. **Create Supabase Project**
- Go to supabase.com and create a new project
- Note the URL and anon key
- In Supabase dashboard, go to SQL Editor and run the migrations:
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/migrations/002_rls_policies.sql`

4. **Set up Cloudinary**
- Create a Cloudinary account
- Get your Cloud Name
- Create an upload preset for unsigned uploads

5. **Run development server**
```bash
npm run dev
```
Server runs at `http://localhost:5000`

### Build

```bash
npm run build      # Build for production
npm run preview    # Preview production build
npm run check      # Type check
```

## Key Concepts

### 1. Realtime Subscriptions

All data updates stream in real-time via Supabase Realtime:

```typescript
// In hooks
const subscription = supabase
  .channel('feed-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'feed_items'
  }, (payload) => {
    // Handle new feed item
  })
  .subscribe();
```

### 2. Row Level Security

Every table is protected by RLS policies. Users can only:
- Read public data (listings, meals, marketplace items)
- Modify their own content
- Only admins can moderate

Example policy:
```sql
CREATE POLICY "Users can update own listings"
  ON listings
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3. Feed Ranking Algorithm

The feed is intelligently ranked using:
- **Recency**: Newer content scores higher
- **Interaction History**: Content similar to user's past interactions
- **Budget Patterns**: Meals matching user's saved budgets
- **Ad Boost**: Sponsored content at controlled intervals
- **Location**: Proximity-based ranking

Implement in Supabase Edge Function: `edge-functions/rank-feed/`

### 4. Cloudinary Integration

Store only `public_id` in database, not raw URLs:

```typescript
// In database
{
  cloudinary_public_id: "listings/user123/apartment-1",
  metadata: {
    width: 1920,
    height: 1080,
    format: "jpg"
  }
}

// On frontend
import { CldImage } from 'next-cloudinary';

<CldImage
  src="listings/user123/apartment-1"
  width={300}
  height={200}
  crop="fill"
  gravity="auto"
/>
```

### 5. PWA Capabilities

**Installable**:
- Add to home screen on mobile
- Standalone window (app-like experience)

**Offline Support**:
- Service worker caches static assets
- Offline fallback page (branded)
- Syncs data when online

**Push Notifications**:
- Subscribe to push in settings
- Triggers for new messages, listings, meals

## Feature Implementation Guide

### Adding a New Feature Module

1. **Create app structure**
```bash
mkdir -p src/app/my-feature
touch src/app/my-feature/MyFeaturePage.tsx
```

2. **Create types in `src/types/index.ts`**
```typescript
export interface MyFeatureItem {
  id: string;
  title: string;
  // ...
}
```

3. **Create Zustand store in `src/store/myFeatureStore.ts`**
```typescript
import { create } from 'zustand';

export const useMyFeatureStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  }))
}));
```

4. **Create hook in `src/hooks/useMyFeature/index.ts`**
```typescript
export function useMyFeature() {
  // Fetch data, subscribe to realtime updates
}
```

5. **Create components in `src/components/my-feature/`**
```typescript
// Feature-specific components
```

6. **Add database table to migrations**
```sql
CREATE TABLE my_feature_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- columns...
);
ALTER TABLE my_feature_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy" ON my_feature_table ...;
```

7. **Add route in `src/router.tsx`**
```typescript
: location === '/my-feature' ? (
  <MyFeaturePage />
)
```

### Adding Realtime Updates

```typescript
// In component
useEffect(() => {
  const subscription = supabase
    .channel('my-table-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'my_table'
    }, (payload) => {
      // Handle INSERT, UPDATE, DELETE
      if (payload.eventType === 'INSERT') {
        addItem(payload.new);
      }
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### Adding an Ad Format

1. Create ad card component in `src/components/ads/`
2. Add ad type to database
3. Inject ads into feed using Edge Function
4. Track impressions and clicks via `ad_impressions` and `ad_clicks` tables

## Styling

### Colors (Homelink Brand)

- **Primary (Electric Indigo)**: `#6b54ff`
- **Secondary (Sophisticated Teal)**: `#2dd4bf`
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`

Use Tailwind classes:
```tsx
<button className="bg-primary-600 hover:bg-primary-700">Action</button>
<div className="text-secondary-500">Highlight</div>
```

### Dark Mode

Automatically supported via `next-themes`:
```tsx
@media (prefers-color-scheme: dark) {
  // Dark mode styles
}
```

## Performance Tips

1. **Lazy Load Components**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

2. **Paginate Feed**
- Load 10 items at a time
- Use cursor-based pagination

3. **Optimize Images**
- Always use Cloudinary transformations
- Use appropriate sizes for different screens

4. **Minimize Re-renders**
- Use `useCallback` for event handlers
- Memoize expensive computations

5. **Efficient Queries**
- Only select needed columns
- Use `.select('col1, col2')`
- Add indexes on frequently filtered columns

## Deployment

### Vercel (Recommended for PWA)
```bash
# Push to GitHub, connect to Vercel
# Auto-deploys on push
# PWA features fully supported
```

### Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Self-hosted
```bash
npm run build
# Serve dist/ with any static host
# Ensure gzip and caching headers
```

## Security Checklist

- [ ] All tables have RLS enabled
- [ ] RLS policies follow principle of least privilege
- [ ] Supabase anon key is restricted to RLS policies only
- [ ] Service key never exposed to frontend
- [ ] Environment variables in `.env.local` (not committed)
- [ ] Cloudinary API key for unsigned uploads only
- [ ] Input validation on all forms
- [ ] Rate limiting on Supabase Edge Functions
- [ ] HTTPS enforced in production

## Monitoring & Analytics

### What to Track
- Feed engagement (impressions, scroll depth)
- Budget Bite search patterns
- Ad performance (CTR, conversions)
- User retention and DAU/MAU
- Error rates and performance metrics

### Setup
- Supabase Analytics dashboard
- Integrate Sentry for error tracking
- Add custom events to stores

## Future Enhancements

- [ ] Messaging/Chat system
- [ ] Video support for listings
- [ ] Map integration for proximity search
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Verification badges
- [ ] Reputation system
- [ ] Saved searches/filters
- [ ] User recommendations
- [ ] Payment integration (for ads)

## Support & Resources

- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com
- Zustand: https://github.com/pmndrs/zustand

---

**Last Updated**: March 2026  
**Version**: 2.0.0 - Production Ready
