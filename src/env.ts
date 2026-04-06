import { z } from "zod/v4";
import 'dotenv/config'

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  AUTH_REDIRECT_URL: z.url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

export const env = envSchema.parse(process.env)