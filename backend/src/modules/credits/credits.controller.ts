import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { CreditsService } from './credits.service'

const service = new CreditsService()

const addCreditsSchema = z.object({
  amount: z.number().int().positive(),
  type: z.string().default('MANUAL_ADD'),
  description: z.string().optional(),
})

export async function getBalance(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = request.params as any
  return service.getBalance(companyId)
}

export async function getCreditLogs(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = request.params as any
  const { page, limit } = request.query as any
  return service.getLogs(companyId, Number(page) || 1, Number(limit) || 50)
}

export async function addCredits(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = request.params as any
  const { amount, type, description } = addCreditsSchema.parse(request.body)
  const user = request.user as any
  return service.addCredits(companyId, amount, type, description ?? '', user.sub)
}
