// Signalements de besoin des établissements demandeurs.
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db.js'
import { audit, HttpError, requireRole } from '../context.js'

export default async function needs(app: FastifyInstance) {
  app.get('/needs', async (req) => {
    const ctx = req.ctx
    const org = ctx.user.organisation
    const where = ctx.user.role === 'DEMANDEUR' ? { hospitalId: org?.id ?? '' } : { siteId: { in: ctx.siteIds } }
    const list = await prisma.need.findMany({ where, include: { hospital: true, site: true, campaign: true }, orderBy: { createdAt: 'desc' }, take: 30 })
    return list.map((n) => ({
      id: n.id, hospital: n.hospital.shortName ?? n.hospital.name, site: n.site.name, service: n.service, bloodGroup: n.bloodGroup,
      quantity: n.quantity, urgency: n.urgency, status: n.status, createdAt: n.createdAt, solicited: n.campaign?.sent ?? null,
    }))
  })

  app.post('/needs', { preHandler: requireRole('DEMANDEUR') }, async (req) => {
    const ctx = req.ctx
    const b = z.object({
      service: z.string().trim().min(2), bloodGroup: z.string(), quantity: z.number().int().min(1).max(50), urgency: z.enum(['Vitale', 'Urgente', 'Programmée']),
    }).parse(req.body)
    const org = ctx.user.organisation
    if (!org?.parentId) throw new HttpError(400, 'Établissement non rattaché à un site de collecte')
    if (!ctx.country.bloodGroups.includes(b.bloodGroup)) throw new HttpError(400, 'Groupe sanguin inconnu')
    const n = await prisma.need.create({ data: { ...b, hospitalId: org.id, siteId: org.parentId } })
    await audit(ctx, 'besoin.signalement', 'Need', n.id, b)
    return n
  })
}
