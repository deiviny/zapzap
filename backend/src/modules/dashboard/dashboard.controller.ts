import { FastifyRequest, FastifyReply } from 'fastify'
import { DashboardService } from './dashboard.service'

const service = new DashboardService()

export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
  return service.getStats()
}
