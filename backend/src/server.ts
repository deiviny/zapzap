import 'dotenv/config'
import { buildApp } from './app'
import { startMessageWorker } from './queues/message.processor'
import { prisma } from './lib/prisma'
import { redis } from './lib/redis'
import { config } from './config'
import { logger } from './utils/logger'

async function main() {
  await prisma.$connect()
  logger.info('Database connected')

  const worker = startMessageWorker()

  const app = await buildApp()

  await app.listen({ port: config.API_PORT, host: '0.0.0.0' })
  logger.info(`Server running on port ${config.API_PORT}`)

  const shutdown = async () => {
    logger.info('Shutting down...')
    await app.close()
    await worker.close()
    await prisma.$disconnect()
    await redis.quit()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
