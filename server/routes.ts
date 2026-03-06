import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";

interface SignatureRequest {
  type: "property" | "marketplace-item" | "profile" | "community";
  userId: string;
  entityId: string;
  filename: string;
}

function buildFolderPath(
  type: string,
  userId: string,
  entityId?: string
): string {
  return entityId
    ? `homelink/v2/${type}/${userId}/${entityId}`
    : `homelink/v2/${type}/${userId}`;
}

function buildPublicId(folderPath: string, filename: string): string {
  const sanitized = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/\.+/g, ".");
  return `${folderPath}/${sanitized}`;
}

function generateCloudinarySignature(config: {
  public_id: string;
  folder: string;
  api_key: string;
  timestamp: number;
  api_secret: string;
}): string {
  const paramsStr = Object.entries({
    public_id: config.public_id,
    folder: config.folder,
    api_key: config.api_key,
    timestamp: config.timestamp,
  })
    .sort()
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return crypto
    .createHmac("sha1", config.api_secret)
    .update(paramsStr)
    .digest("hex");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Image signing endpoint
  app.post("/api/images/sign", async (req: Request, res: Response) => {
    try {
      const { type, userId, entityId, filename }: SignatureRequest = req.body;

      // Validation
      if (!type || !userId || !entityId || !filename) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (filename.includes("..") || filename.includes("/")) {
        return res.status(400).json({ error: "Invalid filename" });
      }

      // Generate signature
      const folderPath = buildFolderPath(type, userId, entityId);
      const publicId = buildPublicId(folderPath, filename);
      const timestamp = Math.floor(Date.now() / 1000);

      const signature = generateCloudinarySignature({
        public_id: publicId,
        folder: folderPath,
        api_key: process.env.VITE_CLOUDINARY_API_KEY!,
        timestamp,
        api_secret: process.env.CLOUDINARY_API_SECRET!,
      });

      console.log(
        `[Image Sign] User: ${userId}, Entity: ${entityId}, File: ${filename}`
      );

      res.json({
        signature,
        public_id: publicId,
        timestamp,
        api_key: process.env.VITE_CLOUDINARY_API_KEY,
      });
    } catch (error) {
      console.error("[Image Sign Error]", error);
      res.status(500).json({ error: "Failed to generate signature" });
    }
  });

  // Image deletion endpoint
  app.delete("/api/images/:imageId", async (req: Request, res: Response) => {
    try {
      const { imageId } = req.params;
      const { userId } = req.body;

      // Validation
      if (!imageId || !userId) {
        return res.status(400).json({ error: "Missing imageId or userId" });
      }

      const imageIdString = Array.isArray(imageId) ? imageId[0] : imageId;

      // Get image metadata from database
      const image = await storage.getImageMetadata(imageIdString);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Verify ownership
      if (image.user_id !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Delete from Cloudinary
      const v2 = await import("cloudinary").then((m) =>
        m.default?.v2 || m.v2
      );
      v2.config({
        cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.VITE_CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      await v2.uploader.destroy(image.public_id);

      // Delete from database
      await storage.deleteImageMetadata(imageIdString);

      console.log(
        `[Image Delete] User: ${userId}, ImageId: ${imageIdString}, PublicId: ${image.public_id}`
      );

      res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
      console.error("[Image Delete Error]", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  return httpServer;
}
