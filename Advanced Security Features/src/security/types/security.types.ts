export interface EncryptedData {
  iv: string;
  tag: string;
  encrypted: string;
}

export interface SignedRequest {
  method: string;
  url: string;
  body: any;
  timestamp: number;
  signature: string;
}

export interface SecurityConfig {
  encryptionKey: string;
  signingSecret: string;
  auditLogPath: string;
  monitoringEnabled: boolean;
}
