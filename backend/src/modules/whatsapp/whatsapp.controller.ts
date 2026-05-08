import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { WhatsAppService } from './whatsapp.service'

const service = new WhatsAppService()

export async function listSessions(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = request.params as any
  return service.listSessions(companyId)
}

export async function createSession(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = request.params as any
  const { name } = z.object({ name: z.string().min(2) }).parse(request.body)
  const session = await service.createSession(companyId, name)
  return reply.status(201).send(session)
}

export async function startSession(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as any
  return service.startSession(sessionId)
}

export async function disconnectSession(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as any
  return service.disconnectSession(sessionId)
}

export async function getQrCode(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as any
  return service.getQrCode(sessionId)
}

export async function deleteSession(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as any
  await service.deleteSession(sessionId)
  return reply.status(204).send()
}
