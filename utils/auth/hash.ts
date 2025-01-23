import bcrypt from "bcrypt";

const saltRounds = 10;

export async function generateAPIKey(user_id: string, email: string) {
  const key = `${user_id}-${Date.now()}-${email}`;
  const hash = await bcrypt.hash(key, saltRounds);
  return hash;
}

export async function hashKey(key: string) {
  const hash = await bcrypt.hash(key, saltRounds);
  return hash;
}
