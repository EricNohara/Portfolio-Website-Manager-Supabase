export default interface IApiKey {
  user_id: string;
  description: string;
  expires: string | null;
  hashed_key: string;
  encrypted_key: string;
}
