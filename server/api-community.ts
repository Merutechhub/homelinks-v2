import express, { type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get profile
router.get('/profiles/:userId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .schema('v2')
      .from('profiles')
      .select('*')
      .eq('id', req.params.userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Update profile
router.put('/profiles/:userId', async (req: Request, res: Response) => {
  try {
    const { username, bio, location, avatar_url } = req.body;
    const { data, error } = await supabase
      .schema('v2')
      .from('profiles')
      .update({
        username,
        bio,
        location,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Get user reputation
router.get('/reputation/:userId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .schema('v2')
      .from('user_reputation')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Add reputation/rating
router.post('/reputation/:userId', async (req: Request, res: Response) => {
  try {
    const { rating_value, comment } = req.body;
    const userId = req.params.userId;
    const ratingFromUserId = (req as any).user?.id;

    if (!ratingFromUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .schema('v2')
      .from('user_reputation')
      .insert({
        user_id: userId,
        rating_from_user_id: ratingFromUserId,
        rating_value,
        comment,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Get user badges
router.get('/badges/:userId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .schema('v2')
      .from('user_badges')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Get comments for entity
router.get('/comments/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const { data, error } = await supabase
      .schema('v2')
      .from('entity_comments')
      .select(`
        *,
        author:author_id(username, avatar_url)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Add comment
router.post('/comments/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const { content, reply_to_comment_id } = req.body;
    const authorId = (req as any).user?.id;

    if (!authorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .schema('v2')
      .from('entity_comments')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        author_id: authorId,
        content,
        reply_to_comment_id: reply_to_comment_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Delete comment
router.delete('/comments/:commentId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .schema('v2')
      .from('entity_comments')
      .delete()
      .eq('id', req.params.commentId)
      .eq('author_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Get reactions for entity
router.get('/reactions/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const { data, error } = await supabase
      .schema('v2')
      .from('entity_reactions')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Add reaction
router.post('/reactions/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const { reaction_emoji } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .schema('v2')
      .from('entity_reactions')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId,
        reaction_emoji,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Remove reaction
router.delete('/reactions/:entityType/:entityId/:emoji', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, emoji } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const emojiString = Array.isArray(emoji) ? emoji[0] : emoji;

    const { error } = await supabase
      .schema('v2')
      .from('entity_reactions')
      .delete()
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('user_id', userId)
      .eq('reaction_emoji', decodeURIComponent(emojiString));

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;
