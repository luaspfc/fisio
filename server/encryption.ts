/**
 * Encryption Helper - LGPD Compliance
 * Encrypts and decrypts sensitive medical data using AES-256-GCM
 */

import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production";
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypt sensitive data
 * Returns base64 encoded string with IV and auth tag
 */
export function encryptData(plaintext: string): string {
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    const combined = iv.toString("hex") + authTag.toString("hex") + encrypted;
    return Buffer.from(combined, "hex").toString("base64");
  } catch (error) {
    console.error("[Encryption] Error encrypting data:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Decrypt sensitive data
 * Expects base64 encoded string with IV and auth tag
 */
export function decryptData(encryptedBase64: string): string {
  try {
    const combined = Buffer.from(encryptedBase64, "base64").toString("hex");

    // Extract IV (32 chars = 16 bytes), authTag (32 chars = 16 bytes), and encrypted data
    const iv = Buffer.from(combined.slice(0, 32), "hex");
    const authTag = Buffer.from(combined.slice(32, 64), "hex");
    const encrypted = combined.slice(64);

    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[Encryption] Error decrypting data:", error);
    throw new Error("Decryption failed");
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 * Used for CPF, CREFITO, etc.
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data + ENCRYPTION_KEY).digest("hex");
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hash: string): boolean {
  return hashData(data) === hash;
}
