// Configuration pays (pilote national ou super admin) et espace super admin de la plateforme.
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db.js'
import { audit, HttpError, requireRole } from '../context.js'
import { escalate, runReminders } from '../domain/campaigns.js'
import { handleInbound } from '../domain/inbound.js'
import { PACKS } from '../pack.js'
import { seed } from '../../prisma/seed.js'
import { todayOf } from './helpers.js'

export default async function admin(app: FastifyInstance) {
  const superAdmin = { preHandler: requireRole('SUPER_ADMIN') }

  // ----- configuration pays (règles et modèles de SMS)
  app.get('/country', async (req) => req.ctx.country)

  app.put('/country', async (req) => {
    const ctx = req.ctx
    if (!(ctx.user.role === 'SUPER_ADMIN' || (ctx.user.role === 'PILOTE' && ctx.national))) throw new HttpError(403, 'Réservé au niveau national')
    const b = z.object({
      rules: z.object({
        minIntervalDays: z.object({ M: z.number().int().min(28).max(365), F: z.number().int().min(28).max(365) }).optional(),
        monthlyContactCap: z.number().int().min(1).max(10).optional(),
        reminderHour: z.number().int().min(6).max(20).optional(),
        escalateAfterMinutes: z.number().int().min(1).max(4320).optional(),
      }).optional(),
      templates: z.record(z.record(z.string().min(10).max(459))).optional(),
    }).parse(req.body)
    const row = await prisma.country.findUniqueOrThrow({ where: { code: ctx.country.code } })
    const rules = { ...(row.rules as object), ...(b.rules ?? {}) }
    const templates = { ...(row.templates as Record<string, object>) }
    for (const [k, v] of Object.entries(b.templates ?? {})) templates[k] = { ...(templates[k] ?? {}), ...v }
    await prisma.country.update({ where: { code: row.code }, data: { rules, templates } })
    await audit(ctx, 'pays.regles', 'Country', row.code, b)
    return { ok: true }
  })

  // ----- vue d'ensemble plateforme
  app.get('/admin/overview', superAdmin, async (req) => {
    const ctx = req.ctx
    const day = todayOf(ctx)
    const since = new Date(day + 'T00:00:00Z')
    const [countries, orgs, users, donors, smsToday, repliesToday, openCalls, campaigns] = await Promise.all([
      prisma.country.findMany(),
      prisma.organisation.groupBy({ by: ['type'], _count: true }),
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.donor.count(),
      prisma.message.count({ where: { direction: 'OUT', createdAt: { gte: since } } }),
      prisma.message.count({ where: { direction: 'IN', createdAt: { gte: since } } }),
      prisma.callTask.count({ where: { doneAt: null } }),
      prisma.campaign.count(),
    ])
    return {
      countries: countries.map((c) => ({ code: c.code, name: c.name, active: c.active, pack: !!PACKS[c.code] })),
      availablePacks: Object.values(PACKS).map((p) => ({ code: p.code, name: p.name })),
      orgs: Object.fromEntries(orgs.map((o) => [o.type, o._count])),
      users: Object.fromEntries(users.map((u) => [u.role, u._count])),
      donors, smsToday, repliesToday, openCalls, campaigns, gateway: 'simulateur',
    }
  })

  // ----- organisations
  app.get('/admin/organisations', superAdmin, async () => {
    const list = await prisma.organisation.findMany({ include: { _count: { select: { users: true, donors: true } } }, orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    return list.map((o) => ({ id: o.id, type: o.type, name: o.name, shortName: o.shortName, city: o.city, zones: o.zones, parentId: o.parentId, countryCode: o.countryCode, users: o._count.users, donors: o._count.donors }))
  })

  const orgInput = z.object({
    type: z.enum(['NATIONAL', 'REGIONAL', 'SITE', 'HOSPITAL']), name: z.string().trim().min(2), shortName: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(), zones: z.array(z.string().trim().min(1)).default([]), parentId: z.string().optional().nullable(),
  })
  app.post('/admin/organisations', superAdmin, async (req) => {
    const b = orgInput.parse(req.body)
    if (b.type !== 'NATIONAL' && !b.parentId) throw new HttpError(400, 'Organisation parente obligatoire')
    if (b.type === 'HOSPITAL') {
      const p = b.parentId ? await prisma.organisation.findUnique({ where: { id: b.parentId } }) : null
      if (p?.type !== 'SITE') throw new HttpError(400, 'Un établissement est rattaché au site de collecte qui le fournit')
    }
    const o = await prisma.organisation.create({ data: { ...b, countryCode: req.ctx.country.code } })
    await audit(req.ctx, 'organisation.creation', 'Organisation', o.id, { name: o.name, type: o.type })
    return o
  })
  app.patch('/admin/organisations/:id', superAdmin, async (req) => {
    const b = orgInput.partial().parse(req.body)
    const o = await prisma.organisation.update({ where: { id: (req.params as { id: string }).id }, data: b })
    await audit(req.ctx, 'organisation.modification', 'Organisation', o.id, b)
    return o
  })

  // ----- utilisateurs
  app.get('/admin/users', superAdmin, async () => {
    const list = await prisma.user.findMany({ include: { organisation: true }, orderBy: [{ role: 'asc' }, { name: 'asc' }] })
    return list.map((u) => ({ id: u.id, name: u.name, title: u.title, email: u.email, role: u.role, active: u.active, organisationId: u.organisationId, organisation: u.organisation?.name ?? null }))
  })
  const userInput = z.object({
    name: z.string().trim().min(2), title: z.string().trim().min(2), email: z.string().trim().email(),
    role: z.enum(['SUPER_ADMIN', 'PILOTE', 'OPERATEUR', 'DEMANDEUR']), organisationId: z.string().nullable().optional(), active: z.boolean().optional(),
  })
  async function checkScope(role: string, orgId?: string | null) {
    if (role === 'SUPER_ADMIN') return
    const o = orgId ? await prisma.organisation.findUnique({ where: { id: orgId } }) : null
    if (!o) throw new HttpError(400, 'Organisation obligatoire pour ce rôle')
    const ok = { PILOTE: ['NATIONAL', 'REGIONAL', 'SITE'], OPERATEUR: ['SITE'], DEMANDEUR: ['HOSPITAL'] }[role] ?? []
    if (!ok.includes(o.type)) throw new HttpError(400, 'Périmètre incompatible avec le rôle ' + role)
  }
  app.post('/admin/users', superAdmin, async (req) => {
    const b = userInput.parse(req.body)
    await checkScope(b.role, b.organisationId)
    const u = await prisma.user.create({ data: b })
    await audit(req.ctx, 'utilisateur.creation', 'User', u.id, { name: u.name, role: u.role })
    return u
  })
  app.patch('/admin/users/:id', superAdmin, async (req) => {
    const b = userInput.partial().parse(req.body)
    const id = (req.params as { id: string }).id
    const cur = await prisma.user.findUniqueOrThrow({ where: { id } })
    if (b.role || b.organisationId !== undefined) await checkScope(b.role ?? cur.role, b.organisationId !== undefined ? b.organisationId : cur.organisationId)
    const u = await prisma.user.update({ where: { id }, data: b })
    await audit(req.ctx, 'utilisateur.modification', 'User', u.id, b)
    return u
  })

  // ----- journal, messages, simulateur, tâches
  app.get('/admin/audit', superAdmin, async () => {
    const list = await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 100 })
    return list.map((a) => ({ id: a.id, at: a.createdAt, user: a.user?.name ?? 'Système', action: a.action, entity: a.entity, details: a.details }))
  })

  app.get('/admin/messages', superAdmin, async () => {
    const list = await prisma.message.findMany({ include: { donor: { include: { site: true } } }, orderBy: { createdAt: 'desc' }, take: 60 })
    return list.map((m) => ({
      id: m.id, at: m.createdAt, direction: m.direction, kind: m.kind, body: m.body, status: m.status,
      donor: { id: m.donor.id, name: m.donor.firstName + ' ' + m.donor.lastName, phone: m.donor.phone, site: m.donor.site.name, optOut: m.donor.optOut },
    }))
  })

  app.post('/admin/simulator/reply', superAdmin, async (req) => {
    const b = z.object({ donorId: z.string(), text: z.string().trim().min(1).max(160) }).parse(req.body)
    const d = await prisma.donor.findUniqueOrThrow({ where: { id: b.donorId } })
    const r = await handleInbound(d.countryCode, d.phone, b.text)
    await audit(req.ctx, 'simulateur.reponse', 'Donor', d.id, { text: b.text, outcome: r.outcome })
    return r
  })

  app.post('/admin/jobs/:name', superAdmin, async (req) => {
    const name = (req.params as { name: string }).name
    if (name === 'reminders') return { sent: await runReminders(req.ctx.country.code) }
    if (name === 'escalate') {
      const open = await prisma.campaign.findMany({ where: { escalated: false }, select: { id: true } })
      let n = 0
      for (const c of open) n += await escalate(c.id)
      return { transferred: n }
    }
    throw new HttpError(404, 'Tâche inconnue')
  })

  app.post('/admin/reset', superAdmin, async () => {
    await seed()
    return { ok: true }
  })
}
