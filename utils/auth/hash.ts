import bcrypt from "bcrypt";

const saltRounds = 10;

export async function generateAPIKey(
  user_id: string,
  email: string
): Promise<string> {
  const key = `${user_id}-${Date.now()}-${email}`;
  const hash = await bcrypt.hash(key, saltRounds);
  return hash;
}

export async function hashKey(key: string): Promise<string | null> {
  try {
    const hash = await bcrypt.hash(key, saltRounds);
    return hash;
  } catch {
    return null;
  }
}

export async function validateKey(
  key: string,
  hashedKey: string
): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(key, hashedKey);
    return isValid;
  } catch {
    return false;
  }
}
