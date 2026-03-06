# Database Migration Suite

Complete, consistent migration suite for Homelink platform (all 15 phases).

## Migration Files

### 001_core_tables.sql
**Phase**: Foundation (0)
**Tables**: 10
**Purpose**: Core authentication, roles, and media infrastructure
**Key Tables**:
- `profiles` - User profiles
- `media_uploads` - Image/media storage
- `user_roles` - Role assignment (admin, student, landlord, seller)
- `role_permissions` - Permission matrix
- `role_audit_log` - Role change tracking
- `student_profile` - Student-specific data
- `landlord_profile` - Landlord-specific data
- `seller_profile` - Seller-specific data
- `admin_profile` - Admin-specific data
- `role_permissions` - Permission definitions

**Dependencies**: None (foundational)

---

### 002_phase1_2_images_messaging.sql
**Phases**: 1-2
**Tables**: 8
**Purpose**: Image upload system and messaging infrastructure
**Key Tables**:
- `image_signatures` - Cloudinary image references
- `conversations` - Chat conversations
- `conversation_participants` - Participant tracking
- `messages` - Individual messages
- `message_reactions` - Message emoji reactions
- Plus media and attachment support

**Dependencies**: Requires `001_core_tables.sql`

---

### 003_phase3_marketplace.sql
**Phase**: 3
**Tables**: 6
**Purpose**: Buy/sell marketplace with orders and reviews
**Key Tables**:
- `marketplace_listings` - Items for sale
- `listing_images` - Product images
- `marketplace_orders` - Purchase orders
- `order_messages` - Order communication
- `saved_marketplace_items` - Wishlist
- `marketplace_reviews` - Buyer/seller ratings

**Dependencies**: Requires `002_phase1_2_images_messaging.sql`

---

### 004_phase4_5_feed_social.sql
**Phases**: 4-5
**Tables**: 6
**Purpose**: Social feed, posts, and community engagement
**Key Tables**:
- `posts` - User posts
- `post_media` - Post images/videos
- `comments` - Post comments
- `post_reactions` - Likes/reactions
- `feed_cache` - Performance cache
- `saved_posts` - Bookmarks

**Dependencies**: Requires `003_phase3_marketplace.sql`

---

### 005_phase6_community_reputation.sql
**Phase**: 6
**Tables**: 6
**Purpose**: Community features, reputation system, verification
**Key Tables**:
- `user_badges` - Achievement badges
- `user_reputation` - Reputation scores
- `entity_comments` - Generic comments (listings, profiles, etc)
- `entity_reactions` - Generic reactions
- `verification_documents` - ID/background checks
- `user_follows` - Following/blocking system

**Dependencies**: Requires `004_phase4_5_feed_social.sql`

---

### 006_phase7_8_9_budget_housing_ads.sql
**Phases**: 7-9
**Tables**: 13
**Purpose**: Budget meals sharing, housing listings, and ads
**Key Tables**:

**Budget Bite** (Phase 7):
- `meals` - Shared meals
- `meal_ingredients` - Recipe ingredients
- `meal_orders` - Meal purchases
- `cooking_logs` - Cooking history

**Housing** (Phase 8):
- `housing_listings` - Property listings
- `housing_images` - Property photos
- `housing_applications` - Rental applications
- `housing_reviews` - Property reviews

**Ads** (Phase 9):
- `ads` - Advertisement placements
- `ad_impressions` - Ad view tracking
- `ad_clicks` - Ad click tracking

**Dependencies**: Requires `005_phase6_community_reputation.sql`

---

### 007_phase10_14_infrastructure.sql
**Phases**: 10-14
**Tables**: 10
**Purpose**: Infrastructure, notifications, analytics, and moderation
**Key Tables**:
- `notifications` - User notifications
- `device_tokens` - Push notification subscriptions
- `user_activity` - Activity tracking for analytics
- `saved_items` - General wishlist
- `search_history` - Search analytics
- `user_preferences` - User settings
- `platform_stats` - Admin dashboard stats
- `flagged_content` - Moderation queue
- `reports` - User reports
- `api_usage` - API analytics

**Dependencies**: Requires `006_phase7_8_9_budget_housing_ads.sql`

---

## Migration Order

Migrations MUST be run in sequence:

```
1. 001_core_tables.sql           (Core infrastructure)
2. 002_phase1_2_images_messaging.sql (Images & messaging)
3. 003_phase3_marketplace.sql    (Marketplace)
4. 004_phase4_5_feed_social.sql  (Feed & social)
5. 005_phase6_community_reputation.sql (Community)
6. 006_phase7_8_9_budget_housing_ads.sql (Budget/Housing/Ads)
7. 007_phase10_14_infrastructure.sql (Infrastructure)
```

## Running Migrations

### Option 1: Use the Script
```bash
chmod +x server/migrations/run-migrations.sh
./server/migrations/run-migrations.sh
```

### Option 2: Manual (psql)
```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/homelink"

# Run migrations in order
psql $DATABASE_URL -f server/migrations/001_core_tables.sql
psql $DATABASE_URL -f server/migrations/002_phase1_2_images_messaging.sql
psql $DATABASE_URL -f server/migrations/003_phase3_marketplace.sql
psql $DATABASE_URL -f server/migrations/004_phase4_5_feed_social.sql
psql $DATABASE_URL -f server/migrations/005_phase6_community_reputation.sql
psql $DATABASE_URL -f server/migrations/006_phase7_8_9_budget_housing_ads.sql
psql $DATABASE_URL -f server/migrations/007_phase10_14_infrastructure.sql
```

### Option 3: Docker
```bash
docker exec homelink-db psql -U postgres -d homelink -f /migrations/001_core_tables.sql
# ... repeat for other migrations
```

## Database Statistics

| Metric | Count |
|--------|-------|
| Total Files | 7 |
| Total Tables | 59 |
| Total Policies (RLS) | 150+ |
| Total Indexes | 200+ |
| Total Views | 0 (tables only) |
| Total Functions | 0 (standard SQL only) |

## Feature Coverage

| Feature | Phase | Tables | Status |
|---------|-------|--------|--------|
| Authentication | 0 | profiles, user_roles | ✅ |
| Image Upload | 1 | media_uploads | ✅ |
| Messaging | 2 | conversations, messages | ✅ |
| Marketplace | 3 | marketplace_listings, orders | ✅ |
| Social Feed | 4-5 | posts, comments | ✅ |
| Community | 6 | user_badges, reputation | ✅ |
| Budget Bite | 7 | meals, meal_orders | ✅ |
| Housing | 8 | housing_listings, applications | ✅ |
| Ads | 9 | ads, impressions | ✅ |
| Infrastructure | 10-14 | notifications, analytics | ✅ |

## Row-Level Security (RLS)

All tables have RLS enabled with policies for:
- **Public views**: Anyone can view public data
- **User manage**: Users can manage their own data
- **Admin control**: Admins can manage platform data
- **Privacy**: Private/deleted data only visible to user + admins

## Indexes

Strategic indexes for performance:
- User lookups (by ID, email, username)
- Entity type/ID queries
- Date range queries
- Role/status filters
- Foreign key relationships

## Disaster Recovery

### Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

### Rollback Individual Migration
```bash
# Note: Current migrations are all CREATE TABLE
# Rollback by dropping tables in reverse order
psql $DATABASE_URL -c "DROP TABLE IF EXISTS table_name CASCADE;"
```

## Verification

### Check All Tables Created
```bash
psql $DATABASE_URL -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
# Should return: 59
```

### Check RLS Enabled
```bash
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;" 
# Should return all tables
```

### Check Indexes
```bash
psql $DATABASE_URL -c "SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';"
# Should return: 200+
```

## Troubleshooting

### Error: "relation already exists"
- Migration already ran successfully
- Safe to re-run (uses `IF NOT EXISTS` clauses)

### Error: "permission denied"
- Ensure user has superuser or adequate permissions
- Try with superuser account

### Error: "relation does not exist"
- Migrations out of order
- Run migrations in sequence as listed

### Error: "syntax error"
- Check PostgreSQL version (requires 12+)
- Verify file encoding is UTF-8

## Performance Considerations

- Indexes created on common query patterns
- RLS policies optimized for speed
- Foreign key constraints prevent orphaned data
- Partitioning ready for future optimization

## Security Features

- ✅ RLS on every table
- ✅ User data isolation
- ✅ Admin-only tables
- ✅ Audit logging
- ✅ Soft deletes ready (status columns)
- ✅ Encryption fields ready

## Next Steps

1. Run all 7 migrations
2. Verify table counts match expectations
3. Seed default data (admin roles, permissions)
4. Deploy backend API
5. Deploy frontend
6. Test end-to-end workflows

## Support

For migration issues:
1. Check migration files exist in `server/migrations/`
2. Verify database connection: `psql $DATABASE_URL -c "SELECT 1"`
3. Check PostgreSQL version: `psql --version` (requires 12+)
4. Review migration output for specific errors
5. Contact support with error message + migration file

---

**Status**: ✅ Complete & Tested
**Date**: March 5, 2026
**Version**: 1.0
**PostgreSQL**: 12+
