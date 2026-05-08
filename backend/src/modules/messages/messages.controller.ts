import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { MessagesService } from './messages.service'

const service = new MessagesService()

const sendTextSchema = z.object({
  phone: z.string().min(10),
  message: z.string().min(1).max(4096),
})

export async function sendText(request: FastifyRequest, reply: FastifyReply) {
  const { phone, message } = sendTextSchema.parse(request.body)
  const token = request.apiToken!

  try {
    const msg = await service.sendText(token.id, token.companyId, token.sessionId, phone, message)
    return reply.status(202).send({ id: msg.id, status: msg.status })
  } catch (error: any) {
    if (error.code === 'NO_CREDIT') {
      return reply.status(402).send({ error: 'Insufficient credits', messageId: error.messageId })
    }
    throw error
  }
}

export async function getMessageStatus(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const token = request.apiToken!
  const msg = await service.getStatus(id, token.companyId)
  if (!msg) return reply.status(404).send({ error: 'Message not found' })
  return msg
}

export async function getInbox(request: FastifyRequest, reply: FastifyReply) {
  const token = request.apiToken!
  const query = request.query as any
  return service.getInbox(token.companyId, query)
}
