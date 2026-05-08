import { Worker, Job } from 'bullmq'
import { redis } from '../lib/redis'
import { prisma } from '../lib/prisma'
import { SessionManager } from '../modules/whatsapp/session.manager'
import { formatWhatsAppId } from '../utils/phone'
import { logger } from '../utils/logger'
import type { MessageJob } from './message.queue'

function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function startMessageWorker() {
  const worker = new Worker<MessageJob>(
    'messages',
    async (job: Job<MessageJob>) => {
      const { messageId, sessionId, phone, content } = job.data

      await randomDelay(1000, 4000) // Anti-spam delay

      const session = SessionManager.getSession(sessionId)
      if (!session) {
        throw new Error(`Session ${sessionId} not available`)
      }

      try {
        const whatsappId = formatWhatsAppId(phone)
        await session.sendText(whatsappId, content)

        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'SENT', sentAt: new Date() },
        })

        logger.info({ messageId, phone }, 'Message sent successfully')
      } catch (error: any) {
        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'ERROR', errorMsg: error.message },
        })
        throw error
      }
    },
    {
      connection: redis,
      concurrency: 3,
      limiter: { max: 5, duration: 1000 }, // Max 5 msgs/sec globally
    }
  )

  worker.on('error', (err) => logger.error({ err }, 'Worker error'))
  logger.info('Message worker started')
  return worker
}
