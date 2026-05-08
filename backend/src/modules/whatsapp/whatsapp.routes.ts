import { FastifyInstance } from 'fastify'
import { adminAuthMiddleware } from '../../middleware/auth'
import * as ctrl from './whatsapp.controller'

export async function whatsappRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', adminAuthMiddleware)

  fastify.get('/companies/:companyId/sessions', ctrl.listSessions)
  fastify.post('/companies/:companyId/sessions', ctrl.createSession)
  fastify.post('/sessions/:sessionId/start', ctrl.startSession)
  fastify.post('/sessions/:sessionId/disconnect', ctrl.disconnectSession)
  fastify.get('/sessions/:sessionId/qrcode', ctrl.getQrCode)
  fastify.delete('/sessions/:sessionId', ctrl.deleteSession)
}
