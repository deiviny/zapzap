import { prisma } from '../../lib/prisma'
import dayjs from 'dayjs'

export class DashboardService {
  async getStats() {
    const today = dayjs().startOf('day').toDate()
    const weekAgo = dayjs().subtract(7, 'days').toDate()

    const [
      totalCompanies,
      activeCompanies,
      sentToday,
      errorToday,
      blockedToday,
      receivedToday,
      connectedSessions,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: 'ACTIVE' } }),
      prisma.message.count({
        where: { direction: 'OUTBOUND', status: 'SENT', createdAt: { gte: today } },
      }),
      prisma.message.count({
        where: { direction: 'OUTBOUND', status: 'ERROR', createdAt: { gte: today } },
      }),
      prisma.message.count({
        where: { status: 'BLOCKED_NO_CREDIT', createdAt: { gte: today } },
      }),
      prisma.message.count({
        where: { direction: 'INBOUND', createdAt: { gte: today } },
      }),
      prisma.whatsAppSession.count({ where: { status: 'CONNECTED' } }),
    ])

    const messagesByDay = await prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT
        DATE(created_at) as date,
        COUNT(*)::int as count
      FROM messages
      WHERE direction = 'OUTBOUND'
        AND created_at >= ${weekAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    return {
      totalCompanies,
      activeCompanies,
      sentToday,
      errorToday,
      blockedToday,
      receivedToday,
      connectedSessions,
      messagesByDay,
    }
  }
}
