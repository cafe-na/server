import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  AUTH_REDIRECT_URL: z.url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string(),
  ABACATEPAY_API_KEY: z.string(),
})

export const env = envSchema.parse(process.env)