import crypto from "crypto";

const API_ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY
  ? Buffer.from(process.env.API_ENCRYPTION_KEY!, "utf8")
  : crypto.randomBytes(32).toString("hex");
const IV_LENGTH = 16;

// Encrypt Function
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", API_ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt Function
export function decrypt(encryptedText: string): string {
  const [iv, encrypted] = encryptedText.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    API_ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
