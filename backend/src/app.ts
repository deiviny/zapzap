import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { config } from './config'
import { logger } from './utils/logger'
import { authRoutes } from './modules/auth/auth.routes'
import { companiesRoutes } from './modules/companies/companies.routes'
import { whatsappRoutes } from './modules/whatsapp/whatsapp.routes'
import { messagesRoutes } from './modules/messages/messages.routes'
import { tokensRoutes } from './modules/tokens/tokens.routes'
import { creditsRoutes } from './modules/credits/credits.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { paymentsRoutes } from './modules/payments/payments.routes'

export async function buildApp() {
  const app = Fastify({ logger: false })

  await app.register(helmet)
  await app.register(cors, { origin: true })
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' })
  await app.register(jwt, { secret: config.JWT_SECRET })

  app.setErrorHandler((error, request, reply) => {
    logger.error({ err: error, url: request.url }, 'Request error')

    if (error.validation) {
      return reply.status(400).send({ error: 'Validation error', details: error.validation })
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({ error: error.message })
    }

    reply.status(500).send({ error: 'Internal server error' })
  })

  await app.register(authRoutes, { prefix: '/api' })
  await app.register(companiesRoutes, { prefix: '/api' })
  await app.register(whatsappRoutes, { prefix: '/api' })
  await app.register(messagesRoutes, { prefix: '/api' })
  await app.register(tokensRoutes, { prefix: '/api' })
  await app.register(creditsRoutes, { prefix: '/api' })
  await app.register(dashboardRoutes, { prefix: '/api' })
  await app.register(paymentsRoutes, { prefix: '/api' })

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}
