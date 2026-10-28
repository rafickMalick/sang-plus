// Tableau de bord, stock, vue nationale, campagnes et collectes (profil Pilote).
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db.js'
import { assertSite, audit, HttpError, requireRole } from '../context.js'
import { book, collecteLabel, isPast, nextOpenCollecte, occupancy, slotTime } from '../domain/booking.js'
import { alertTargets, escalate, launchAlert, runReminders } from '../domain/campaigns.js'
import { eligibility } from '../domain/eligibility.js'
import { fill, template } from '../domain/messaging.js'
import { addDays, fmtDay } from '../time.js'
import { campaignView, fullName, todayOf } from './helpers.js'

const LEVEL = z.enum(['NORMAL', 'BAS', 'CRITIQUE'])

async function latestLevels(siteId: string, beforeOrOn: string) {
  const last = await prisma.stockReading.findFirst({ where: { siteId, day: { lte: beforeOrOn } }, orderBy: { day: 'desc' } })
  if (!last) return { day: null as string | null, levels: {} as Record<string, string> }
  const rows = await prisma.stockReading.findMany({ where: { siteId, day: last.day } })
  return { day: last.day, levels: Object.fromEntries(rows.map((r) => [r.group, r.level])) as Record<string, string> }
}

async function collecteSummary(c: { id: string; slotCount: number; slotCapacity: number }) {
  const counts = await occupancy(c.id)
  return { booked: counts.reduce((a, b) => a + b, 0), capacity: c.slotCount * c.slotCapacity }
}

export default async function pilote(app: FastifyInstance) {
  const pilot = { preHandler: requireRole('PILOTE', 'SUPER_ADMIN') }

  app.get('/dashboard', pilot, async (req) => {
    const ctx = req.ctx
    const siteId = assertSite(ctx, (req.query as { siteId?: string }).siteId)
    const day = todayOf(ctx)
    const monthStart = new Date(day.slice(0, 8) + '01T00:00:00Z')
    const since30 = new Date(Date.now() - 30 * 86400000)

    const [donors, regulars, recentAlerts, , donsMonth, todayStock, yesterday, needs, collectes, campaigns, rappelsToday, openCalls, donsToday] = await Promise.all([
      prisma.donor.count({ where: { siteId } }),
      prisma.donor.count({ where: { siteId, donationCount: { gte: 2 } } }),
      prisma.campaign.findMany({ where: { siteId, type: 'ALERTE', createdAt: { gte: since30 } } }),
      null,
      prisma.donation.count({ where: { siteId, date: { gte: monthStart } } }),
      prisma.stockReading.findMany({ where: { siteId, day } }),
      latestLevels(siteId, addDays(day, -1)),
      prisma.need.findMany({ where: { siteId }, include: { hospital: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.collecte.findMany({ where: { siteId, day: { gte: day } }, orderBy: [{ day: 'asc' }, { startMinutes: 'asc' }], take: 3 }),
      prisma.campaign.findMany({ where: { siteId }, orderBy: { createdAt: 'desc' }, take: 4 }),
      prisma.message.count({ where: { kind: 'rappel', direction: 'OUT', createdAt: { gte: new Date(day + 'T00:00:00Z') }, donor: { siteId } } }),
      prisma.callTask.count({ where: { siteId, doneAt: null } }),
      prisma.donation.count({ where: { siteId, date: { gte: new Date(day + 'T00:00:00Z') } } }),
    ])
    const alertStats = await Promise.all(recentAlerts.map((c) => campaignView(ctx, c)))
    const alertsOut = alertStats.reduce((a, c) => a + c.sent, 0)
    const alertsYes = alertStats.reduce((a, c) => a + c.yes, 0)
    const levels = todayStock.length ? Object.fromEntries(todayStock.map((r) => [r.group, r.level])) : yesterday.levels
    const critical = ctx.country.bloodGroups.filter((g) => levels[g] === 'CRITIQUE')

    return {
      kpis: [
        { label: 'Donneurs recensés', value: donors.toLocaleString('fr-FR'), note: 'fiches actives du site' },
        { label: 'Taux de retour', value: donors ? Math.round((regulars / donors) * 100) + ' %' : '—', note: 'donneurs ayant donné au moins deux fois' },
        { label: 'Réponse aux alertes', value: alertsOut ? Math.round((alertsYes / alertsOut) * 100) + ' %' : '—', note: 'réponses « 1 » sur 30 jours' },
        { label: 'Dons ce mois', value: String(donsMonth), note: 'confirmés au site' },
        { label: 'Groupes en critique', value: String(critical.length), note: critical.length ? critical.join(', ') : 'aucun aujourd’hui' },
      ],
      stock: { day, saved: todayStock.length > 0, levels, yesterday: yesterday.levels, critical },
      needs: needs.map((n) => ({ id: n.id, hospital: n.hospital.shortName ?? n.hospital.name, service: n.service, bloodGroup: n.bloodGroup, quantity: n.quantity, urgency: n.urgency, status: n.status, createdAt: n.createdAt })),
      collectes: await Promise.all(collectes.map(async (c) => ({ id: c.id, name: c.name, type: c.type, day: c.day, ...(await collecteSummary(c)) }))),
      campaigns: await Promise.all(campaigns.map((c) => campaignView(ctx, c))),
      today: { rappels: rappelsToday, calls: openCalls, dons: donsToday },
    }
  })

  app.put('/stock', pilot, async (req) => {
    const ctx = req.ctx
    const body = z.object({ siteId: z.string(), levels: z.record(LEVEL) }).parse(req.body)
    const siteId = assertSite(ctx, body.siteId)
    const day = todayOf(ctx)
    for (const [group, level] of Object.entries(body.levels)) {
      if (!ctx.country.bloodGroups.includes(group)) throw new HttpError(400, 'Groupe inconnu : ' + group)
      await prisma.stockReading.upsert({ where: { siteId_day_group: { siteId, day, group } }, create: { siteId, day, group, level }, update: { level, at: new Date() } })
    }
    await audit(ctx, 'stock.releve', 'Organisation', siteId, body.levels)
    return { ok: true }
  })

  app.get('/national', pilot, async (req) => {
    const ctx = req.ctx
    if (!ctx.national) throw new HttpError(403, 'Vue réservée au périmètre national')
    const day = todayOf(ctx)
    const sites = await prisma.organisation.findMany({ where: { id: { in: ctx.siteIds } }, orderBy: { name: 'asc' } })
    const rows = await Promise.all(sites.map(async (s) => {
      const [{ day: readingDay, levels }, donors] = await Promise.all([latestLevels(s.id, day), prisma.donor.count({ where: { siteId: s.id } })])
      return { id: s.id, name: s.name, city: s.city, donors, readingDay, late: readingDay !== day, levels }
    }))
    const critical = rows.reduce((a, r) => a + Object.values(r.levels).filter((l) => l === 'CRITIQUE').length, 0)
    const [donors, regulars, donsMonth, openNeeds] = await Promise.all([
      prisma.donor.count({ where: { siteId: { in: ctx.siteIds } } }),
      prisma.donor.count({ where: { siteId: { in: ctx.siteIds }, donationCount: { gte: 2 } } }),
      prisma.donation.count({ where: { siteId: { in: ctx.siteIds }, date: { gte: new Date(day.slice(0, 8) + '01T00:00:00Z') } } }),
      prisma.need.count({ where: { siteId: { in: ctx.siteIds }, status: 'TRANSMIS' } }),
    ])
    return {
      kpis: [
        { label: 'Donneurs recensés', value: donors.toLocaleString('fr-FR'), note: rows.length + ' sites de collecte' },
        { label: 'Taux de retour', value: donors ? Math.round((regulars / donors) * 100) + ' %' : '—', note: 'au moins deux dons' },
        { label: 'Dons ce mois', value: String(donsMonth), note: 'tous sites' },
        { label: 'Ruptures', value: String(critical), note: 'groupes en critique, tous sites' },
        { label: 'Besoins en attente', value: String(openNeeds), note: 'signalés, sans alerte lancée' },
      ],
      sites: rows,
    }
  })

  // ----- campagnes
  const target = z.object({ siteId: z.string(), bloodGroup: z.string(), zone: z.string() })

  app.post('/campaigns/preview', pilot, async (req) => {
    const ctx = req.ctx
    const b = target.parse(req.body)
    const siteId = assertSite(ctx, b.siteId)
    const r = await alertTargets(ctx.country, siteId, b.bloodGroup, b.zone)
    const open = await nextOpenCollecte(siteId, ctx.country.timezone)
    const vars = open ? collecteLabel(open.collecte) : { collecte: 'au site', date: 'dès demain' }
    return {
      pool: r.pool, excludedNotApt: r.excludedNotApt, excludedCap: r.excludedCap,
      targets: r.targets.slice(0, 50).map((d) => ({ id: d.id, name: fullName(d), donationCount: d.donationCount, lastDonationDay: d.lastDonationAt?.toISOString().slice(0, 10) ?? null })),
      count: r.targets.length,
      preview: fill(template(ctx.country, 'alerte', 'fr'), { 'prénom': 'Aïcha', groupe: b.bloodGroup, ...vars }),
      collecte: open ? open.collecte.name : null,
    }
  })

  app.post('/campaigns', pilot, async (req) => {
    const ctx = req.ctx
    const b = target.parse(req.body)
    const siteId = assertSite(ctx, b.siteId)
    const c = await launchAlert(ctx.country, siteId, b.bloodGroup, b.zone)
    if (!c) throw new HttpError(400, 'Aucun donneur apte et sollicitable dans cette zone')
    await audit(ctx, 'campagne.alerte', 'Campaign', c.id, b)
    return campaignView(ctx, c)
  })

  app.get('/campaigns', pilot, async (req) => {
    const ctx = req.ctx
    const siteId = assertSite(ctx, (req.query as { siteId?: string }).siteId)
    const list = await prisma.campaign.findMany({ where: { siteId }, orderBy: { createdAt: 'desc' }, take: 20 })
    return Promise.all(list.map((c) => campaignView(ctx, c)))
  })

  app.post('/campaigns/:id/escalate', pilot, async (req) => {
    const ctx = req.ctx
    const c = await prisma.campaign.findUniqueOrThrow({ where: { id: (req.params as { id: string }).id } })
    assertSite(ctx, c.siteId)
    const n = await escalate(c.id)
    await audit(ctx, 'campagne.bascule', 'Campaign', c.id, { transferred: n })
    return { transferred: n }
  })

  app.post('/campaigns/reminders', pilot, async (req) => {
    const ctx = req.ctx
    const siteId = assertSite(ctx, (req.body as { siteId?: string })?.siteId)
    const sent = await runReminders(ctx.country.code, [siteId])
    await audit(ctx, 'rappels.envoi', 'Organisation', siteId, { sent })
    return { sent }
  })

  app.get('/reminders', pilot, async (req) => {
    const ctx = req.ctx
    const siteId = assertSite(ctx, (req.query as { siteId?: string }).siteId)
    const day = todayOf(ctx)
    const from = addDays(day, -ctx.country.rules.reminderWindowDays)
    const tomorrow = addDays(day, 1)
    const donors = await prisma.donor.findMany({ where: { siteId, optOut: false, lastDonationAt: { not: null } } })
    const withE = donors.map((d) => ({ d, e: eligibility(d, ctx.country.rules, day, ctx.country.timezone) }))
    const due = withE.filter(({ e }) => e.apte && e.nextDay && e.nextDay >= from && e.nextDay <= day)
    const ids = due.map(({ d }) => d.id)
    const since = new Date(from + 'T00:00:00Z')
    const [msgs, rdvs, calls] = await Promise.all([
      prisma.message.findMany({ where: { donorId: { in: ids }, createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } }),
      prisma.appointment.findMany({ where: { donorId: { in: ids }, createdAt: { gte: since } }, include: { collecte: true } }),
      prisma.callTask.findMany({ where: { donorId: { in: ids }, createdAt: { gte: since } } }),
    ])
    const rows = due.map(({ d, e }) => {
      const rappel = msgs.find((m) => m.donorId === d.id && m.kind === 'rappel')
      const rdv = rdvs.find((a) => a.donorId === d.id)
      const call = calls.find((c) => c.donorId === d.id)
      const status = rdv ? { label: 'Créneau réservé · ' + rdv.collecte.name, tone: 'ok' }
        : call ? { label: 'Sans réponse → liste d’appel', tone: 'warn' }
        : rappel ? { label: rappel.status === 'LIVRE' ? 'SMS livré · en attente' : 'SMS envoyé', tone: 'muted' }
        : { label: 'À envoyer · prochain envoi ' + ctx.country.rules.reminderHour + ' h', tone: 'muted' }
      return { id: d.id, name: fullName(d), bloodGroup: d.bloodGroup, sinceDay: e.nextDay, status }
    }).sort((a, b) => (b.sinceDay ?? '').localeCompare(a.sinceDay ?? ''))
    return {
      rows,
      stats: {
        total: rows.length,
        booked: rows.filter((r) => r.status.tone === 'ok').length,
        tomorrow: withE.filter(({ e }) => e.kind === 'attente' && e.nextDay === tomorrow).length,
        hour: ctx.country.rules.reminderHour,
      },
    }
  })

  // ----- collectes
  app.get('/collectes', async (req) => {
    const ctx = req.ctx
    const siteId = assertSite(ctx, (req.query as { siteId?: string }).siteId)
    const list = await prisma.collecte.findMany({ where: { siteId, day: { gte: todayOf(ctx) } }, orderBy: [{ day: 'asc' }, { startMinutes: 'asc' }] })
    return Promise.all(list.map(async (c) => {
      const counts = await occupancy(c.id)
      return {
        id: c.id, type: c.type, name: c.name, place: c.place, day: c.day, dayLabel: fmtDay(c.day, true),
        hours: slotTime(c, 0) + '–' + slotTime(c, c.slotCount), booked: counts.reduce((a, b) => a + b, 0), capacity: c.slotCount * c.slotCapacity,
        slots: counts.map((n, i) => ({ index: i, time: slotTime(c, i), booked: n, capacity: c.slotCapacity, past: isPast(c, i, ctx.country.timezone) })),
      }
    }))
  })

  app.post('/collectes', pilot, async (req) => {
    const ctx = req.ctx
    const b = z.object({
      siteId: z.string(), type: z.enum(['FIXE', 'MOBILE']), name: z.string().min(2), place: z.string().default(''),
      day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), startMinutes: z.number().int().min(0).max(1380), slotCount: z.number().int().min(2).max(24),
    }).parse(req.body)
    const siteId = assertSite(ctx, b.siteId)
    if (b.day < todayOf(ctx)) throw new HttpError(400, 'La date est passée')
    const c = await prisma.collecte.create({
      data: { ...b, siteId, place: b.place || b.name, slotMinutes: ctx.country.rules.slotMinutes, slotCapacity: ctx.country.rules.slotCapacity },
    })
    await audit(ctx, 'collecte.creation', 'Collecte', c.id, { name: c.name, day: c.day })
    return c
  })

  // Réservation manuelle d'un créneau (utilisée par la liste d'appel).
  app.post('/collectes/:id/book', async (req) => {
    const ctx = req.ctx
    const b = z.object({ donorId: z.string(), slotIndex: z.number().int().min(0) }).parse(req.body)
    const c = await prisma.collecte.findUniqueOrThrow({ where: { id: (req.params as { id: string }).id } })
    assertSite(ctx, c.siteId)
    const counts = await occupancy(c.id)
    if ((counts[b.slotIndex] ?? Infinity) >= c.slotCapacity || isPast(c, b.slotIndex, ctx.country.timezone)) throw new HttpError(409, 'Créneau complet ou passé')
    return book(b.donorId, c, b.slotIndex, 'APPEL')
  })
}
