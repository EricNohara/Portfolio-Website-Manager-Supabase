import { IApiKeyInternal } from "./IApiKey";
import { IPublicApiLogInternal } from "./IPublicApiLog";
import { IUserInfo } from "./IUserInfo";

export interface IUserInfoInternal extends IUserInfo {
  api_keys: IApiKeyInternal[];
  public_api_logs: IPublicApiLogInternal[];
}
