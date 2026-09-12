import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  TMDB_API_READ_ACCESS_TOKEN: z.string().optional().default(''),
  TMDB_API_KEY: z.string().optional().default(''),
  JWT_SECRET: z.string().min(16).default('development_fallback_secret_must_be_overridden_in_env_32_chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
