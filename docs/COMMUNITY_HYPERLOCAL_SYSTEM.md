# HomeLinks Community - Hyperlocal Digital Neighborhood System

**Version**: 1.0  
**Date**: March 6, 2026  
**Status**: Feature Specification  
**Philosophy**: "Your Home. Your Community. Your Ecosystem."

---

## 📌 Overview

HomeLinks Community is a **hyperlocal digital neighborhood system** designed to mirror real-life community experiences in Kenyan towns and cities. Rather than a traditional global social feed, the platform creates **location-based micro-communities** where users discover local opportunities, help neighbors, stay informed about nearby events, and build genuine connections within their physical neighborhood.

### Core Philosophy

**Think of HomeLinks Community as:**
- 🏘️ **Digital Neighborhood Hub** - Not social media, but a local gathering place
- 🤝 **Trusted Support Network** - Neighbors helping neighbors with practical needs
- 📍 **Hyperlocal First** - Everything relevant to your immediate area
- 🔗 **Ecosystem Integration** - Connects housing, marketplace, dining, and daily life
- 🌱 **Daily Utility** - Open it daily because it's useful, not just when you need something

**Not like:**
- ❌ Global social media (Facebook, Twitter) - Too broad, lacks local relevance
- ❌ Traditional forums - Too static, poor real-time engagement
- ❌ Nextdoor (US model) - Too suburban-focused, not adapted to Kenyan context

---

## 🎯 Design Principles

### 1. **Hyperlocal by Default**
Every user automatically belongs to a location-based community (e.g., "Makutano Community," "University Area Community," "Kaaga Community"). Content is relevant to their immediate surroundings, not global noise.

### 2. **Structured Over Chaotic**
Replace endless scrolling with organized sections: Community Pulse (urgent updates), categorized conversations (housing, recommendations, help), and purpose-driven interactions.

### 3. **Belonging Over Broadcasting**
Foster genuine neighborhood connections through community identity (name, icon, color), recognition of trusted contributors, and shared local experiences.

### 4. **Helpful Over Viral**
Prioritize meaningful interactions (recommendations, help requests, local alerts) over engagement metrics. Content is valuable if it helps someone nearby.

### 5. **Trust Through Transparency**
Verified users, reputation scores, and clear moderation create a safe environment where neighbors feel comfortable asking for help or sharing information.

### 6. **Ecosystem Integration**
Community is not isolated—housing listings, marketplace items, and Budget Bite recommendations naturally appear within relevant local contexts.

---

## 🏗️ Architecture & Data Models

### Database Schema

#### **communities** Table
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  name TEXT NOT NULL,                    -- e.g., "Makutano Community"
  slug TEXT UNIQUE NOT NULL,             -- e.g., "makutano-meru"
  description TEXT,                      -- Short community intro
  icon_url TEXT,                         -- Community icon/logo
  color_accent TEXT DEFAULT '#00A3E0',  -- Brand color for this community
  
  -- Location
  location_type TEXT NOT NULL,           -- 'neighborhood', 'town', 'district'
  city TEXT NOT NULL,                    -- e.g., "Meru"
  region TEXT,                           -- e.g., "Eastern Region"
  country TEXT DEFAULT 'Kenya',
  
  -- Geofencing
  center_lat DECIMAL(10, 8),             -- Community center coordinates
  center_lng DECIMAL(11, 8),
  radius_meters INTEGER,                 -- Coverage radius (500m-5km)
  boundary_polygon GEOGRAPHY(POLYGON),   -- Precise boundary (optional)
  
  -- Stats
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  active_member_count INTEGER DEFAULT 0, -- Active in last 30 days
  
  -- Moderation
  admin_user_ids UUID[] DEFAULT '{}',    -- Community admins
  moderator_user_ids UUID[] DEFAULT '{}',-- Community moderators
  rules JSONB DEFAULT '[]',              -- Community guidelines
  moderation_level TEXT DEFAULT 'standard', -- 'open', 'standard', 'strict'
  
  -- Metadata
  status TEXT DEFAULT 'active',          -- 'active', 'inactive', 'archived'
  parent_community_id UUID REFERENCES communities(id), -- For hierarchies
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_city ON communities(city);
CREATE INDEX idx_communities_location ON communities USING GIST(ST_MakePoint(center_lng, center_lat));
CREATE INDEX idx_communities_status ON communities(status) WHERE status = 'active';
```

#### **community_members** Table
```sql
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Membership
  role TEXT DEFAULT 'member',            -- 'member', 'moderator', 'admin'
  status TEXT DEFAULT 'active',          -- 'active', 'left', 'banned'
  auto_joined BOOLEAN DEFAULT false,     -- Joined automatically vs manually
  
  -- Engagement
  post_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  help_requests_fulfilled INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,    -- 0-100
  
  -- Badges
  badges TEXT[] DEFAULT '{}',            -- ['helpful_neighbor', 'trusted_recommender']
  
  -- Settings
  notification_settings JSONB DEFAULT '{
    "alerts": true,
    "help_board": true,
    "circles": true,
    "replies": true,
    "mentions": true
  }',
  
  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  UNIQUE(community_id, user_id)
);

-- Indexes
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_role ON community_members(role) WHERE role IN ('moderator', 'admin');
CREATE INDEX idx_community_members_reputation ON community_members(reputation_score DESC);
```

#### **community_posts** Table
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',        -- Images/videos
  post_type TEXT NOT NULL,               -- See POST_TYPES below
  category TEXT NOT NULL,                -- See CATEGORIES below
  
  -- Tags
  tags TEXT[] DEFAULT '{}',              -- ['urgent', 'lost_found', 'announcement']
  mentioned_user_ids UUID[] DEFAULT '{}',-- @mentions
  
  -- Priority (for Community Pulse)
  priority TEXT DEFAULT 'normal',        -- 'urgent', 'high', 'normal', 'low'
  importance_score INTEGER DEFAULT 0,    -- Algorithm-calculated (0-100)
  pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,                -- Auto-hide after date
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Moderation
  status TEXT DEFAULT 'published',       -- 'draft', 'published', 'flagged', 'removed'
  flagged_count INTEGER DEFAULT 0,
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,
  
  -- Integration
  linked_listing_id UUID,                -- Housing listing reference
  linked_item_id UUID,                   -- Marketplace item reference
  linked_recipe_id UUID,                 -- Budget Bite recipe reference
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Types
-- 'discussion' - General conversation
-- 'help_request' - Asking for assistance
-- 'help_offer' - Offering assistance
-- 'recommendation' - Service/place recommendation
-- 'alert' - Safety/urgent notice
-- 'announcement' - Official community update
-- 'event' - Local event
-- 'lost_found' - Lost & found items
-- 'poll' - Community poll/vote

-- Categories
-- 'housing' - Housing discussions
-- 'recommendations' - Local recommendations (services, food, shops)
-- 'help' - Help requests/offers
-- 'improvement' - Neighborhood improvement ideas
-- 'safety' - Safety alerts
-- 'events' - Community events
-- 'general' - General discussion
-- 'lost_found' - Lost & found

-- Indexes
CREATE INDEX idx_community_posts_community ON community_posts(community_id);
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_posts_type ON community_posts(post_type);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_priority ON community_posts(priority, importance_score DESC);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_pinned ON community_posts(pinned) WHERE pinned = true;
CREATE INDEX idx_community_posts_status ON community_posts(status) WHERE status = 'published';
```

#### **community_circles** Table
```sql
CREATE TABLE community_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,                    -- e.g., "Students", "Landlords"
  slug TEXT NOT NULL,                    -- URL-friendly
  description TEXT,
  icon TEXT,                             -- Icon identifier
  color TEXT DEFAULT '#00A3E0',
  
  -- Type
  circle_type TEXT NOT NULL,             -- 'interest', 'context', 'location'
  context TEXT,                          -- 'students', 'landlords', 'small_business'
  
  -- Settings
  privacy TEXT DEFAULT 'open',           -- 'open', 'request', 'invite_only'
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  
  -- Moderation
  admin_user_ids UUID[] DEFAULT '{}',
  
  -- Metadata
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(community_id, slug)
);

CREATE INDEX idx_community_circles_community ON community_circles(community_id);
CREATE INDEX idx_community_circles_type ON community_circles(circle_type);
```

#### **circle_members** Table
```sql
CREATE TABLE circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES community_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  role TEXT DEFAULT 'member',            -- 'member', 'admin'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(circle_id, user_id)
);

CREATE INDEX idx_circle_members_user ON circle_members(user_id);
CREATE INDEX idx_circle_members_circle ON circle_members(circle_id);
```

#### **help_board_requests** Table
```sql
CREATE TABLE help_board_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  request_type TEXT NOT NULL,            -- 'help_needed', 'help_offered', 'recommendation'
  category TEXT NOT NULL,                -- 'moving', 'repairs', 'skills', 'items', 'other'
  urgency TEXT DEFAULT 'normal',         -- 'urgent', 'normal', 'whenever'
  
  -- Status
  status TEXT DEFAULT 'open',            -- 'open', 'in_progress', 'fulfilled', 'expired'
  responder_id UUID REFERENCES users(id),-- User who fulfilled request
  response_count INTEGER DEFAULT 0,
  
  -- Metadata
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

CREATE INDEX idx_help_board_community ON help_board_requests(community_id);
CREATE INDEX idx_help_board_author ON help_board_requests(author_id);
CREATE INDEX idx_help_board_status ON help_board_requests(status) WHERE status = 'open';
CREATE INDEX idx_help_board_urgency ON help_board_requests(urgency, created_at DESC);
```

---

## 🎨 User Interface Components

### 1. Community Home Page

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [Community Icon] Makutano Community        [⚙️ Settings]│
│  🏘️ 1,247 neighbors • 89 active today                   │
│  "A vibrant neighborhood in Meru Town"                   │
├─────────────────────────────────────────────────────────┤
│  📍 COMMUNITY PULSE                          [View All] │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🚨 Safety Alert • 2h ago                          │  │
│  │    Power outage expected tomorrow 8am-12pm        │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ 📢 Announcement • 5h ago                          │  │
│  │    Community cleanup this Saturday 9am            │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ 📅 Event • 1d ago                                 │  │
│  │    Youth football tournament @ Kaaga Stadium      │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  💬 CONVERSATIONS                                        │
│  [🏠 Housing] [🛠️ Recommendations] [🤝 Help] [💡 Ideas] │
│                                                          │
│  🏠 Housing Discussions (23 new)                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ John K. • 30min ago                               │  │
│  │ "Looking for 1BR near Makutano, budget 10k?"     │  │
│  │ 💬 5 replies • 🔼 8 helpful                        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  🛠️ Local Recommendations (18 new)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Mary W. • 1h ago                                  │  │
│  │ "Does anyone know a good plumber near Kaaga?"    │  │
│  │ 💬 12 replies • ✅ 3 recommendations               │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  🤝 HELP BOARD                              [Post Help] │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🆘 Help Needed • Moving Assistance                │  │
│  │    "Need help moving furniture this weekend"      │  │
│  │    💰 Ksh 1,500 • 🕐 Saturday 10am                 │  │
│  │    [Respond]                                       │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  👥 COMMUNITY CIRCLES                                    │
│  [Students 👨‍🎓 234] [Landlords 🏘️ 56] [Businesses 🏪 89]│
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Community Identity Header** - Name, icon, member stats, description
- **Community Pulse** - 3-5 priority items (alerts, announcements, events)
- **Categorized Conversations** - Organized by topic, not chronological chaos
- **Help Board Preview** - Latest help requests/offers
- **Community Circles** - Interest-based sub-groups

### 2. Community Pulse Section

**Purpose:** Quickly show what's happening locally—safety alerts, announcements, events, urgent notices.

**Content Types:**
- 🚨 **Safety Alerts** - Power outages, road closures, security warnings
- 📢 **Announcements** - Community updates from admins/moderators
- 📅 **Events** - Local gatherings, sports, cultural activities
- 🔍 **Lost & Found** - Missing items, found pets
- ⚠️ **Urgent Notices** - Time-sensitive information

**Display Logic:**
- Auto-prioritize by: `priority` field + `importance_score` + freshness
- Maximum 5 items shown, rest in "View All" page
- Items can be pinned by moderators
- Auto-expire after `expires_at` date

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ 📍 COMMUNITY PULSE                   [View All] │
├─────────────────────────────────────────────────┤
│ 🚨 Safety Alert • Posted 2h ago                 │
│    Power outage expected tomorrow 8am-12pm      │
│    Meru Power Company                           │
│    🔼 23 • 💬 8                                  │
├─────────────────────────────────────────────────┤
│ 📢 Announcement • Posted 5h ago                 │
│    Community cleanup this Saturday 9am          │
│    Meet at Makutano Center                      │
│    🔼 45 • 💬 12 • [I'm Attending]              │
└─────────────────────────────────────────────────┘
```

### 3. Conversation Categories

**Four Primary Categories:**

#### **🏠 Housing Discussions**
- Questions about rentals, landlords, roommates
- Housing reviews and recommendations
- Rental market insights
- Tenant/landlord advice

#### **🛠️ Local Recommendations**
- Service providers (plumbers, electricians, cleaners)
- Restaurants and food spots
- Shops and vendors
- Schools and daycare

#### **🤝 Help Requests**
- Moving assistance
- Repair services
- Item loans (tools, furniture)
- Skill sharing

#### **💡 Neighborhood Improvement**
- Infrastructure issues (potholes, lighting)
- Beautification ideas
- Safety improvements
- Community initiatives

**UI Pattern:**
```
┌─────────────────────────────────────────────────┐
│ 🏠 Housing Discussions                          │
│ [📝 New Discussion]                             │
├─────────────────────────────────────────────────┤
│ Sort: [Recent] [Most Helpful] [Unanswered]     │
├─────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │
│ │ 👤 John Kamau • 30min ago                │   │
│ │ "Looking for 1BR near Makutano, 10k?"    │   │
│ │                                           │   │
│ │ Any recommendations? Need to move by...  │   │
│ │                                           │   │
│ │ 🔼 8 Helpful • 💬 5 Replies • 📍 Makutano │   │
│ │                                           │   │
│ │ Latest: "Check out Meru View Apartments" │   │
│ │         by @MaryWanjiku 10min ago        │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 4. Community Help Board

**Purpose:** Dedicated space for neighbors to request/offer practical assistance.

**Request Types:**
- 🆘 **Help Needed** - User needs assistance
- 🤝 **Help Offered** - User offering skills/services
- ⭐ **Recommendation** - Suggesting trusted service provider
- 🎁 **Item Share** - Lending/borrowing items

**Fields:**
- Title (e.g., "Need help moving furniture")
- Description
- Category (moving, repairs, skills, items, other)
- Urgency (urgent, normal, whenever)
- Compensation (optional) - "Ksh 1,500" or "Free/exchange favor"
- Timing - Date/time needed
- Status - Open, In Progress, Fulfilled

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ 🤝 COMMUNITY HELP BOARD          [📝 Post Help] │
├─────────────────────────────────────────────────┤
│ Filter: [All] [Help Needed] [Offered] [Items]  │
│ Sort: [Recent] [Urgent First]                   │
├─────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │
│ │ 🆘 HELP NEEDED • Moving Assistance       │   │
│ │                                           │   │
│ │ "Need help moving furniture this weekend │   │
│ │  from Kaaga to Makutano area"            │   │
│ │                                           │   │
│ │ 📍 Kaaga → Makutano                       │   │
│ │ 💰 Ksh 1,500                              │   │
│ │ 🕐 Saturday, Mar 9 • 10:00 AM             │   │
│ │ 🏷️ Moving                                 │   │
│ │                                           │   │
│ │ Posted by John K. • 2h ago               │   │
│ │ ⭐ Reputation: 85/100 • 12 helps fulfilled│   │
│ │                                           │   │
│ │ [💬 I Can Help] [👍 Upvote]               │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ 🤝 HELP OFFERED • Free Plumbing Advice   │   │
│ │                                           │   │
│ │ "Experienced plumber. Happy to answer    │   │
│ │  questions about common plumbing issues" │   │
│ │                                           │   │
│ │ 📍 Makutano Area                          │   │
│ │ 🆓 Free (favor exchange welcome)          │   │
│ │ 🏷️ Skills                                 │   │
│ │                                           │   │
│ │ Posted by Samuel M. • 5h ago             │   │
│ │ ⭐ Verified Plumber • Reputation: 98/100  │   │
│ │                                           │   │
│ │ [💬 Ask Question] [⭐ Recommend]          │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Interaction Flow:**
1. User posts help request with details
2. Others can respond "I Can Help" or comment
3. Original poster selects helper, status → "In Progress"
4. After completion, both parties rate each other
5. Status → "Fulfilled", reputation scores updated

### 5. Community Circles

**Purpose:** Smaller sub-groups within larger community based on shared context or interests.

**Types of Circles:**

**Context-Based:**
- 👨‍🎓 **Students** - University/college students in area
- 🏘️ **Landlords** - Property owners
- 👔 **Small Businesses** - Local entrepreneurs
- 🏠 **Renters** - Tenants in area
- 👷 **Service Providers** - Plumbers, electricians, cleaners

**Interest-Based:**
- ⚽ **Sports** - Local sports enthusiasts
- 🌱 **Gardening** - Urban gardening tips
- 💻 **Tech** - Technology discussions
- 🍳 **Foodies** - Restaurant reviews, recipes

**Location-Based:**
- Smaller zones within community (e.g., "Block A Residents")

**Circle Page UI:**
```
┌─────────────────────────────────────────────────┐
│ [← Back to Makutano Community]                  │
├─────────────────────────────────────────────────┤
│ 👨‍🎓 Students Circle                              │
│ 234 members • 45 active today                   │
│ "Connect with fellow students in the area"      │
│                                                  │
│ [📝 New Post] [⚙️ Settings] [🔔 Notifications]  │
├─────────────────────────────────────────────────┤
│ [📰 Feed] [👥 Members] [📌 About]               │
├─────────────────────────────────────────────────┤
│ 📰 CIRCLE FEED                                   │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ 📚 Study Group Formation                  │   │
│ │                                           │   │
│ │ "Looking for 3-4 people to form Business │   │
│ │  Statistics study group..."               │   │
│ │                                           │   │
│ │ Posted by Grace M. • 1h ago              │   │
│ │ 💬 8 Comments • 👍 12                     │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Circle Privacy Options:**
- **Open** - Anyone can join
- **Request** - User requests, admin approves
- **Invite Only** - Only invited users can join

### 6. Community Identity Elements

**Each community has:**

**Visual Identity:**
- **Name** - "Makutano Community," "University Area Community"
- **Icon/Logo** - Simple, recognizable symbol
- **Color Accent** - Used throughout community pages (buttons, badges, highlights)
- **Tagline** - Short description (e.g., "A vibrant neighborhood in Meru Town")

**Stats Dashboard:**
- **Member Count** - Total registered neighbors
- **Active Members** - Active in last 30 days
- **Posts This Week** - Recent activity level
- **Help Requests Fulfilled** - Community helpfulness metric

**Community Milestones:**
- "🎉 500 members reached!"
- "🤝 100 help requests fulfilled!"
- "⭐ Top 5 most helpful community in Meru!"

**Trusted Contributors:**
- Top 5-10 most helpful members displayed
- Badges: Helpful Neighbor, Local Expert, Community Guardian
- Reputation scores visible

**Example Community Card:**
```
┌─────────────────────────────────────────────────┐
│ 🏘️ MAKUTANO COMMUNITY                           │
│                                                  │
│ [Community Icon - House with people]            │
│                                                  │
│ 1,247 neighbors • 89 active today               │
│ "A vibrant neighborhood in Meru Town"           │
│                                                  │
│ 📊 Community Stats:                              │
│ • 342 posts this month                          │
│ • 67 help requests fulfilled                    │
│ • 95% response rate                             │
│                                                  │
│ ⭐ Top Contributors:                             │
│ John K. (Reputation: 98) • Mary W. (Rep: 95)   │
│                                                  │
│ [Enter Community →]                             │
└─────────────────────────────────────────────────┘
```

---

## 🔗 Ecosystem Integration

### Integration with Housing Listings

**Auto-Post to Community:**
When a landlord creates a housing listing, a preview automatically appears in relevant community:

```
┌─────────────────────────────────────────────────┐
│ 🏠 NEW LISTING • Posted 2h ago                  │
│                                                  │
│ [Listing Photo]                                 │
│                                                  │
│ Modern 1BR Apartment • Ksh 12,000/month         │
│ Makutano Area • Near Meru University            │
│                                                  │
│ Posted by @JohnLandlord                         │
│ ⭐ Landlord Rating: 4.7/5 (23 reviews)          │
│                                                  │
│ [View Full Listing →] [💬 Ask Question]         │
└─────────────────────────────────────────────────┘
```

**Community Validation:**
- Community members can rate/review landlords
- "5 neighbors recommend this landlord" badge
- Previous tenant reviews visible
- Questions answered publicly for transparency

### Integration with Marketplace

**Local Marketplace Items:**
Marketplace listings appear in community feed with "FOR SALE" badge:

```
┌─────────────────────────────────────────────────┐
│ 🛍️ FOR SALE • Posted 3h ago                     │
│                                                  │
│ [Item Photos]                                   │
│                                                  │
│ Gently Used Sofa Set • Ksh 15,000               │
│ Good condition • Available for pickup           │
│                                                  │
│ Posted by @MaryWanjiku                          │
│ ⭐ Seller Rating: 4.9/5 (12 transactions)       │
│ 📍 Kaaga Area                                    │
│                                                  │
│ [View Item →] [💬 Message Seller]               │
└─────────────────────────────────────────────────┘
```

**Benefits:**
- Higher visibility for local sellers
- Community members more likely to trust neighbors
- Easier coordination for pickup/delivery
- Reduces shipping costs (local transactions)

### Integration with Budget Bite

**Community Food Recommendations:**
Users can share Budget Bite recipes or restaurant recommendations to community:

```
┌─────────────────────────────────────────────────┐
│ 🍽️ BUDGET BITE RECIPE • Posted 1h ago           │
│                                                  │
│ [Recipe Photo]                                  │
│                                                  │
│ Easy Githeri Recipe • Ksh 150 • 30 mins        │
│ "Perfect for students on a budget!"             │
│                                                  │
│ Posted by @GraceChef                            │
│ 👍 45 Likes • 💬 12 Comments                     │
│                                                  │
│ [Try Recipe →] [💾 Save]                         │
└─────────────────────────────────────────────────┘
```

**Community Food Spots:**
- Members recommend affordable local restaurants
- "Student-Favorite" badges for budget-friendly places
- Group meal deals negotiated with restaurants
- Food safety alerts (hygiene issues, closures)

---

## 🛡️ Safety & Moderation System

### Trust & Verification

**User Verification:**
- ✅ **Verified Identity** - Phone number + government ID verified
- ✅ **Verified Landlord** - Property ownership documents
- ✅ **Verified Business** - Business registration
- ✅ **Verified Student** - University ID

**Reputation System:**
- **Score Range:** 0-100
- **Components:**
  - Help requests fulfilled (+5 each)
  - Positive reviews received (+2 each)
  - Posts marked helpful (+1 each)
  - Penalties: Flagged content (-10), banned from community (-50)
- **Display:** Visible on user profile and next to posts
- **Thresholds:**
  - 0-30: New user
  - 31-60: Active member
  - 61-80: Trusted neighbor
  - 81-100: Community leader

**Badges:**
- 🏆 **Helpful Neighbor** - Fulfilled 10+ help requests
- ⭐ **Local Expert** - 50+ helpful recommendations
- 🛡️ **Community Guardian** - Active moderator
- 👑 **Founding Member** - Joined in first month
- 💎 **Top Contributor** - Top 1% engagement

### Content Moderation

**Automated Flags:**
- Offensive language detection (keyword filtering)
- Spam patterns (duplicate posts, external links)
- Excessive caps or punctuation
- Posts with 5+ user reports auto-flagged

**Moderation Queue:**
```
┌─────────────────────────────────────────────────┐
│ 🛡️ MODERATION QUEUE                             │
├─────────────────────────────────────────────────┤
│ 🚩 Flagged Post (3 reports)                     │
│                                                  │
│ "Looking for cheap apartments..."               │
│                                                  │
│ Reason: Spam links detected                     │
│ Reported by: User123, User456, User789         │
│                                                  │
│ [✓ Approve] [🗑️ Remove] [⚠️ Warn User]          │
└─────────────────────────────────────────────────┘
```

**Moderation Actions:**
- **Approve** - Post is fine, remove flags
- **Remove** - Hide post, send removal notice to author
- **Warn User** - Official warning, visible in history
- **Temporary Ban** - Suspend from community (7-30 days)
- **Permanent Ban** - Remove from community completely

**User Reporting:**
- **Categories:** Spam, Inappropriate, Safety Concern, Misinformation
- **Process:** User reports → Auto-flag if 3+ reports → Moderator review → Action
- **Transparency:** User notified if their content is removed with reason

### Community Guidelines

**Auto-Generated Rules (Customizable per Community):**

1. **Be Respectful** - No harassment, hate speech, or personal attacks
2. **Stay Relevant** - Keep discussions related to local community
3. **No Spam** - No excessive promotion or external links without context
4. **Protect Privacy** - Don't share others' personal information
5. **Be Helpful** - Prioritize useful contributions over arguments
6. **Report Issues** - Flag problematic content instead of responding

**Enforcement:**
- First violation: Warning
- Second violation: 7-day suspension
- Third violation: 30-day suspension
- Severe violations: Immediate permanent ban

---

## 📲 User Flows

### Flow 1: New User Joins Community

```
1. User signs up for HomeLinks
   ↓
2. System detects user location (GPS + IP)
   ↓
3. Auto-assign to nearest community (e.g., "Makutano Community")
   ↓
4. Show welcome modal:
   "Welcome to Makutano Community! 🎉"
   - Community intro
   - Member count
   - Quick rules
   - [Start Exploring]
   ↓
5. Guided tour highlights:
   - Community Pulse (urgent updates)
   - Help Board (request/offer help)
   - Circles (join interest groups)
   ↓
6. Suggest circles to join based on profile:
   "You're a student? Join the Students Circle!"
   ↓
7. User lands on Community Home Page
```

### Flow 2: User Posts Help Request

```
1. User clicks "Post Help" on Help Board
   ↓
2. Form appears:
   - Type: [Help Needed] [Help Offered]
   - Category: [Moving] [Repairs] [Skills] [Items]
   - Title: "Need help moving furniture"
   - Description: [Details...]
   - Urgency: [Urgent] [Normal] [Whenever]
   - Compensation (optional): "Ksh 1,500"
   - Timing: "Saturday, Mar 9 @ 10:00 AM"
   ↓
3. User submits → Post appears on Help Board
   ↓
4. Notifications sent to active community members
   ↓
5. Other users respond "I Can Help"
   ↓
6. Original poster reviews responses, selects helper
   ↓
7. Status changes to "In Progress"
   ↓
8. After completion, both rate each other
   ↓
9. Reputation scores updated
   ↓
10. Status changes to "Fulfilled"
```

### Flow 3: User Shares Marketplace Item to Community

```
1. User creates marketplace listing
   ↓
2. System asks: "Share to Makutano Community?"
   [✓] Yes, share to community
   ↓
3. Item auto-posted to community feed with "FOR SALE" badge
   ↓
4. Community members see item in feed
   ↓
5. User clicks "Message Seller"
   ↓
6. Opens messaging with pre-filled context:
   "Hi! I'm interested in your [Item Name] from Makutano Community"
   ↓
7. Seller responds
   ↓
8. Transaction happens
   ↓
9. Buyer rates seller → Reputation updated
```

### Flow 4: User Discovers Community Event

```
1. User opens community home page
   ↓
2. Community Pulse shows event:
   "📅 Youth football tournament @ Kaaga Stadium"
   ↓
3. User clicks to see details
   ↓
4. Event page shows:
   - Date/time
   - Location (map)
   - Organizer
   - Attendees count
   - [I'm Attending] button
   ↓
5. User clicks "I'm Attending"
   ↓
6. Event added to user's calendar
   ↓
7. Reminder notification sent 1 day before
```

---

## 📊 Success Metrics

### Community Health Metrics

**Engagement:**
- Daily Active Users (DAU) per community
- Posts per day per community
- Comments per post average
- Response time to questions (<2 hours target)

**Helpfulness:**
- Help requests fulfilled rate (target: >80%)
- Average reputation score (target: >60)
- Top contributors count (users with reputation >80)

**Growth:**
- New members per week
- Member retention rate (30-day)
- Circles created organically
- Cross-community interactions

**Safety:**
- Flagged content rate (<2% of posts)
- Moderation response time (<1 hour for urgent)
- User reports resolved (<24 hours)
- Banned users per month (<1%)

### Business Metrics

**Platform Stickiness:**
- Daily opens per user (target: 3+ opens/day)
- Time spent in community (target: 10+ min/day)
- Return user rate (target: >70%)

**Ecosystem Integration:**
- % of listings shared to community (target: >60%)
- % of marketplace items shared (target: >50%)
- Budget Bite recipes shared (target: >40%)
- Messages initiated from community (target: >30%)

**Monetization (Future):**
- Local business sponsorships
- Promoted posts from verified businesses
- Premium features (analytics for landlords/sellers)

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [x] Database schema (communities, members, posts, circles)
- [ ] Community auto-assignment based on location
- [ ] Basic community home page UI
- [ ] Community identity (name, icon, color, description)
- [ ] Post creation (discussion, help request, recommendation)
- [ ] Basic moderation (flag, remove, ban)

### Phase 2: Core Features (Weeks 3-4)
- [ ] Community Pulse section (priority content)
- [ ] Categorized conversations (housing, recommendations, help, improvement)
- [ ] Help Board (request/offer help)
- [ ] Reputation system (score calculation, badges)
- [ ] User verification (phone, ID, landlord, business)
- [ ] Notification system (alerts, mentions, replies)

### Phase 3: Integration (Weeks 5-6)
- [ ] Housing listing auto-post to community
- [ ] Marketplace item sharing to community
- [ ] Budget Bite recipe sharing
- [ ] Community reviews for landlords/sellers
- [ ] Messaging integration (context-aware)
- [ ] Search within community

### Phase 4: Enhancement (Weeks 7-8)
- [ ] Community Circles (interest-based sub-groups)
- [ ] Advanced moderation dashboard
- [ ] Community analytics (engagement, health metrics)
- [ ] Event management system
- [ ] Poll/voting system
- [ ] Community achievements/milestones

### Phase 5: Scale (Weeks 9-10)
- [ ] Multi-city expansion (Nairobi, Kisumu)
- [ ] Community hierarchy (parent-child communities)
- [ ] Regional moderation roles
- [ ] Advanced recommendation algorithm
- [ ] Mobile app push notifications
- [ ] Community API for third-party integrations

---

## 🎯 Design Guidelines

### Visual Design

**Color Usage:**
- Each community has unique accent color (customizable)
- Default: HomeLinks brand blue (#00A3E0)
- Use accent for: buttons, badges, highlights, community identity
- Maintain contrast ratios (WCAG AA)

**Typography:**
- **Headings:** Inter Bold (20-28px)
- **Body:** Inter Regular (14-16px)
- **Labels:** Inter Medium (12-14px)
- **Community Name:** Inter Bold (24px) with community accent color

**Spacing:**
- Section gaps: 24px (mobile), 32px (desktop)
- Card padding: 16px (mobile), 20px (desktop)
- Element spacing: 8px, 12px, 16px, 24px (8px grid)

**Components:**
- Use HomeLinks design system (Button, Card, Badge, Avatar)
- Community-specific: CommunityCard, PulseItem, HelpRequest, CircleBadge
- Consistent rounded corners (12px cards, 8px badges)

### Interaction Patterns

**Post Engagement:**
- 👍 Helpful (not "Like" - emphasizes usefulness)
- 💬 Comment (encourage thoughtful responses)
- 🔁 Share (to circles or other communities)
- 🔖 Save (personal bookmarks)

**Notification Priority:**
- 🚨 **Critical** - Safety alerts, direct mentions
- ⚠️ **High** - Help requests in circles, event reminders
- 📌 **Normal** - New comments on posts, reactions
- 📧 **Low** - Weekly digest, community milestones

**Mobile Gestures:**
- Swipe right on post → Quick "Helpful" reaction
- Long press → Show reaction menu (helpful, love, wow)
- Pull to refresh → Reload community feed
- Swipe left on notification → Dismiss

### Accessibility

**WCAG AA Compliance:**
- Color contrast ratios >4.5:1 for text
- Focus indicators on all interactive elements
- Alt text for images (auto-generated + user editable)
- Keyboard navigation support

**Screen Reader Support:**
- Semantic HTML (nav, article, aside, section)
- ARIA labels on icons and badges
- ARIA live regions for dynamic updates
- Skip navigation links

**Multi-language Support (Future):**
- Swahili (Kiswahili) - Primary local language
- English - Default
- Kikuyu, Kimeru - Regional languages

---

## 📝 Content Guidelines

### Post Quality Standards

**Encouraged:**
- Specific, actionable questions
- Detailed recommendations with context
- Help requests with clear descriptions
- Local event announcements
- Safety alerts with verified information
- Neighborhood improvement suggestions

**Discouraged:**
- Vague posts ("Anyone know anything about...")
- Self-promotion without value (spam)
- Off-topic discussions (national politics, gossip)
- Duplicate posts (use search first)
- External links without context

### Moderation Principles

**Community-First Approach:**
- Moderators are trusted community members (not external admins)
- Transparent moderation (removal reasons visible)
- Community input on guidelines (periodic polls)
- Escalation path (appeal to higher-level admins)

**Education Over Punishment:**
- First-time violations → Warning + explanation
- Repeat violations → Temporary suspension + guidance
- Severe violations → Permanent ban (hate speech, threats, fraud)

---

## 🔮 Future Enhancements

### Advanced Features (6-12 months)

1. **Community Marketplace**
   - Dedicated marketplace within community (hyperlocal buying/selling)
   - Group buying (bulk discounts for community)
   - Community-verified sellers

2. **Local Services Directory**
   - Curated list of trusted service providers
   - Community ratings/reviews
   - Booking/scheduling integration

3. **Community Wallet**
   - Shared funds for community projects
   - Micro-donations for neighborhood improvements
   - Transparent fund tracking

4. **Event Management**
   - Full event creation/management
   - RSVP tracking
   - Event reminders
   - Photo/video sharing post-event

5. **Community Insights**
   - Rental market trends (average prices, availability)
   - Safety statistics (crime reports, incidents)
   - Business directory (local shops, services)
   - Transport updates (matatu routes, schedules)

6. **AI-Powered Features**
   - Smart content recommendations (personalized feed)
   - Auto-categorization of posts
   - Sentiment analysis for moderation
   - Predictive alerts (based on patterns)

---

## 📞 Support & Resources

### For Users

**Help Center:**
- How to join a community
- How to post help requests
- Understanding reputation scores
- Community guidelines
- Safety tips

**Contact:**
- In-app support chat
- Email: community@homelinks.co.ke
- Phone: +254 XXX XXX XXX (business hours)

### For Moderators

**Moderator Guide:**
- Moderation best practices
- How to handle conflicts
- Escalation procedures
- Community building tips

**Training:**
- New moderator onboarding (2-hour session)
- Monthly moderator meetings
- Dedicated Slack/WhatsApp group

### For Developers

**API Documentation:**
- Community endpoints
- Post creation/management
- User reputation system
- Webhooks for real-time updates

**GitHub Repository:**
- Open-source community components
- Contribution guidelines
- Issue tracking

---

## 🏁 Conclusion

HomeLinks Community transforms the platform from a simple housing/marketplace app into a **digital neighborhood** where users experience a sense of belonging, discover local opportunities, and help each other daily. By focusing on hyperlocal relevance, structured interactions, and deep ecosystem integration, the community becomes the **central layer** connecting housing, commerce, and everyday life.

**Key Success Factors:**
1. **Hyperlocal Focus** - Everything relevant to user's immediate area
2. **Daily Utility** - Users open app for practical needs, not just transactions
3. **Trust & Safety** - Verified users, reputation scores, active moderation
4. **Ecosystem Integration** - Community enhances listings, marketplace, Budget Bite
5. **Belonging** - Community identity, circles, milestones create attachment

**Vision:** Users open HomeLinks not just when they need a house, but daily because it feels like their **local digital home base**—where their home, community, and ecosystem naturally come together.

---

**Document Version**: 1.0  
**Last Updated**: March 6, 2026  
**Next Review**: After Phase 2 implementation  
**Maintained By**: HomeLinks Product Team
