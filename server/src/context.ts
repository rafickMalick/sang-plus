// Mode démonstration : pas d'authentification. Le front envoie l'identifiant de l'utilisateur
// choisi dans l'en-tête « x-demo-user » ; l'authentification réelle se branchera ici.
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Organisation, Role, User } from '@prisma/client'
import { prisma } from './db.js'
import { countryConfig, type Pack } from './pack.js'

export type Ctx = {
  user: User & { organisation: Organisation | null }
  country: Pack
  siteIds: string[] // sites de collecte dans le périmètre de l'utilisateur
  national: boolean // périmètre pays entier
}

declare module 'fastify' {
  interface FastifyRequest {
    ctx: Ctx
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function loadContext(req: FastifyRequest) {
  const id = req.headers['x-demo-user']
  if (typeof id !== 'string' || !id) throw new HttpError(401, 'Aucun profil de démonstration sélectionné')
  const user = await prisma.user.findUnique({ where: { id }, include: { organisation: true } })
  if (!user || !user.active) throw new HttpError(401, 'Profil de démonstration inconnu')

  const countryCode = user.organisation?.countryCode ?? 'BJ'
  const sites = await prisma.organisation.findMany({ where: { countryCode, type: 'SITE' }, select: { id: true, parentId: true } })
  const org = user.organisation
  let siteIds: string[] = []
  let national = false
  if (user.role === 'SUPER_ADMIN' || org?.type === 'NATIONAL') {
    siteIds = sites.map((s) => s.id)
    national = true
  } else if (org?.type === 'REGIONAL') {
    siteIds = sites.filter((s) => s.parentId === org.id).map((s) => s.id)
  } else if (org?.type === 'SITE') {
    siteIds = [org.id]
  } else if (org?.type === 'HOSPITAL' && org.parentId) {
    siteIds = [org.parentId]
  }
  req.ctx = { user, country: await countryConfig(countryCode), siteIds, national }
}

export function requireRole(...roles: Role[]) {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    if (!roles.includes(req.ctx.user.role)) throw new HttpError(403, 'Action non autorisée pour ce profil')
  }
}

export function assertSite(ctx: Ctx, siteId: string | undefined): string {
  const id = siteId || ctx.siteIds[0]
  if (!id || !ctx.siteIds.includes(id)) throw new HttpError(403, 'Site hors de votre périmètre')
  return id
}

export async function audit(ctx: Ctx | null, action: string, entity: string, entityId?: string, details: object = {}) {
  await prisma.auditLog.create({ data: { userId: ctx?.user.id, action, entity, entityId, details } })
}
