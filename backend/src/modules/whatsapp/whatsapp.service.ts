import { prisma } from '../../lib/prisma'
import { SessionManager } from './session.manager'

export class WhatsAppService {
  async listSessions(companyId: string) {
    return prisma.whatsAppSession.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createSession(companyId: string, name: string) {
    const session = await prisma.whatsAppSession.create({
      data: { companyId, name, status: 'DISCONNECTED' },
    })
    return session
  }

  async startSession(sessionId: string) {
    const session = await prisma.whatsAppSession.findUniqueOrThrow({ where: { id: sessionId } })
    // Start in background, don't await so QR polling works
    SessionManager.createSession(sessionId).catch(() => {})
    return session
  }

  async disconnectSession(sessionId: string) {
    await SessionManager.destroySession(sessionId)
    return prisma.whatsAppSession.findUnique({ where: { id: sessionId } })
  }

  async getQrCode(sessionId: string) {
    const session = await prisma.whatsAppSession.findUniqueOrThrow({ where: { id: sessionId } })
    return { qrCode: session.qrCode, status: session.status }
  }

  async deleteSession(sessionId: string) {
    await SessionManager.destroySession(sessionId)
    return prisma.whatsAppSession.delete({ where: { id: sessionId } })
  }
}
