import { FastifyInstance } from 'fastify'
import { adminAuthMiddleware } from '../../middleware/auth'
import { getDashboard } from './dashboard.controller'

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', adminAuthMiddleware)
  fastify.get('/dashboard', getDashboard)
}
