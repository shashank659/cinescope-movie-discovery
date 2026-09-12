export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
  environment: string;
}
