import { Router, type Response } from 'express';
import { supabase } from './storage';
import {
  authenticateUser,
  requireRole,
  requirePermission,
  type AuthRequest,
} from './middleware/roleAuth';

export const roleBasedRoutes = Router();

// Apply authentication to all routes
roleBasedRoutes.use(authenticateUser);

// =========================
// RENTER ROUTES
// =========================

roleBasedRoutes.post(
  '/renter/profile',
  requireRole('renter'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { school_name, budget_max, dietary_restrictions, preferred_locations } = req.body;

      const { data, error } = await supabase
        .from('renter_profile')
        .upsert({
          user_id: req.user?.id,
          school_name,
          budget_max,
          dietary_restrictions,
          preferred_locations,
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

roleBasedRoutes.get('/renter/profile', requireRole('renter'), async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .schema('v2')
      .from('renter_profile')
      .select('*')
      .eq('user_id', req.user?.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// =========================
// LANDLORD ROUTES
// =========================

roleBasedRoutes.get(
  '/landlord/properties',
  requireRole('landlord'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .schema('v2')
        .from('housing_listings')
        .select('*')
        .eq('landlord_id', req.user?.id);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch properties' });
    }
  }
);

roleBasedRoutes.post(
  '/landlord/properties',
  requireRole('landlord'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, price, address, amenities } = req.body;

      const { data, error } = await supabase
        .schema('v2')
        .from('housing_listings')
        .insert({
          landlord_id: req.user?.id,
          title,
          description,
          price,
          address,
          amenities,
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create property' });
    }
  }
);

roleBasedRoutes.get(
  '/landlord/applications',
  requireRole('landlord'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .schema('v2')
        .from('housing_applications')
        .select(`
          *,
          housing_listings!inner (
            landlord_id
          )
        `)
        .eq('housing_listings.landlord_id', req.user?.id);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }
);

// =========================
// SELLER ROUTES
// =========================

roleBasedRoutes.get('/seller/store', requireRole('seller'), async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .schema('v2')
      .from('seller_profile')
      .select('*')
      .eq('user_id', req.user?.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

roleBasedRoutes.post(
  '/seller/inventory',
  requireRole('seller'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, price, category, images, quantity } = req.body;

      const { data, error } = await supabase
        .schema('v2')
        .from('marketplace_listings')
        .insert({
          seller_id: req.user?.id,
          title,
          description,
          price,
          category,
          images,
          quantity,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }
);

roleBasedRoutes.get(
  '/seller/inventory',
  requireRole('seller'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .schema('v2')
        .from('marketplace_listings')
        .select('*')
        .eq('seller_id', req.user?.id);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }
);

roleBasedRoutes.get('/seller/orders', requireRole('seller'), async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select(`
        *,
        marketplace_listings!inner (
          seller_id
        )
      `)
      .eq('marketplace_listings.seller_id', req.user?.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// =========================
// ADMIN ROUTES
// =========================

roleBasedRoutes.get(
  '/admin/users',
  requireRole('admin'),
  requirePermission('manageUsers'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase.schema('v2').from('profiles').select('*').limit(50);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

roleBasedRoutes.patch(
  '/admin/users/:id/role',
  requireRole('admin'),
  requirePermission('manageUsers'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const { data, error } = await supabase
        .schema('v2')
        .from('user_roles')
        .update({ primary_role: role })
        .eq('user_id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the change
      await supabase.schema('v2').from('role_audit_log').insert({
        user_id: id,
        action: 'role_changed',
        role_from: 'previous',
        role_to: role,
        changed_by: req.user?.id,
      });

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

roleBasedRoutes.get(
  '/admin/analytics',
  requireRole('admin'),
  requirePermission('viewAnalytics'),
  async (_req: AuthRequest, res: Response) => {
    try {
      // Fetch analytics data
      const { data: users } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { data: listings } = await supabase
        .from('marketplace_listings')
        .select('*', { count: 'exact' });

      const { data: orders } = await supabase
        .from('marketplace_orders')
        .select('*', { count: 'exact' });

      res.json({
        totalUsers: users?.length || 0,
        totalListings: listings?.length || 0,
        totalOrders: orders?.length || 0,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
);

roleBasedRoutes.get(
  '/admin/audit-log',
  requireRole('admin'),
  requirePermission('viewAuditLog'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('role_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit log' });
    }
  }
);

roleBasedRoutes.post(
  '/admin/moderation/:id/action',
  requireRole('admin'),
  requirePermission('managePosts'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;

      // Process moderation action (remove, suspend, warn)
      const { data, error } = await supabase
        .from('posts')
        .update({
          moderation_status: action,
          moderation_reason: reason,
          moderated_by: req.user?.id,
          moderated_at: new Date(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to moderate content' });
    }
  }
);

// =========================
// ROLE SWITCHING (Multi-role support)
// =========================

roleBasedRoutes.post('/roles/switch', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;

    // Get user's roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('secondary_roles, primary_role')
      .eq('user_id', req.user?.id)
      .single();

    const availableRoles = [
      userRoles?.primary_role,
      ...(userRoles?.secondary_roles || []),
    ];

    if (!availableRoles.includes(role)) {
      res.status(403).json({ error: 'You do not have this role' });
      return;
    }

    // Update session with new role
    const { error } = await supabase
      .from('user_roles')
      .update({ primary_role: role })
      .eq('user_id', req.user?.id);

    if (error) throw error;

    res.json({ message: 'Role switched successfully', role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to switch role' });
  }
});

// =========================
// PUBLIC ROLE INFO
// =========================

roleBasedRoutes.get('/roles/my-info', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        primary_role,
        secondary_roles,
        role_permissions (
          permissions
        )
      `)
      .eq('user_id', req.user?.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role info' });
  }
});
