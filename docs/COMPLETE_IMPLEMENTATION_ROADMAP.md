# Homelink v2 - Complete Implementation Roadmap

**Version**: 2.0.0 (MVP → Launch)  
**Status**: Phase 2 Housing (60%), Phase 3-7 (Planning)  
**Target Timeline**: 8-10 weeks  
**Last Updated**: March 5, 2026

---

## 📊 Project Status Dashboard

| Phase | Module | Status | Completion | Priority |
|-------|--------|--------|------------|----------|
| 2 | Housing Browse | ✅ Complete | 100% | P0 |
| 2 | Housing Detail | ✅ Complete | 100% | P0 |
| 2 | Property Create/Edit | ✅ Complete | 100% | P0 |
| 2 | Landlord Dashboard | ✅ Complete | 100% | P0 |
| 2 | Booking System | ✅ Complete | 100% | P0 |
| 2 | Image Upload System | 🔄 In Progress | 80% | P0 |
| 3 | Marketplace Browse | ✅ Complete | 100% | P1 |
| 3 | Marketplace Filters | ✅ Complete | 100% | P1 |
| 3 | Item Create/Upload | 📋 Planned | 0% | P1 |
| 3 | Seller Dashboard | 📋 Planned | 0% | P1 |
| 4 | Messaging Foundation | ✅ Complete | 100% | P1 |
| 4 | Conversation UI | 📋 Planned | 0% | P1 |
| 5 | Feed Discovery | ✅ Partial | 40% | P2 |
| 5 | Feed Algorithm | 📋 Planned | 0% | P2 |
| 6 | Community Posts | 📋 Planned | 0% | P2 |
| 6 | Reviews & Ratings | 📋 Planned | 0% | P2 |
| 7 | Admin Dashboard | 📋 Planned | 0% | P3 |
| 7 | Moderation Tools | 📋 Planned | 0% | P3 |

---

## 🎯 Phase Breakdown

### Phase 2: Housing Module (Weeks 1-2) - 90% Complete

**Week 1: Browse & Discovery** ✅
- [x] Browse page with grid/filters
- [x] Detail page with carousel
- [x] Landlord profile card
- [x] Real-time updates
- [x] Responsive design

**Week 2: Management** 🔄
- [x] Property creation form (multi-step)
- [x] Edit/delete functionality
- [x] Landlord dashboard
- [x] Booking/tour requests
- [🔄] Image upload system (80% - needs Cloudinary integration)

**Week 2 Remaining (Todo):**
- [ ] Complete Cloudinary signed upload endpoint
- [ ] Add Cloudinary API key retrieval from v1
- [ ] Test image upload flow end-to-end
- [ ] Implement image deletion from Cloudinary
- [ ] Add image reordering UI
- [ ] Optimize image transformations
- [ ] Add fallback to Supabase Storage

**Database Migrations Needed:**
```sql
-- Create image_metadata table
CREATE TABLE image_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('property', 'marketplace-item', 'profile', 'community')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  public_id TEXT NOT NULL,
  public_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  size INTEGER NOT NULL,
  order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entity_id, entity_type, public_id),
  INDEX(entity_id, entity_type),
  INDEX(user_id)
);

-- Enable RLS
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own images
CREATE POLICY "Users can read own images"
  ON image_metadata FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can manage their own images
CREATE POLICY "Users can manage own images"
  ON image_metadata FOR INSERT, UPDATE, DELETE
  USING (user_id = auth.uid());
```

---

### Phase 3: Marketplace Module (Weeks 3-4)

**Week 3: Item Management**
- [ ] Seller item creation form (reuse PropertyForm component)
- [ ] Item edit/delete
- [ ] Seller dashboard
- [ ] Item detail page with gallery
- [ ] Item filters (category, condition, price, search)

**Week 4: Seller Features**
- [ ] Seller profile/shop page
- [ ] Item visibility controls
- [ ] Favorites/wishlist system
- [ ] Item recommendations
- [ ] Bulk upload (optional)

**Architecture:**
```
Marketplace Item Flow:
  1. Seller creates item → PropertyForm component
  2. Upload images → useImageUpload hook
  3. Store in marketplace_items table
  4. Display with PropertyImageCarousel
  5. Show on discover feed
```

---

### Phase 4: Real-time Messaging (Weeks 4-5)

**Week 4: Core Messaging** ✅ Complete (Foundation)
- [x] Conversation list
- [x] Message thread
- [x] Real-time updates
- [x] Unread counts

**Week 5: Enhanced Messaging**
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message search
- [ ] Conversation archiving
- [ ] Block user functionality
- [ ] Notification system
- [ ] Message attachments (images, documents)

**Implementation:**
```typescript
// Typing indicator via Presence
const channel = supabase.channel(`chat:${conversationId}`)
  .on('presence', { event: 'sync' }, () => {...})
  .subscribe()

// Read receipt tracking
await supabase
  .from('conversations')
  .update({ last_read_at: now })
  .eq('id', conversationId)

// Notification triggers (database functions + webhooks)
```

---

### Phase 5: Feed & Discovery (Weeks 5-6)

**Week 5: Feed Improvements** (Currently 40% done)
- [ ] Fix feed type mapping ✅ (done)
- [ ] Add deduplication logic ✅ (done)
- [ ] Implement feed pagination
- [ ] Add feed preferences (notification settings)
- [ ] Create feed ranking algorithm

**Week 6: Personalization**
- [ ] User activity tracking (views, clicks, saves)
- [ ] Recommendation engine
- [ ] Content scoring algorithm
- [ ] Trending listings/items
- [ ] Smart notifications

**Algorithm Design:**
```
Feed Score = (
  (recency_score * 0.2) +
  (relevance_score * 0.3) +
  (engagement_score * 0.3) +
  (quality_score * 0.2)
)

Factors:
- Recency: Recently posted (decay over time)
- Relevance: Matches user preferences (saved items, searched keywords)
- Engagement: Views, clicks, saves from similar users
- Quality: Landlord rating, item condition, photos count
```

---

### Phase 6: Community & Social (Weeks 7-8)

**Week 7: Reviews & Ratings**
- [ ] Review submission form
- [ ] Star rating system
- [ ] Review display on profiles
- [ ] Verified renter/buyer badge
- [ ] Review moderation

**Week 8: Community Features**
- [ ] Community posts/discussion
- [ ] Post creation form (text + images)
- [ ] Comments on posts
- [ ] Like/reaction system
- [ ] Community guidelines

**Database Schema:**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  reviewed_user_id UUID REFERENCES auth.users,
  reviewer_user_id UUID REFERENCES auth.users,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT,
  content TEXT,
  images TEXT[], -- Array of URLs
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE post_comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES community_posts,
  user_id UUID REFERENCES auth.users,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Phase 7: Admin & Moderation (Weeks 8-9)

**Week 8: Admin Dashboard**
- [ ] User management
- [ ] Listing moderation queue
- [ ] Report management
- [ ] Analytics dashboard
- [ ] System health monitoring

**Week 9: Moderation Tools**
- [ ] Content flagging system
- [ ] Auto-moderation rules
- [ ] Spam detection
- [ ] Fraud alerts
- [ ] User suspension/banning

**Features:**
```typescript
// Flagging system
interface ContentFlag {
  id: string
  entity_id: string
  entity_type: 'listing' | 'item' | 'post' | 'review' | 'message'
  reason: 'spam' | 'inappropriate' | 'fraud' | 'other'
  status: 'pending' | 'reviewed' | 'resolved'
  flagged_by: string
  resolved_by?: string
  notes?: string
}

// Auto-moderation rules
- New accounts: Limited posting (1 listing/day)
- Suspicious keywords: Flag for review
- Multiple flags: Auto-hide content
- Payment failures: Account restriction
```

---

### Phase 8: Performance & Optimization (Week 10)

- [ ] Bundle size optimization
- [ ] Image optimization (srcset, lazy loading)
- [ ] Database query optimization
- [ ] Cache strategy (Redis/SWR)
- [ ] Performance monitoring
- [ ] SEO improvements
- [ ] Mobile performance

**Targets:**
- Lighthouse Score: > 85
- Core Web Vitals: All Green
- Bundle Size: < 200KB gzipped
- Image Size: Avg < 100KB per image
- Page Load: < 2s on 4G

---

## 🏗️ System Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite | UI rendering, fast builds |
| **State** | Zustand | Global state management |
| **Database** | Supabase PostgreSQL | Main data store |
| **Auth** | Supabase Auth | User authentication |
| **Realtime** | Supabase Channels | Live updates, messaging |
| **Storage** | Cloudinary + Supabase | Image hosting & CDN |
| **Styling** | Tailwind CSS | Responsive design |
| **Validation** | Zod | Form validation |
| **Routing** | Wouter | Lightweight routing |

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React App)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Zustand Stores                           │   │
│  │  - housingStore (listings, filters)                  │   │
│  │  - marketplaceStore (items, filters)                 │   │
│  │  - messagingStore (conversations, messages)          │   │
│  │  - feedStore (discovery feed)                        │   │
│  │  - authStore (user session)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Custom Hooks                             │   │
│  │  - useListings, useCreateProperty, useImageUpload    │   │
│  │  - useConversations, useMessages                     │   │
│  │  - useFeed, useImageMetadata                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
          (Real-time channels + REST queries)
┌─────────────────────────────────────────────────────────────┐
│              Supabase Backend                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  - auth.users                                        │   │
│  │  - listings, marketplace_items, conversations        │   │
│  │  - messages, feed, image_metadata                    │   │
│  │  - reviews, community_posts                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Row Level Security (RLS)                            │   │
│  │  - Users see only their own data                     │   │
│  │  - Public listings visible to all                    │   │
│  │  - Conversations isolated by participants            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Realtime Subscriptions                              │   │
│  │  - New listings insert → broadcast to all            │   │
│  │  - Messages insert → update thread                   │   │
│  │  - Unread counts update                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
          (Image upload, storage APIs)
┌─────────────────────────────────────────────────────────────┐
│        Cloudinary CDN (Images & Transformations)             │
│  - Auto-resize, format negotiation                          │
│  - Global edge caching                                      │
│  - Signed uploads for security                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Checklist

### Critical Path (Must Complete for MVP)

- [x] Phase 2 Housing: Browse + Detail + Create
- [x] Phase 3 Marketplace: Browse + Filters (partial)
- [x] Phase 4 Messaging: Foundation
- [ ] Phase 2 Image Upload: Complete integration
- [ ] Phase 3 Item Upload: Implementation
- [ ] Phase 5 Feed: Improve algorithm
- [ ] Testing: Full integration tests
- [ ] Performance: Optimize bundle & images
- [ ] Deployment: Setup CI/CD pipeline

### Phase Checkpoints

**End of Phase 2 (Week 2):**
- [ ] Housing module fully functional
- [ ] Images upload and display correctly
- [ ] Landlords can create/edit/delete listings
- [ ] Renters can browse and book tours
- [ ] No critical bugs in core features

**End of Phase 3 (Week 4):**
- [ ] Marketplace fully functional
- [ ] Sellers can create items
- [ ] Images upload for items
- [ ] Filters and search working
- [ ] Messaging between buyers/sellers

**End of Phase 5 (Week 6):**
- [ ] Feed shows mixed content
- [ ] Recommendations personalized
- [ ] Real-time updates working
- [ ] Performance metrics > 85 Lighthouse

**MVP Launch (Week 7):**
- [ ] All critical features complete
- [ ] No known critical bugs
- [ ] Performance optimized
- [ ] Security audit passed
- [ ] Documentation complete

---

## 🔧 Development Workflow

### Weekly Sprint Structure

```
Monday:    Planning + Code Review
Tuesday:   Feature Implementation
Wednesday: Testing + Bug Fixes
Thursday:  Integration + Performance
Friday:    Deployment + Demo
```

### Branch Strategy

```
main (production)
  ↑
release/v2.0.0 (staging)
  ↑
develop (integration)
  ↑
feature/phase-3-marketplace
feature/phase-4-messaging
feature/phase-5-feed
hotfix/critical-bug
```

### Testing Requirements

```
Unit Tests:
- Validation functions
- Utility functions
- Store actions

Integration Tests:
- API calls
- Database mutations
- Real-time subscriptions

E2E Tests:
- Complete user flows
- Critical paths
- Edge cases
```

---

## 🚀 Deployment Strategy

### Pre-Launch Checklist

- [ ] Environment variables configured
- [ ] Cloudinary API keys ready
- [ ] Supabase migrations applied
- [ ] RLS policies verified
- [ ] Email templates ready
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] CDN cache rules set
- [ ] SSL certificates ready
- [ ] Monitoring dashboard active

### Launch Day

```
1. Final testing (30 min)
2. Deploy to staging (15 min)
3. Smoke tests (15 min)
4. Deploy to production (5 min)
5. Post-launch monitoring (1 hour)
```

---

## 📊 Success Metrics

### User Metrics

- Daily Active Users (DAU): Target 500+
- Weekly Active Users (WAU): Target 1500+
- Listings created per day: Target 20+
- Items listed per day: Target 15+
- Messages per day: Target 100+

### Performance Metrics

- Page load time: < 2s
- Lighthouse score: > 85
- Core Web Vitals: All green
- Error rate: < 0.1%
- Uptime: > 99.9%

### Business Metrics

- User retention (D7): > 40%
- Booking conversion: > 5%
- Average session: > 5 min
- Search to listing: > 30%

---

## 🐛 Known Issues & Technical Debt

### Phase 2 Image Upload

- [ ] Server-side image signature endpoint needed (currently client-side placeholder)
- [ ] Cloudinary API keys need to be extracted from v1 .env
- [ ] Image deletion from Cloudinary not implemented
- [ ] No retry logic for failed uploads
- [ ] Image compression could be optimized

### General Technical Debt

- [ ] TypeScript strict mode not enabled
- [ ] No error boundary components
- [ ] Limited test coverage (need E2E tests)
- [ ] Database indexes need optimization
- [ ] No request deduplication
- [ ] Rate limiting not implemented
- [ ] No audit logging for sensitive operations

---

## 📚 Documentation

### Created

- [x] IMAGE_MANAGEMENT_SYSTEM.md (This document)
- [x] PHASE2_HOUSING_PLAN.md
- [x] V1_CONTEXT_ANALYSIS.md
- [x] Architecture guides

### TODO

- [ ] API Documentation (OpenAPI/Swagger)
- [ ] Component Storybook
- [ ] User Guides (Landlord, Renter, Seller)
- [ ] Admin Guide
- [ ] Deployment Guide
- [ ] Troubleshooting Guide

---

## 🎯 Next Steps (Immediate)

1. **Complete Phase 2 Image Upload (Today)**
   - Extract Cloudinary keys from v1
   - Implement server-side signature endpoint
   - Add Cloudinary API deletion
   - Test end-to-end flow

2. **Phase 3 Marketplace Items (This Week)**
   - Reuse PropertyForm for items
   - Implement item creation flow
   - Add seller dashboard
   - Test marketplace uploads

3. **Phase 4 Messaging Enhancement (Next Week)**
   - Add typing indicators
   - Implement read receipts
   - Add notification system
   - Enhance message UI

4. **Performance & Testing (Ongoing)**
   - Run Lighthouse audit
   - Fix identified issues
   - Add E2E tests
   - Monitor performance

---

**Document Owner**: AI Assistant  
**Last Updated**: March 5, 2026  
**Next Review**: When Phase 2 Image Upload completes
