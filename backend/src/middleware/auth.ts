import { FastifyRequest, FastifyReply } from 'fastify'

export async function adminAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' })
  }
}
