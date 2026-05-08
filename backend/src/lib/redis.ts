import Redis from 'ioredis'
import { config } from '../config'
import { logger } from '../utils/logger'

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

redis.on('connect', () => logger.info('Redis connected'))
redis.on('error', (err) => logger.error({ err }, 'Redis error'))
