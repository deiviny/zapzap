import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PaymentsService } from './payments.service'

const service = new PaymentsService()

const createChargeSchema = z.object({
  companyId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(1),
  billingType: z.enum(['BOLETO', 'CREDIT_CARD', 'PIX']),
  creditsToGrant: z.number().int().positive().optional(),
})

export async function createCharge(request: FastifyRequest, reply: FastifyReply) {
  const { companyId, amount, description, billingType, creditsToGrant } = createChargeSchema.parse(
    request.body
  )
  const result = await service.createCharge(companyId, amount, description, billingType, creditsToGrant)
  return reply.status(201).send(result)
}

export async function asaasWebhook(request: FastifyRequest, reply: FastifyReply) {
  await service.handleWebhook(request.body)
  return { received: true }
}

export async function listPayments(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = request.query as any
  return service.listPayments(companyId)
}
