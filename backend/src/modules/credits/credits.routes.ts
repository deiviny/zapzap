import { FastifyInstance } from 'fastify'
import { adminAuthMiddleware } from '../../middleware/auth'
import * as ctrl from './credits.controller'

export async function creditsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', adminAuthMiddleware)

  fastify.get('/companies/:companyId/credits', ctrl.getBalance)
  fastify.get('/companies/:companyId/credits/logs', ctrl.getCreditLogs)
  fastify.post('/companies/:companyId/credits', ctrl.addCredits)
}
