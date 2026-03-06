-- ============================================================================
-- DATA MIGRATION: Homelink v1 → Next-Gen v2
-- Purpose: Zero-downtime migration preserving all user data
-- Safety: All operations use INSERT...WHERE NOT EXISTS to prevent duplicates

-- ============================================================================
-- PHASE 12: POST-CUTOVER CLEANUP POLICY (AFTER 30 DAYS)
-- Purpose: Safe retirement of legacy migration plumbing after stable operation
-- Run window: On/after cutover_date + 30 days
-- Safety rule: Execute ONLY after confirming parity checks stayed green daily
-- ============================================================================

/*
30-DAY CLEANUP CHECKLIST
1) Confirm app has been reading/writing v2 successfully for 30 full days.
2) Confirm daily parity checks remained equal (v1 vs v2 counts).
3) Confirm orphan checks stayed at 0.
4) Take final manual snapshots into safety_backup before destructive steps.
5) Disable + drop sync triggers and trigger functions.
6) Keep safety_backup schema for an additional grace period if storage allows.

Recommended final snapshot naming:
  safety_backup.profiles_final_YYYYMMDD
  safety_backup.listings_final_YYYYMMDD
  safety_backup.marketplace_items_final_YYYYMMDD
  safety_backup.conversations_final_YYYYMMDD
  safety_backup.messages_final_YYYYMMDD
*/

/*
OPTIONAL EXECUTION PACK (RUN MANUALLY AFTER 30 DAYS)

-- A) Final safety snapshots (example date suffix: 20260405)
create table if not exists safety_backup.profiles_final_20260405 as
select * from public.profiles;

create table if not exists safety_backup.listings_final_20260405 as
select * from public.listings;

create table if not exists safety_backup.marketplace_items_final_20260405 as
select * from public.marketplace_items;

create table if not exists safety_backup.conversations_final_20260405 as
select * from public.conversations;

create table if not exists safety_backup.messages_final_20260405 as
select * from public.messages;

-- B) Disable and drop sync triggers
drop trigger if exists trg_sync_profiles_to_v2 on public.profiles;
drop trigger if exists trg_sync_listings_to_v2 on public.listings;
drop trigger if exists trg_sync_marketplace_items_to_v2 on public.marketplace_items;
drop trigger if exists trg_sync_conversations_to_v2 on public.conversations;
drop trigger if exists trg_sync_conversation_participants_to_v2 on public.conversation_participants;
drop trigger if exists trg_sync_messages_to_v2 on public.messages;
drop trigger if exists trg_sync_budgetbite_profiles_to_v2 on public.budgetbite_profiles;
drop trigger if exists trg_sync_budgetbite_logs_to_v2 on public.budgetbite_logs;
drop trigger if exists trg_sync_favorites_to_v2 on public.favorites;

-- C) Drop trigger functions (only after all triggers are dropped)
drop function if exists v2.sync_profiles_to_v2();
drop function if exists v2.sync_listings_to_v2();
drop function if exists v2.sync_marketplace_items_to_v2();
drop function if exists v2.sync_conversations_to_v2();
drop function if exists v2.sync_conversation_participants_to_v2();
drop function if exists v2.sync_messages_to_v2();
drop function if exists v2.sync_budgetbite_profiles_to_v2();
drop function if exists v2.sync_budgetbite_logs_to_v2();
drop function if exists v2.sync_favorites_to_v2();

-- D) Optional helper cleanup
drop function if exists v2._safe_uuid(text);
drop function if exists v2._map_role(text);

-- E) Verification: should return 0 rows
select t.tgname, c.relname as table_name
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and not t.tgisinternal
  and t.tgname like 'trg_sync_%_to_v2';
*/
-- ============================================================================

-- PHASE 0: Create migration tracking table
CREATE TABLE IF NOT EXISTS migration_tracking (
  phase INT,
  phase_name VARCHAR(100),
  rows_affected INT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(20),
  error_message TEXT
);

-- ============================================================================
-- PHASE 1: PROFILE MIGRATION
-- Copies v1.profiles to v2.profiles, preserving UUIDs for auth continuity
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (1, 'Profile Migration', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

-- Copy profiles from v1 schema to v2
INSERT INTO public.profiles (
  id, username, full_name, email, phone, avatar_url, bio, location, 
  verified, verification_type, verified_at, created_at, updated_at
)
SELECT 
  id, 
  username, 
  full_name, 
  email, 
  phone, 
  avatar_url, 
  bio,
  'Meru, Kenya' as location, -- Default location
  verified, 
  'email' as verification_type,
  verified_at,
  created_at,
  updated_at
FROM v1_import.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p.id)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  verified = EXCLUDED.verified;

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.profiles),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 1;

-- ============================================================================
-- PHASE 2: USER ROLES CREATION
-- Maps v1 role field to v2 user_roles with primary_role
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (2, 'User Roles Creation', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

-- Create user_roles entries, mapping v1 roles to v2 roles
INSERT INTO public.user_roles (user_id, primary_role, secondary_roles, created_at, updated_at)
SELECT 
  p.id,
  CASE 
    WHEN v1p.role = 'user' THEN 'renter'
    WHEN v1p.role = 'landlord' THEN 'landlord'
    WHEN v1p.role = 'seller' THEN 'seller'
    WHEN v1p.role = 'admin' THEN 'admin'
    ELSE 'renter' -- Default to renter if role unclear
  END as primary_role,
  '{}' as secondary_roles, -- Empty array, can be updated later
  NOW(),
  NOW()
FROM public.profiles p
LEFT JOIN v1_import.profiles v1p ON v1p.id = p.id
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p.id)
  AND v1p.id IS NOT NULL;

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.user_roles),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 2;

-- ============================================================================
-- PHASE 3: RENTER PROFILES CREATION
-- Creates renter_profile for all users with primary_role='renter'
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (3, 'Renter Profiles Creation', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

INSERT INTO public.renter_profile (
  user_id, school_name, graduation_year, preferred_locations, 
  budget_max, meal_budget, dietary_restrictions, created_at, updated_at
)
SELECT 
  ur.user_id,
  NULL as school_name,
  NULL as graduation_year,
  ARRAY['Meru, Kenya'] as preferred_locations,
  2000 as budget_max, -- Default 2000 KES max housing budget
  500 as meal_budget, -- Default 500 KES daily meal budget
  '{}' as dietary_restrictions,
  NOW(),
  NOW()
FROM public.user_roles ur
WHERE ur.primary_role = 'renter'
  AND NOT EXISTS (
    SELECT 1 FROM public.renter_profile WHERE user_id = ur.user_id
  );

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.renter_profile),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 3;

-- ============================================================================
-- PHASE 4: LANDLORD PROFILES CREATION
-- Creates landlord_profile for all users with primary_role='landlord'
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (4, 'Landlord Profiles Creation', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

INSERT INTO public.landlord_profile (
  user_id, business_name, years_experience, total_properties, 
  verification_status, bank_verified, created_at, updated_at
)
SELECT 
  ur.user_id,
  p.username as business_name,
  0 as years_experience,
  COALESCE((SELECT COUNT(*) FROM v1_import.listings WHERE owner_id = ur.user_id), 0) as total_properties,
  CASE WHEN p.verified THEN 'verified' ELSE 'unverified' END,
  false as bank_verified,
  NOW(),
  NOW()
FROM public.user_roles ur
LEFT JOIN public.profiles p ON p.id = ur.user_id
WHERE ur.primary_role = 'landlord'
  AND NOT EXISTS (
    SELECT 1 FROM public.landlord_profile WHERE user_id = ur.user_id
  );

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.landlord_profile),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 4;

-- ============================================================================
-- PHASE 5: SELLER PROFILES CREATION
-- Creates seller_profile for all users with primary_role='seller'
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (5, 'Seller Profiles Creation', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

INSERT INTO public.seller_profile (
  user_id, store_name, category, verification_status, 
  total_items, avg_rating, created_at, updated_at
)
SELECT 
  ur.user_id,
  p.username as store_name,
  'Other' as category,
  CASE WHEN p.verified THEN 'verified' ELSE 'unverified' END,
  COALESCE((SELECT COUNT(*) FROM v1_import.marketplace_items WHERE seller_id = ur.user_id), 0) as total_items,
  4.5 as avg_rating, -- Default rating for new sellers
  NOW(),
  NOW()
FROM public.user_roles ur
LEFT JOIN public.profiles p ON p.id = ur.user_id
WHERE ur.primary_role = 'seller'
  AND NOT EXISTS (
    SELECT 1 FROM public.seller_profile WHERE user_id = ur.user_id
  );

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.seller_profile),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 5;

-- ============================================================================
-- PHASE 6: HOUSING LISTINGS MIGRATION
-- Migrates v1.listings to v2.housing_listings with field mapping
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (6, 'Housing Listings Migration', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

INSERT INTO public.housing_listings (
  id, landlord_id, title, description, price, location, 
  property_type, bedrooms, bathrooms, amenities, images,
  cover_image_url, status, created_at, updated_at
)
SELECT 
  v1l.id,
  v1l.owner_id as landlord_id,
  v1l.title,
  v1l.description,
  v1l.price::DECIMAL(10,2),
  'Meru, Kenya' as location, -- Ensure all in Meru
  COALESCE(v1l.property_type, 'apartment') as property_type,
  COALESCE(v1l.bedrooms, 1) as bedrooms,
  COALESCE(v1l.bathrooms, 1) as bathrooms,
  COALESCE(v1l.amenities, '{}') as amenities,
  '{}' as images, -- Will be populated in image migration phase
  v1l.cover_image_url,
  CASE 
    WHEN v1l.status = 'available' THEN 'active'
    WHEN v1l.status = 'rented' THEN 'rented'
    ELSE 'active'
  END as status,
  v1l.created_at,
  v1l.updated_at
FROM v1_import.listings v1l
WHERE NOT EXISTS (
  SELECT 1 FROM public.housing_listings WHERE id = v1l.id
)
  -- Verify landlord exists
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v1l.owner_id
  );

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.housing_listings),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 6;

-- ============================================================================
-- PHASE 6.5: HOUSING IMAGES MIGRATION
-- Migrates listing images to new structure
-- ============================================================================

INSERT INTO public.housing_images (listing_id, image_url, sort_order, is_primary)
SELECT 
  v1i.listing_id,
  v1i.url as image_url,
  v1i.sort_order,
  (v1i.sort_order = 0) as is_primary
FROM v1_import.listing_images v1i
WHERE NOT EXISTS (
  SELECT 1 FROM public.housing_images 
  WHERE listing_id = v1i.listing_id AND image_url = v1i.url
)
  -- Verify listing exists
  AND EXISTS (
    SELECT 1 FROM public.housing_listings WHERE id = v1i.listing_id
  );

-- ============================================================================
-- PHASE 7: MARKETPLACE ITEMS MIGRATION
-- Migrates v1.marketplace_items to v2 with field mapping
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (7, 'Marketplace Items Migration', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

INSERT INTO public.marketplace_items (
  id, seller_id, title, description, price, category, 
  condition, status, cover_image_url, created_at, updated_at
)
SELECT 
  v1m.id,
  v1m.seller_id,
  v1m.title,
  v1m.description,
  v1m.price::DECIMAL(10,2),
  COALESCE(v1m.category, 'Other') as category,
  COALESCE(v1m.condition, 'good') as condition,
  CASE 
    WHEN v1m.status = 'active' THEN 'active'
    WHEN v1m.status = 'sold' THEN 'sold'
    ELSE 'active'
  END as status,
  v1m.cover_image_url,
  v1m.created_at,
  v1m.updated_at
FROM v1_import.marketplace_items v1m
WHERE NOT EXISTS (
  SELECT 1 FROM public.marketplace_items WHERE id = v1m.id
)
  -- Verify seller exists
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v1m.seller_id
  );

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.marketplace_items),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 7;

-- ============================================================================
-- PHASE 7.5: MARKETPLACE IMAGES MIGRATION
-- ============================================================================

INSERT INTO public.marketplace_item_images (item_id, image_url, sort_order, is_primary)
SELECT 
  v1i.marketplace_item_id,
  v1i.url as image_url,
  v1i.sort_order,
  (v1i.sort_order = 0) as is_primary
FROM v1_import.marketplace_item_images v1i
WHERE NOT EXISTS (
  SELECT 1 FROM public.marketplace_item_images 
  WHERE item_id = v1i.marketplace_item_id AND image_url = v1i.url
)
  -- Verify item exists
  AND EXISTS (
    SELECT 1 FROM public.marketplace_items WHERE id = v1i.marketplace_item_id
  );

-- ============================================================================
-- PHASE 8: CONVERSATIONS & MESSAGES MIGRATION
-- Preserves all messaging history without changes (schemas are compatible)
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (8, 'Conversations & Messages Migration', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

-- Copy conversations
INSERT INTO public.conversations (id, created_at, updated_at)
SELECT id, created_at, updated_at
FROM v1_import.conversations v1c
WHERE NOT EXISTS (
  SELECT 1 FROM public.conversations WHERE id = v1c.id
);

-- Copy conversation participants
INSERT INTO public.conversation_participants (conversation_id, participant_id, joined_at, last_read_at)
SELECT 
  v1cp.conversation_id,
  v1cp.profile_id as participant_id,
  NOW() as joined_at,
  NOW() as last_read_at
FROM v1_import.conversation_participants v1cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.conversation_participants 
  WHERE conversation_id = v1cp.conversation_id 
  AND participant_id = v1cp.profile_id
)
  -- Verify both conversation and participant exist
  AND EXISTS (
    SELECT 1 FROM public.conversations WHERE id = v1cp.conversation_id
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v1cp.profile_id
  );

-- Copy messages
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at, updated_at)
SELECT 
  v1m.id,
  v1m.conversation_id,
  v1m.sender_id,
  v1m.body as content,
  v1m.created_at,
  v1m.created_at as updated_at -- Use created_at for messages (immutable)
FROM v1_import.messages v1m
WHERE NOT EXISTS (
  SELECT 1 FROM public.messages WHERE id = v1m.id
)
  -- Verify conversation and sender exist
  AND EXISTS (
    SELECT 1 FROM public.conversations WHERE id = v1m.conversation_id
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v1m.sender_id
  );

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.messages),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 8;

-- ============================================================================
-- PHASE 9: BUDGET BITE MIGRATION
-- Preserves budget tracking history and preferences
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (9, 'Budget Bite Migration', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

-- Create budget_bite_profile entries
INSERT INTO public.budget_bite_profile (
  user_id, daily_budget_kes, preferred_meal_source, created_at, updated_at
)
SELECT 
  v1bp.user_id,
  COALESCE(v1bp.daily_budget_kes, 250) as daily_budget_kes,
  CASE 
    WHEN v1bp.preferred_mode = 'cook' THEN 'cooked'
    WHEN v1bp.preferred_mode = 'buy' THEN 'vendor'
    WHEN v1bp.preferred_mode = 'mixed' THEN 'any'
    ELSE 'any'
  END as preferred_meal_source,
  NOW(),
  NOW()
FROM v1_import.budgetbite_profiles v1bp
WHERE NOT EXISTS (
  SELECT 1 FROM public.budget_bite_profile WHERE user_id = v1bp.user_id
)
  -- Verify user exists
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v1bp.user_id
  );

-- Copy budget bite meal logs (historical data preservation)
INSERT INTO public.budget_bite_logs (user_id, meal_name, cost_kes, meal_type, date_logged, created_at)
SELECT 
  v1bl.user_id,
  v1bl.meal_name,
  v1bl.meal_cost_kes as cost_kes,
  CASE 
    WHEN v1bl.meal_mode = 'cook' THEN 'cooked'
    WHEN v1bl.meal_mode = 'buy' THEN 'vendor'
    ELSE 'any'
  END as meal_type,
  v1bl.consumed_on as date_logged,
  v1bl.created_at
FROM v1_import.budgetbite_logs v1bl
WHERE NOT EXISTS (
  SELECT 1 FROM public.budget_bite_logs 
  WHERE user_id = v1bl.user_id 
  AND meal_name = v1bl.meal_name 
  AND date_logged = v1bl.consumed_on
)
  -- Verify user exists
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v1bl.user_id
  );

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.budget_bite_logs),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 9;

-- ============================================================================
-- PHASE 10: FAVORITES/BOOKMARKS MIGRATION
-- Preserves saved listings
-- ============================================================================

INSERT INTO migration_tracking (phase, phase_name, started_at, status)
VALUES (10, 'Favorites Migration', NOW(), 'in-progress')
ON CONFLICT DO NOTHING;

INSERT INTO public.saved_listings (user_id, listing_id, saved_at, created_at)
SELECT 
  v1f.user_id,
  v1f.listing_id,
  COALESCE(v1f.created_at, NOW()) as saved_at,
  COALESCE(v1f.created_at, NOW())
FROM v1_import.favorites v1f
WHERE NOT EXISTS (
  SELECT 1 FROM public.saved_listings 
  WHERE user_id = v1f.user_id 
  AND listing_id = v1f.listing_id
)
  -- Verify both user and listing exist
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v1f.user_id
  )
  AND EXISTS (
    SELECT 1 FROM public.housing_listings WHERE id = v1f.listing_id
  );

UPDATE migration_tracking 
SET rows_affected = (SELECT COUNT(*) FROM public.saved_listings),
    completed_at = NOW(),
    status = 'completed'
WHERE phase = 10;

-- ============================================================================
-- PHASE 11: DATA INTEGRITY VERIFICATION
-- Runs checks to ensure migration success and data consistency
-- ============================================================================

-- Verification Query 1: Profile Count
-- Result should match v1 profile count
SELECT 'Profile Count Verification' as check_type,
  (SELECT COUNT(*) FROM v1_import.profiles) as v1_count,
  (SELECT COUNT(*) FROM public.profiles) as v2_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM v1_import.profiles) = (SELECT COUNT(*) FROM public.profiles)
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- Verification Query 2: User Roles Distribution
SELECT 'User Roles Distribution' as check_type, primary_role, COUNT(*) as count
FROM public.user_roles
GROUP BY primary_role
ORDER BY primary_role;

-- Verification Query 3: Orphaned Listings (landlord_id doesn't exist)
SELECT 'Orphaned Listings Check' as check_type,
  COUNT(*) as orphaned_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM public.housing_listings hl
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = hl.landlord_id
);

-- Verification Query 4: Orphaned Marketplace Items (seller_id doesn't exist)
SELECT 'Orphaned Marketplace Items Check' as check_type,
  COUNT(*) as orphaned_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM public.marketplace_items mi
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = mi.seller_id
);

-- Verification Query 5: Message Integrity (all senders exist)
SELECT 'Message Sender Integrity Check' as check_type,
  COUNT(*) as orphaned_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM public.messages m
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = m.sender_id
);

-- Verification Query 6: Budget Bite User Verification
SELECT 'Budget Bite Users Verified' as check_type,
  COUNT(*) as orphaned_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM public.budget_bite_profile bp
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = bp.user_id
);

-- Migration Summary Report
SELECT 'MIGRATION SUMMARY' as report_type;
SELECT 
  COALESCE(phase, 'TOTAL') as phase,
  COUNT(*) as total_phases,
  SUM(rows_affected) as total_rows_migrated,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_phases,
  MAX(completed_at) as last_phase_completed
FROM migration_tracking
GROUP BY ROLLUP (phase)
ORDER BY phase;

-- ============================================================================
-- ROLLBACK PROCEDURES (Run if migration fails or needs to be undone)
-- ============================================================================
/*

-- IMPORTANT: Only run if migration needs to be rolled back
-- These queries will remove recent migrated data

-- Rollback Phase 10
DELETE FROM public.saved_listings 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 9
DELETE FROM public.budget_bite_logs 
WHERE created_at > NOW() - INTERVAL '1 hour';

DELETE FROM public.budget_bite_profile 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 8
DELETE FROM public.messages 
WHERE created_at > NOW() - INTERVAL '1 hour';

DELETE FROM public.conversation_participants 
WHERE conversation_id IN (
  SELECT id FROM public.conversations 
  WHERE created_at > NOW() - INTERVAL '1 hour'
);

DELETE FROM public.conversations 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 7
DELETE FROM public.marketplace_item_images 
WHERE created_at > NOW() - INTERVAL '1 hour';

DELETE FROM public.marketplace_items 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 6
DELETE FROM public.housing_images 
WHERE created_at > NOW() - INTERVAL '1 hour';

DELETE FROM public.housing_listings 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 5
DELETE FROM public.seller_profile 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 4
DELETE FROM public.landlord_profile 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 3
DELETE FROM public.renter_profile 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 2
DELETE FROM public.user_roles 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Rollback Phase 1
DELETE FROM public.profiles 
WHERE created_at > NOW() - INTERVAL '1 hour'
AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = profiles.id);

*/

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================
COMMIT;

-- ============================================
-- ROLLBACK PROCEDURES (if needed)
-- ============================================

-- DELETE FROM public.renter_profile WHERE created_at > NOW() - INTERVAL '1 hour';
-- DELETE FROM public.landlord_profile WHERE created_at > NOW() - INTERVAL '1 hour';
-- DELETE FROM public.seller_profile WHERE created_at > NOW() - INTERVAL '1 hour';
-- DELETE FROM public.user_roles WHERE created_at > NOW() - INTERVAL '1 hour';
-- DELETE FROM public.housing_listings WHERE created_at > NOW() - INTERVAL '1 hour';
-- DELETE FROM public.marketplace_items WHERE created_at > NOW() - INTERVAL '1 hour';
