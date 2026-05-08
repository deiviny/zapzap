import { Queue, QueueEvents } from 'bullmq'
import { redis } from '../lib/redis'
import { logger } from '../utils/logger'

export interface MessageJob {
  messageId: string
  sessionId: string
  phone: string
  content: string
  mediaUrl?: string
  mediaType?: string
}

export const messageQueue = new Queue<MessageJob>('messages', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
})

export const messageQueueEvents = new QueueEvents('messages', { connection: redis })

messageQueueEvents.on('completed', ({ jobId }) => {
  logger.debug({ jobId }, 'Message job completed')
})

messageQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Message job failed')
})
