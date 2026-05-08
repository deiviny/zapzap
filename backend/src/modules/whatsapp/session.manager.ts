import venom from 'venom-bot'
import { prisma } from '../../lib/prisma'
import { logger } from '../../utils/logger'

type VenomClient = Awaited<ReturnType<typeof venom.create>>

class SessionManagerClass {
  private sessions = new Map<string, VenomClient>()

  getSession(sessionId: string): VenomClient | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): Map<string, VenomClient> {
    return this.sessions
  }

  async createSession(sessionId: string, onQrCode?: (qr: string) => void): Promise<void> {
    logger.info({ sessionId }, 'Creating WhatsApp session')

    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { status: 'WAITING_QR' },
    })

    const client = await venom.create(
      sessionId,
      async (base64Qr: string) => {
        logger.info({ sessionId }, 'QR Code generated')
        await prisma.whatsAppSession.update({
          where: { id: sessionId },
          data: { qrCode: base64Qr, status: 'WAITING_QR' },
        })
        onQrCode?.(base64Qr)
      },
      async (statusSession: string) => {
        logger.info({ sessionId, statusSession }, 'Session status changed')

        if (statusSession === 'isLogged' || statusSession === 'qrReadSuccess') {
          await prisma.whatsAppSession.update({
            where: { id: sessionId },
            data: { status: 'CONNECTED', qrCode: null },
          })
        } else if (statusSession === 'desconnectedMobile' || statusSession === 'deleteToken') {
          await this.handleDisconnect(sessionId)
        }
      },
      {
        multidevice: true,
        disableSpins: true,
        disableWelcome: true,
        logQR: false,
      }
    )

    client.onMessage(async (message) => {
      if (!message.isGroupMsg && !message.fromMe) {
        await this.handleIncomingMessage(sessionId, message)
      }
    })

    this.sessions.set(sessionId, client)

    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { status: 'CONNECTED', qrCode: null },
    })

    logger.info({ sessionId }, 'WhatsApp session created and connected')
  }

  async destroySession(sessionId: string): Promise<void> {
    const client = this.sessions.get(sessionId)
    if (client) {
      await client.close()
      this.sessions.delete(sessionId)
    }
    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { status: 'DISCONNECTED', qrCode: null },
    })
  }

  private async handleDisconnect(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { status: 'DISCONNECTED', qrCode: null },
    })
    logger.warn({ sessionId }, 'Session disconnected')
  }

  private async handleIncomingMessage(sessionId: string, message: any): Promise<void> {
    try {
      const session = await prisma.whatsAppSession.findUnique({
        where: { id: sessionId },
        select: { companyId: true, tokens: { select: { id: true, webhookUrl: true } } },
      })

      if (!session) return

      const phone = message.from.replace('@c.us', '').replace('@s.whatsapp.net', '')

      await prisma.message.create({
        data: {
          companyId: session.companyId,
          sessionId,
          direction: 'INBOUND',
          phone,
          content: message.body || '',
          status: 'DELIVERED',
        },
      })

      // Notify webhooks
      for (const token of session.tokens) {
        if (token.webhookUrl) {
          this.sendWebhook(token.webhookUrl, { phone, message: message.body, sessionId })
        }
      }
    } catch (err) {
      logger.error({ err, sessionId }, 'Error handling incoming message')
    }
  }

  private sendWebhook(url: string, payload: object): void {
    import('axios').then(({ default: axios }) => {
      axios.post(url, payload, { timeout: 5000 }).catch((err) => {
        logger.warn({ url, err: err.message }, 'Webhook delivery failed')
      })
    })
  }
}

export const SessionManager = new SessionManagerClass()
