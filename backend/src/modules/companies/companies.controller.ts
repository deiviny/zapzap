import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { CompaniesService } from './companies.service'

const service = new CompaniesService()

const createSchema = z.object({
  name: z.string().min(2),
  document: z.string().min(11),
  email: z.string().email(),
  phone: z.string().optional(),
  dailyLimit: z.number().int().min(1).optional(),
})

export async function listCompanies(request: FastifyRequest, reply: FastifyReply) {
  const { page, limit } = request.query as any
  return service.list(Number(page) || 1, Number(limit) || 20)
}

export async function getCompany(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  return service.findById(id)
}

export async function createCompany(request: FastifyRequest, reply: FastifyReply) {
  const data = createSchema.parse(request.body)
  const company = await service.create(data)
  return reply.status(201).send(company)
}

export async function updateCompany(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const company = await service.update(id, request.body as any)
  return company
}

export async function addCredits(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const { amount, description } = request.body as any
  const user = request.user as any
  return service.addCredits(id, amount, description, user.sub)
}

export async function deleteCompany(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  await service.delete(id)
  return reply.status(204).send()
}
