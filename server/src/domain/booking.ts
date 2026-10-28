import type { AppointmentSource, Collecte } from '@prisma/client'
import { prisma } from '../db.js'
import { fmtDayLong, fmtMinutes, minutesIn, today } from '../time.js'

export const slotTime = (c: Collecte, i: number) => fmtMinutes(c.startMinutes + i * c.slotMinutes)

export async function occupancy(collecteId: string): Promise<number[]> {
  const c = await prisma.collecte.findUniqueOrThrow({ where: { id: collecteId } })
  const rows = await prisma.appointment.groupBy({
    by: ['slotIndex'],
    where: { collecteId, slotIndex: { not: null }, status: { not: 'ABSENT' } },
    _count: true,
  })
  const counts = new Array(c.slotCount).fill(0)
  for (const r of rows) if (r.slotIndex != null && r.slotIndex < c.slotCount) counts[r.slotIndex] = r._count
  return counts
}

// Un créneau déjà commencé (collecte du jour) ne peut plus être réservé.
export function isPast(c: Collecte, i: number, tz: string) {
  const day = today(tz)
  return c.day < day || (c.day === day && c.startMinutes + i * c.slotMinutes <= minutesIn(tz))
}

export async function firstFreeSlot(c: Collecte, tz: string) {
  const counts = await occupancy(c.id)
  return counts.findIndex((n, i) => n < c.slotCapacity && !isPast(c, i, tz))
}

// Prochaine collecte du site ayant encore une place réservable.
export async function nextOpenCollecte(siteId: string, tz: string) {
  const list = await prisma.collecte.findMany({ where: { siteId, day: { gte: today(tz) } }, orderBy: [{ day: 'asc' }, { startMinutes: 'asc' }] })
  for (const c of list) {
    const slot = await firstFreeSlot(c, tz)
    if (slot >= 0) return { collecte: c, slot }
  }
  return null
}

export async function book(donorId: string, c: Collecte, slotIndex: number | null, source: AppointmentSource) {
  return prisma.appointment.upsert({
    where: { collecteId_donorId: { collecteId: c.id, donorId } },
    create: { collecteId: c.id, donorId, slotIndex, source },
    update: { slotIndex, source, status: 'PREVU' },
  })
}

export const collecteLabel = (c: Collecte) => ({ collecte: c.name, date: fmtDayLong(c.day) })
