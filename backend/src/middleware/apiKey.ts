import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../utils/crypto'
import { logger } from '../utils/logger'

declare module 'fastify' {
  interface FastifyRequest {
    apiToken?: {
      id: string
      companyId: string
      sessionId: string
      dailyLimit: number | null
      webhookUrl: string | null
    }
  }
}

export async function apiKeyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing API token' })
  }

  const rawToken = authHeader.slice(7)
  const prefix = rawToken.substring(0, 10)

  const candidates = await prisma.apiToken.findMany({
    where: { tokenPrefix: prefix, isActive: true },
    include: { company: { select: { status: true, creditBalance: true, dailyLimit: true } } },
  })

  let validToken = null
  for (const candidate of candidates) {
    const valid = await verifyToken(rawToken, candidate.tokenHash)
    if (valid) {
      validToken = candidate
      break
    }
  }

  if (!validToken) {
    return reply.status(401).send({ error: 'Invalid API token' })
  }

  if (validToken.company.status !== 'ACTIVE') {
    return reply.status(403).send({ error: 'Company is not active' })
  }

  request.apiToken = {
    id: validToken.id,
    companyId: validToken.companyId,
    sessionId: validToken.sessionId,
    dailyLimit: validToken.dailyLimit,
    webhookUrl: validToken.webhookUrl,
  }

  // Log usage async (fire and forget)
  prisma.apiToken
    .update({ where: { id: validToken.id }, data: { lastUsedAt: new Date() } })
    .catch((err) => logger.error({ err }, 'Failed to update token lastUsedAt'))
}
