import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  API_PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ASAAS_API_KEY: z.string().optional(),
  ASAAS_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data

export const ASAAS_BASE_URL =
  config.ASAAS_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3'
