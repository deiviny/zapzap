import { FastifyInstance } from 'fastify'
import { loginController } from './auth.controller'

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', loginController)
}
