export interface GrinderConfig {
  apiEndpoint: string;
  apiToken?: string;
  userId?: string;
  trackingEnabled: boolean;
}

export interface ActivityPayload {
  userId?: string;
  action: string;
  timestamp?: string;
  [key: string]: any;
}
