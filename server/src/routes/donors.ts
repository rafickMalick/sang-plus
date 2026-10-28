// Registre des donneurs : recherche, fiche, création et import de fichiers (dédoublonnage téléphone / ID national).
import type { FastifyInstance } from 'fastify'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../db.js'
import { assertSite, audit, HttpError, type Ctx } from '../context.js'
import { monthlyContacts } from '../domain/contacts.js'
import { normalizePhone } from '../domain/messaging.js'
import { dayOf, noonOf } from '../time.js'
import { donorView, todayOf } from './helpers.js'

const donorInput = z.object({
  siteId: z.string(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().trim(),
  nationalId: z.string().trim().optional().nullable(),
  bloodGroup: z.string(),
  sex: z.enum(['F', 'M']),
  birthYear: z.number().int().optional().nullable(),
  zone: z.string().trim().min(1),
  lang: z.string().default('fr'),
  lastDonationDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
})
type DonorInput = z.infer<typeof donorInput>

function check(ctx: Ctx, d: DonorInput): string | null {
  const c = ctx.country
  if (!new RegExp(c.phone.pattern).test(d.phone)) return 'Téléphone invalide (format attendu : ' + c.phone.example + ')'
  if (d.nationalId && !new RegExp(c.nationalId.pattern).test(d.nationalId)) return c.nationalId.label + ' invalide'
  if (c.nationalId.required && !d.nationalId) return c.nationalId.label + ' obligatoire'
  if (!c.bloodGroups.includes(d.bloodGroup)) return 'Groupe sanguin inconnu : ' + d.bloodGroup
  if (!c.languages.some((l) => l.code === d.lang)) return 'Langue inconnue : ' + d.lang
  return null
}

// Crée la fiche ou complète la fiche existante (même téléphone ou même ID national).
async function upsertDonor(ctx: Ctx, d: DonorInput): Promise<'created' | 'merged'> {
  const phone = normalizePhone(d.phone)
  const existing = await prisma.donor.findFirst({
    where: { countryCode: ctx.country.code, OR: [{ phone }, ...(d.nationalId ? [{ nationalId: d.nationalId }] : [])] },
  })
  const last = d.lastDonationDay ? noonOf(d.lastDonationDay) : null
  if (existing) {
    await prisma.donor.update({
      where: { id: existing.id },
      data: {
        nationalId: existing.nationalId ?? d.nationalId ?? null,
        birthYear: existing.birthYear ?? d.birthYear ?? null,
        ...(last && (!existing.lastDonationAt || last > existing.lastDonationAt) ? { lastDonationAt: last } : {}),
      },
    })
    return 'merged'
  }
  await prisma.donor.create({
    data: {
      countryCode: ctx.country.code, siteId: d.siteId, firstName: d.firstName, lastName: d.lastName, phone,
      nationalId: d.nationalId || null, bloodGroup: d.bloodGroup, sex: d.sex, birthYear: d.birthYear ?? null,
      zone: d.zone, lang: d.lang, lastDonationAt: last, donationCount: last ? 1 : 0,
    },
  })
  return 'created'
}

export default async function donors(app: FastifyInstance) {
  app.get('/donors', async (req) => {
    const ctx = req.ctx
    const q = req.query as { siteId?: string; q?: string; group?: string; status?: string }
    const siteIds = q.siteId ? [assertSite(ctx, q.siteId)] : ctx.siteIds
    const term = (q.q ?? '').trim()
    const digits = term.replace(/\s/g, '')
    const where: Prisma.DonorWhereInput = {
      siteId: { in: siteIds },
      ...(q.group && q.group !== 'Tous' ? { bloodGroup: q.group } : {}),
      ...(term ? { OR: [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        ...(digits.length >= 3 ? [{ phone: { contains: digits } }, { nationalId: { contains: digits } }] : []),
      ] } : {}),
    }
    const rows = await prisma.donor.findMany({ where, include: { site: true }, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] })
    let views = rows.map((d) => donorView(ctx, d))
    if (q.status === 'apte') views = views.filter((v) => v.eligibility.apte)
    if (q.status === 'non') views = views.filter((v) => !v.eligibility.apte)
    const contacts = await monthlyContacts(views.slice(0, 300).map((v) => v.id), todayOf(ctx))
    return { total: views.length, rows: views.slice(0, 300).map((v) => ({ ...v, contactsMonth: contacts.get(v.id) ?? 0 })) }
  })

  app.get('/donors/:id', async (req) => {
    const ctx = req.ctx
    const d = await prisma.donor.findUnique({
      where: { id: (req.params as { id: string }).id },
      include: { site: true, donations: { orderBy: { date: 'desc' }, take: 10 }, messages: { orderBy: { createdAt: 'desc' }, take: 15 }, callTasks: { orderBy: { createdAt: 'desc' }, take: 10 }, appointments: { include: { collecte: true }, orderBy: { createdAt: 'desc' }, take: 5 } },
    })
    if (!d) throw new HttpError(404, 'Donneur introuvable')
    assertSite(ctx, d.siteId)
    const tz = ctx.country.timezone
    const timeline = [
      ...d.donations.map((x) => ({ at: x.date, text: 'Don confirmé au site' + (x.bagNumber ? ' · poche ' + x.bagNumber : ''), tone: 'red' })),
      ...d.messages.map((m) => ({ at: m.createdAt, text: (m.direction === 'IN' ? 'Réponse SMS : « ' + m.body + ' »' : 'SMS · ' + m.kind), tone: m.direction === 'IN' ? 'ok' : 'muted' })),
      ...d.callTasks.filter((c) => c.doneAt).map((c) => ({ at: c.doneAt!, text: 'Appel · ' + c.resultLabel, tone: c.result === 'RDV' ? 'ok' : 'warn' })),
      ...d.appointments.map((a) => ({ at: a.createdAt, text: 'Rendez-vous · ' + a.collecte.name + ' (' + a.status.toLowerCase() + ')', tone: 'ok' })),
    ].sort((a, b) => +b.at - +a.at).slice(0, 12).map((e) => ({ ...e, day: dayOf(e.at, tz) }))
    const contacts = await monthlyContacts([d.id], todayOf(ctx))
    return { ...donorView(ctx, d), contactsMonth: contacts.get(d.id) ?? 0, timeline }
  })

  app.post('/donors', async (req) => {
    const ctx = req.ctx
    const d = donorInput.parse(req.body)
    assertSite(ctx, d.siteId)
    const err = check(ctx, d)
    if (err) throw new HttpError(400, err)
    const r = await upsertDonor(ctx, d)
    await audit(ctx, 'donneur.' + (r === 'created' ? 'creation' : 'fusion'), 'Donor', undefined, { phone: d.phone })
    return { result: r }
  })

  // CSV séparé par « ; » ou « , » : prenom;nom;telephone;id_national;groupe;sexe;annee_naissance;commune;langue;dernier_don
  app.post('/donors/import', async (req) => {
    const ctx = req.ctx
    const b = z.object({ siteId: z.string(), csv: z.string().min(1), fileName: z.string().default('import.csv') }).parse(req.body)
    const siteId = assertSite(ctx, b.siteId)
    const lines = b.csv.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
    const sep = (lines[0].match(/;/g) ?? []).length >= (lines[0].match(/,/g) ?? []).length ? ';' : ','
    const head = lines[0].toLowerCase().split(sep).map((h) => h.trim())
    const col = (row: string[], name: string) => (row[head.indexOf(name)] ?? '').trim()
    const report = { read: lines.length - 1, created: 0, merged: 0, errors: [] as { line: number; reason: string }[] }
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(sep)
      const parsed = donorInput.safeParse({
        siteId, firstName: col(row, 'prenom'), lastName: col(row, 'nom'), phone: col(row, 'telephone'),
        nationalId: col(row, 'id_national') || null, bloodGroup: col(row, 'groupe').replace('-', '−'), sex: col(row, 'sexe').toUpperCase(),
        birthYear: col(row, 'annee_naissance') ? Number(col(row, 'annee_naissance')) : null, zone: col(row, 'commune'),
        lang: col(row, 'langue') || 'fr', lastDonationDay: col(row, 'dernier_don') || null,
      })
      if (!parsed.success) { report.errors.push({ line: i + 1, reason: parsed.error.issues[0].path.join('.') + ' : ' + parsed.error.issues[0].message }); continue }
      const err = check(ctx, parsed.data)
      if (err) { report.errors.push({ line: i + 1, reason: err }); continue }
      report[(await upsertDonor(ctx, parsed.data)) === 'created' ? 'created' : 'merged']++
    }
    await audit(ctx, 'donneur.import', 'Organisation', siteId, { fileName: b.fileName, ...report, errors: report.errors.length })
    return report
  })
}
