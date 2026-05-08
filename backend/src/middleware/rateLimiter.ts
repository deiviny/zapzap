import { FastifyRequest, FastifyReply } from 'fastify'
import { redis } from '../lib/redis'

export async function tokenRateLimiter(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.apiToken) return

  const key = `rate:token:${request.apiToken.id}:${new Date().toISOString().slice(0, 10)}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 86400)
  }

  const limit = request.apiToken.dailyLimit ?? 1000

  if (count > limit) {
    return reply.status(429).send({
      error: 'Daily limit exceeded',
      message: `Token limit of ${limit} messages/day reached`,
    })
  }
}
