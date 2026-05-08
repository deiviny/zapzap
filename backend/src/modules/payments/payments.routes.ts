import { FastifyInstance } from 'fastify'
import { adminAuthMiddleware } from '../../middleware/auth'
import * as ctrl from './payments.controller'

export async function paymentsRoutes(fastify: FastifyInstance) {
  // Public webhook endpoint for Asaas
  fastify.post('/webhooks/asaas', ctrl.asaasWebhook)

  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', adminAuthMiddleware)
    protectedRoutes.post('/payments', ctrl.createCharge)
    protectedRoutes.get('/payments', ctrl.listPayments)
  })
}
