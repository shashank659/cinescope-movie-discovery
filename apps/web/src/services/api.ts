import type { HealthCheckResponse } from '@cinescope/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
