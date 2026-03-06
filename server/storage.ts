import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Supabase client for authentication and database operations
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Image metadata types
export interface ImageMetadata {
  id: string;
  user_id: string;
  public_id: string;
  secure_url: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes?: number;
  entity_type: "property" | "marketplace-item" | "profile" | "community-post";
  entity_id: string;
  width?: number;
  height?: number;
  aspect_ratio?: number;
  dominant_color?: string;
  display_order: number;
  is_primary: boolean;
  upload_status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export type InsertImageMetadata = Omit<
  ImageMetadata,
  "id" | "created_at" | "updated_at"
>;

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Image metadata methods
  getImageMetadata(id: string): Promise<ImageMetadata | undefined>;
  getImagesByEntity(
    entityType: string,
    entityId: string
  ): Promise<ImageMetadata[]>;
  getImagesByUser(userId: string): Promise<ImageMetadata[]>;
  saveImageMetadata(metadata: InsertImageMetadata): Promise<ImageMetadata>;
  updateImageMetadata(id: string, updates: Partial<ImageMetadata>): Promise<ImageMetadata>;
  deleteImageMetadata(id: string): Promise<void>;
  deleteImagesByEntity(entityType: string, entityId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private imageMetadata: Map<string, ImageMetadata>;

  constructor() {
    this.users = new Map();
    this.imageMetadata = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Image metadata methods
  async getImageMetadata(id: string): Promise<ImageMetadata | undefined> {
    return this.imageMetadata.get(id);
  }

  async getImagesByEntity(
    entityType: string,
    entityId: string
  ): Promise<ImageMetadata[]> {
    return Array.from(this.imageMetadata.values()).filter(
      (img) => img.entity_type === entityType && img.entity_id === entityId
    );
  }

  async getImagesByUser(userId: string): Promise<ImageMetadata[]> {
    return Array.from(this.imageMetadata.values()).filter(
      (img) => img.user_id === userId
    );
  }

  async saveImageMetadata(metadata: InsertImageMetadata): Promise<ImageMetadata> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const image: ImageMetadata = {
      id,
      ...metadata,
      created_at: now,
      updated_at: now,
    };
    this.imageMetadata.set(id, image);
    return image;
  }

  async updateImageMetadata(
    id: string,
    updates: Partial<ImageMetadata>
  ): Promise<ImageMetadata> {
    const image = this.imageMetadata.get(id);
    if (!image) {
      throw new Error(`Image metadata with id ${id} not found`);
    }
    const updated: ImageMetadata = {
      ...image,
      ...updates,
      id: image.id, // Prevent id change
      created_at: image.created_at, // Prevent creation date change
      updated_at: new Date().toISOString(),
    };
    this.imageMetadata.set(id, updated);
    return updated;
  }

  async deleteImageMetadata(id: string): Promise<void> {
    this.imageMetadata.delete(id);
  }

  async deleteImagesByEntity(
    entityType: string,
    entityId: string
  ): Promise<void> {
    const toDelete = Array.from(this.imageMetadata.entries()).filter(
      ([, img]) => img.entity_type === entityType && img.entity_id === entityId
    );
    toDelete.forEach(([id]) => this.imageMetadata.delete(id));
  }
}

export const storage = new MemStorage();
