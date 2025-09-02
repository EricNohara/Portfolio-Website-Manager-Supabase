export interface IApiKeyInternal {
  description: string;
  expires: string | null;
  created: string;
  last_used: string;
}

export interface IApiKey extends IApiKeyInternal {
  user_id: string;
}

export interface IApiKeyInput extends IApiKey {
  encrypted_key: string;
}
