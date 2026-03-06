import { type Request, type Response, type NextFunction } from 'express';
import { supabase } from '../storage';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  permissions?: string[];
}

// Middleware to extract and verify user from JWT token
export async function authenticateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'renter',
    };

    // Fetch user's role and permissions from database
    const { data: roleData } = await supabase
      .from('user_roles')
      .select(`
        primary_role,
        role_permissions (
          permissions
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (roleData) {
      req.user.role = roleData.primary_role;
      const perms = roleData.role_permissions as any;
      req.permissions = (Array.isArray(perms) && perms[0]?.permissions) || perms?.permissions || [];
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Middleware to check if user has required role
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

// Middleware to check if user has specific permission
export function requirePermission(...permissions: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userPermissions = req.permissions || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      res.status(403).json({
        error: 'Forbidden',
        message: `You don't have permission to perform this action`,
      });
      return;
    }

    next();
  };
}

// Middleware to check if user has multiple permissions (AND)
export function requireAllPermissions(...permissions: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userPermissions = req.permissions || [];
    const hasAllPermissions = permissions.every(p => userPermissions.includes(p));

    if (!hasAllPermissions) {
      res.status(403).json({
        error: 'Forbidden',
        message: `You don't have all required permissions`,
      });
      return;
    }

    next();
  };
}

// Middleware to check if user owns a resource
export async function requireOwnership(
  resourceTable: string,
  userIdField: string = 'user_id'
) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const resourceId = req.params.id;

      const { data } = await supabase
        .from(resourceTable)
        .select('*')
        .eq('id', resourceId)
        .single();

      if (!data) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      if (data[userIdField] !== req.user.id) {
        res.status(403).json({ error: 'You do not own this resource' });
        return;
      }

      req.user = { ...req.user, ...data };
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

// Rate limiting by role
export function rateLimitByRole(limits: Record<string, number>) {
  const requestCounts = new Map<string, number[]>();

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const role = req.user.role;
    const limit = limits[role] || 100; // Default 100 requests per minute
    const key = `${req.user.id}:${req.path}`;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const requests = requestCounts.get(key) || [];
    const recentRequests = requests.filter(time => time > oneMinuteAgo);

    if (recentRequests.length >= limit) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((recentRequests[0] + 60000 - now) / 1000),
      });
      return;
    }

    recentRequests.push(now);
    requestCounts.set(key, recentRequests);
    next();
  };
}

// Get user's permissions from database
export async function getUserPermissions(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('user_roles')
    .select(`
      primary_role,
      role_permissions!inner (
        permissions
      )
    `)
    .eq('user_id', userId)
    .single();

  if (!data) {
    return [];
  }

  const perms = data.role_permissions as any;
  const permObj = (Array.isArray(perms) && perms[0]?.permissions) || perms?.permissions;
  
  if (!permObj) {
    return [];
  }

  return Object.keys(permObj).filter(
    (key: string) => permObj[key] === true
  );
}

// Check if user can perform action
export async function userCanPerform(
  userId: string,
  permission: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}
