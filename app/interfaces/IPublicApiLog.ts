export default interface IPublicApiLog {
  user_id: string;
  requested_at: string;
  responded_at: string;
  status_code: number;
  key_description: string;
  user_agent: string;
}
