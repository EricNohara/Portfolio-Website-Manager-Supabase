export interface IApiKeyInternal {
  description: string;
  expires: string | null;
  created: string;
  last_used: string;
}

export interface IApiKey extends IApiKeyInternal {
  user_id: string;
}

export interface IApiKeyInput {
  description: string;
  expires: string | null;
  user_id: string;
  encrypted_key: string;
  hashed_key: string;
}
