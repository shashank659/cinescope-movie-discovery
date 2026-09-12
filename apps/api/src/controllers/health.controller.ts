import type { Request, Response } from 'express';
import type { HealthCheckResponse } from '@cinescope/shared';
import { env } from '../config/env.js';

export const getHealth = (_req: Request, res: Response): void => {
  const response: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
  };

  res.status(200).json(response);
};
