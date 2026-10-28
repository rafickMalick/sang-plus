import Fastify from 'fastify'
import cors from '@fastify/cors'
import { ZodError } from 'zod'
import { prisma } from './db.js'
import { HttpError, loadContext } from './context.js'
import { startJobs } from './jobs.js'
import { ROLE_HOME } from './roles.js'
import pilote from './routes/pilote.js'
import donors from './routes/donors.js'
import operateur from './routes/operateur.js'
import needs from './routes/needs.js'
import admin from './routes/admin.js'

const app = Fastify({ logger: { level: 'info' } })
await app.register(cors, { origin: true })

app.setErrorHandler((err, _req, reply) => {
  if (err instanceof HttpError) return reply.status(err.status).send({ error: err.message })
  if (err instanceof ZodError) return reply.status(400).send({ error: 'Données invalides : ' + err.issues.map((i) => i.path.join('.') + ' ' + i.message).join(', ') })
  if ((err as { code?: string }).code === 'P2025') return reply.status(404).send({ error: 'Élément introuvable' })
  if ((err as { code?: string }).code === 'P2002') return reply.status(409).send({ error: 'Cet élément existe déjà' })
  app.log.error(err)
  return reply.status(500).send({ error: 'Erreur interne' })
})

// Routes publiques de démonstration (pas de profil requis).
app.get('/api/health', async () => ({ ok: true }))
app.get('/api/demo/users', async () => {
  const users = await prisma.user.findMany({ where: { active: true }, include: { organisation: true }, orderBy: [{ role: 'asc' }, { name: 'asc' }] })
  return users.map((u) => ({ id: u.id, name: u.name, title: u.title, role: u.role, organisation: u.organisation?.name ?? 'Plateforme Sang+' }))
})

// Routes métier : le profil de démonstration est chargé avant chaque requête.
await app.register(async (api) => {
  api.addHook('preHandler', async (req) => loadContext(req))
  api.get('/me', async (req) => {
    const { user, country, siteIds, national } = req.ctx
    const sites = await prisma.organisation.findMany({ where: { id: { in: siteIds } }, orderBy: { name: 'asc' } })
    return {
      user: { id: user.id, name: user.name, title: user.title, role: user.role },
      organisation: user.organisation && { id: user.organisation.id, name: user.organisation.name, type: user.organisation.type, city: user.organisation.city },
      national, home: ROLE_HOME[user.role],
      sites: sites.map((s) => ({ id: s.id, name: s.name, city: s.city, zones: s.zones })),
      country,
    }
  })
  await api.register(pilote)
  await api.register(donors)
  await api.register(operateur)
  await api.register(needs)
  await api.register(admin)
}, { prefix: '/api' })

const port = Number(process.env.PORT ?? 3040)
await app.listen({ port, host: '0.0.0.0' })
startJobs((m) => app.log.warn(m))
