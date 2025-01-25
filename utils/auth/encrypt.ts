import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

const API_ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY
  ? Buffer.from(process.env.API_ENCRYPTION_KEY, "hex")
  : null;

if (!API_ENCRYPTION_KEY)
  throw new Error("Failed to load API_ENCRYPTION_KEY from .env");

const IV_LENGTH = 16; // AES block size
const iv = crypto.randomBytes(IV_LENGTH);

// Encrypt Function
export function encrypt(text: string): string | null {
  if (!API_ENCRYPTION_KEY) return null;

  const cipher = crypto.createCipheriv(ALGORITHM, API_ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt Function
export function decrypt(encryptedText: string): string | null {
  if (!API_ENCRYPTION_KEY) return null;

  try {
    const [iv, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      API_ENCRYPTION_KEY,
      Buffer.from(iv, "hex")
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}
