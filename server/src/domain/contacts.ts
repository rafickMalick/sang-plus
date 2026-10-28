import { prisma } from '../db.js'

// Sollicitations du mois (SMS de rappel ou d'alerte + appels passés), pour appliquer le plafond.
export async function monthlyContacts(donorIds: string[], today: string): Promise<Map<string, number>> {
  const since = new Date(today.slice(0, 8) + '01T00:00:00Z')
  const [msgs, calls] = await Promise.all([
    prisma.message.groupBy({ by: ['donorId'], where: { donorId: { in: donorIds }, direction: 'OUT', kind: { in: ['rappel', 'alerte'] }, createdAt: { gte: since } }, _count: true }),
    prisma.callTask.groupBy({ by: ['donorId'], where: { donorId: { in: donorIds }, doneAt: { gte: since } }, _count: true }),
  ])
  const out = new Map<string, number>()
  for (const r of [...msgs, ...calls]) out.set(r.donorId, (out.get(r.donorId) ?? 0) + r._count)
  return out
}
