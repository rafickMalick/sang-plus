// « Ma journée » de l'opérateur de site : liste d'appel et pointage le jour de la collecte.
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db.js'
import { assertSite, audit, HttpError, requireRole } from '../context.js'
import { book, collecteLabel, isPast, occupancy, slotTime } from '../domain/booking.js'
import { fill, sendSms, template } from '../domain/messaging.js'
import { addDays, fmtDay, noonOf } from '../time.js'
import { donorView, fullName, todayOf } from './helpers.js'

const RESULT_LABEL = { RDV: 'Rendez-vous pris', INJOIGNABLE: 'Injoignable', INDISPONIBLE: 'Indisponible', REFUS: 'Refus' } as const

export default async function operateur(app: FastifyInstance) {
  const op = { preHandler: requireRole('OPERATEUR', 'PILOTE', 'SUPER_ADMIN') }

  app.get('/calls', op, async (req) => {
    const ctx = req.ctx
    const siteId = assertSite(ctx, (req.query as { siteId?: string }).siteId)
    const day = todayOf(ctx)
    const tasks = await prisma.callTask.findMany({
      where: { siteId, OR: [{ doneAt: null }, { doneAt: { gte: new Date(day + 'T00:00:00Z') } }] },
      include: { donor: { include: { site: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return {
      tasks: tasks.map((t) => ({ id: t.id, reason: t.reason, result: t.result, resultLabel: t.resultLabel, donor: donorView(ctx, t.donor) })),
      done: tasks.filter((t) => t.doneAt).length,
      rdv: tasks.filter((t) => t.result === 'RDV').length,
    }
  })

  app.post('/calls/:id', op, async (req) => {
    const ctx = req.ctx
    const b = z.object({ result: z.enum(['RDV', 'INJOIGNABLE', 'INDISPONIBLE', 'REFUS']), collecteId: z.string().optional(), slotIndex: z.number().int().optional() }).parse(req.body)
    const task = await prisma.callTask.findUniqueOrThrow({ where: { id: (req.params as { id: string }).id }, include: { donor: true } })
    assertSite(ctx, task.siteId)
    let label: string = RESULT_LABEL[b.result]
    if (b.result === 'RDV') {
      if (!b.collecteId || b.slotIndex == null) throw new HttpError(400, 'Choisissez une collecte et un créneau')
      const c = await prisma.collecte.findUniqueOrThrow({ where: { id: b.collecteId } })
      if ((await occupancy(c.id))[b.slotIndex] >= c.slotCapacity || isPast(c, b.slotIndex, ctx.country.timezone)) throw new HttpError(409, 'Créneau complet ou passé')
      await book(task.donorId, c, b.slotIndex, 'APPEL')
      const heure = slotTime(c, b.slotIndex)
      label = 'RDV · ' + c.name + ' · ' + fmtDay(c.day) + ' ' + heure
      await sendSms(task.donor, 'rdv', fill(template(ctx.country, 'rdv', task.donor.lang), { 'prénom': task.donor.firstName, ...collecteLabel(c), heure }))
    }
    await prisma.callTask.update({ where: { id: task.id }, data: { result: b.result, resultLabel: label, doneAt: new Date() } })
    await audit(ctx, 'appel.resultat', 'CallTask', task.id, { result: b.result })
    return { ok: true, label }
  })

  // ----- pointage
  app.get('/checkin', op, async (req) => {
    const ctx = req.ctx
    const q = req.query as { siteId?: string; collecteId?: string }
    const siteId = assertSite(ctx, q.siteId)
    const day = todayOf(ctx)
    const collectes = await prisma.collecte.findMany({ where: { siteId, day }, orderBy: { startMinutes: 'asc' } })
    const current = collectes.find((c) => c.id === q.collecteId) ?? collectes[0]
    if (!current) return { collectes: [], current: null, rows: [], stats: null }
    const appts = await prisma.appointment.findMany({ where: { collecteId: current.id }, include: { donor: { include: { site: true } } } })
    const rows = appts
      .map((a) => ({ id: a.id, slot: a.slotIndex == null ? 'Sans RDV' : slotTime(current, a.slotIndex), slotIndex: a.slotIndex ?? 999, status: a.status, donor: donorView(ctx, a.donor) }))
      .sort((a, b) => a.slotIndex - b.slotIndex || a.donor.name.localeCompare(b.donor.name))
    const count = (s: string) => appts.filter((a) => a.status === s).length
    return {
      collectes: collectes.map((c) => ({ id: c.id, name: c.name, hours: slotTime(c, 0) + '–' + slotTime(c, c.slotCount) })),
      current: { id: current.id, name: current.name, place: current.place, hours: slotTime(current, 0) + '–' + slotTime(current, current.slotCount) },
      rows,
      stats: { expected: appts.length, arrived: count('ARRIVE') + count('DON') + count('AJOURNE'), donations: count('DON'), deferred: count('AJOURNE') },
    }
  })

  app.get('/checkin/search', op, async (req) => {
    const ctx = req.ctx
    const q = req.query as { siteId?: string; collecteId: string; q: string }
    const siteId = assertSite(ctx, q.siteId)
    const term = (q.q ?? '').trim()
    if (term.length < 2) return []
    const digits = term.replace(/\s/g, '')
    const rows = await prisma.donor.findMany({
      where: {
        siteId, appointments: { none: { collecteId: q.collecteId } },
        OR: [{ firstName: { contains: term, mode: 'insensitive' } }, { lastName: { contains: term, mode: 'insensitive' } }, { phone: { contains: digits } }, { nationalId: { contains: digits } }],
      },
      include: { site: true }, take: 5,
    })
    return rows.map((d) => donorView(ctx, d))
  })

  app.post('/checkin/walkin', op, async (req) => {
    const ctx = req.ctx
    const b = z.object({ collecteId: z.string(), donorId: z.string() }).parse(req.body)
    const c = await prisma.collecte.findUniqueOrThrow({ where: { id: b.collecteId } })
    assertSite(ctx, c.siteId)
    const a = await book(b.donorId, c, null, 'SANS_RDV')
    return prisma.appointment.update({ where: { id: a.id }, data: { status: 'ARRIVE' } })
  })

  app.post('/checkin/:id', op, async (req) => {
    const ctx = req.ctx
    const b = z.object({
      action: z.enum(['arrive', 'don', 'ajourne']),
      bagNumber: z.string().trim().min(4).optional(),
      bloodGroup: z.string().optional(),
      months: z.number().int().min(1).max(24).optional(),
    }).parse(req.body)
    const a = await prisma.appointment.findUniqueOrThrow({ where: { id: (req.params as { id: string }).id }, include: { collecte: true, donor: true } })
    assertSite(ctx, a.collecte.siteId)
    if (b.action === 'arrive') {
      await prisma.appointment.update({ where: { id: a.id }, data: { status: 'ARRIVE' } })
    } else if (b.action === 'don') {
      if (!b.bagNumber) throw new HttpError(400, 'Numéro de poche obligatoire')
      const group = b.bloodGroup && ctx.country.bloodGroups.includes(b.bloodGroup) ? b.bloodGroup : a.donor.bloodGroup
      await prisma.$transaction([
        prisma.donation.create({ data: { donorId: a.donorId, siteId: a.collecte.siteId, date: new Date(), bagNumber: b.bagNumber.toUpperCase(), confirmedGroup: group } }),
        prisma.donor.update({ where: { id: a.donorId }, data: { lastDonationAt: new Date(), donationCount: { increment: 1 }, bloodGroup: group } }),
        prisma.appointment.update({ where: { id: a.id }, data: { status: 'DON' } }),
      ])
      await audit(ctx, 'don.confirmation', 'Donor', a.donorId, { bag: b.bagNumber })
    } else {
      if (!b.months) throw new HttpError(400, 'Durée d’ajournement obligatoire')
      const until = noonOf(addDays(todayOf(ctx), Math.round(b.months * 30.4)))
      await prisma.$transaction([
        prisma.donor.update({ where: { id: a.donorId }, data: { deferredUntil: until } }),
        prisma.appointment.update({ where: { id: a.id }, data: { status: 'AJOURNE' } }),
      ])
      await audit(ctx, 'don.ajournement', 'Donor', a.donorId, { months: b.months })
    }
    const fresh = await prisma.donor.findUniqueOrThrow({ where: { id: a.donorId }, include: { site: true } })
    return { donor: donorView(ctx, fresh), name: fullName(fresh) }
  })
}
