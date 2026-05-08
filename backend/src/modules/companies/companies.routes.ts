import { FastifyInstance } from 'fastify'
import { adminAuthMiddleware } from '../../middleware/auth'
import * as ctrl from './companies.controller'

export async function companiesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', adminAuthMiddleware)

  fastify.get('/companies', ctrl.listCompanies)
  fastify.get('/companies/:id', ctrl.getCompany)
  fastify.post('/companies', ctrl.createCompany)
  fastify.put('/companies/:id', ctrl.updateCompany)
  fastify.post('/companies/:id/credits', ctrl.addCredits)
  fastify.delete('/companies/:id', ctrl.deleteCompany)
}
