import path from "path";

/**
 * Where admin-uploaded product photos live. In Docker this sits on the same
 * persistent volume as the database (/app/data), so photos survive redeploys.
 */
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  (process.env.NODE_ENV === "production" ? "/app/data/uploads" : path.join(process.cwd(), "data", "uploads"));

export const UPLOAD_URL_PREFIX = "/api/uploads/";

/** Only names we generate: 24 hex chars + .webp */
export const SAFE_NAME = /^[a-f0-9]{24}\.webp$/;
