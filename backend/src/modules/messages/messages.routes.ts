import { FastifyInstance } from 'fastify'
import { apiKeyMiddleware } from '../../middleware/apiKey'
import { tokenRateLimiter } from '../../middleware/rateLimiter'
import * as ctrl from './messages.controller'

export async function messagesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', apiKeyMiddleware)
  fastify.addHook('preHandler', tokenRateLimiter)

  fastify.post('/messages/send-text', ctrl.sendText)
  fastify.get('/messages/:id/status', ctrl.getMessageStatus)
  fastify.get('/messages/inbox', ctrl.getInbox)
}
