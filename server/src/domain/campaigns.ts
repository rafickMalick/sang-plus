// Alertes ciblées, rappels d'aptitude et bascule des sans-réponse vers la liste d'appel.
import type { Donor } from '@prisma/client'
import { prisma } from '../db.js'
import { countryConfig, type Pack } from '../pack.js'
import { addDays, today as todayIn } from '../time.js'
import { collecteLabel, nextOpenCollecte } from './booking.js'
import { monthlyContacts } from './contacts.js'
import { eligibility } from './eligibility.js'
import { fill, sendSms, template } from './messaging.js'

// Donneurs aptes et sollicitables d'un groupe et d'une zone, les plus fidèles d'abord.
export async function alertTargets(country: Pack, siteId: string, bloodGroup: string, zone: string) {
  const day = todayIn(country.timezone)
  const pool = await prisma.donor.findMany({ where: { siteId, bloodGroup, zone, optOut: false } })
  const aptes = pool.filter((d) => eligibility(d, country.rules, day, country.timezone).apte)
  const contacts = await monthlyContacts(aptes.map((d) => d.id), day)
  const targets = aptes.filter((d) => (contacts.get(d.id) ?? 0) < country.rules.monthlyContactCap).sort((a, b) => b.donationCount - a.donationCount)
  return { pool: pool.length, targets, excludedNotApt: pool.length - aptes.length, excludedCap: aptes.length - targets.length }
}

async function sendTo(country: Pack, donors: Donor[], kind: 'alerte' | 'rappel', campaignId: string, vars: Record<string, string>) {
  for (const d of donors) {
    const body = fill(template(country, kind, d.lang), { ...vars, 'prénom': d.firstName, groupe: d.bloodGroup })
    await sendSms(d, kind, body, campaignId)
  }
}

export async function launchAlert(country: Pack, siteId: string, bloodGroup: string, zone: string) {
  const { targets } = await alertTargets(country, siteId, bloodGroup, zone)
  if (!targets.length) return null
  const open = await nextOpenCollecte(siteId, country.timezone)
  const campaign = await prisma.campaign.create({
    data: { siteId, type: 'ALERTE', bloodGroup, zone, collecteId: open?.collecte.id, sent: targets.length },
  })
  await sendTo(country, targets, 'alerte', campaign.id, open ? collecteLabel(open.collecte) : { collecte: 'au site', date: 'dès demain' })
  await prisma.need.updateMany({ where: { siteId, bloodGroup, status: 'TRANSMIS' }, data: { status: 'ALERTE', campaignId: campaign.id } })
  return campaign
}

// Les destinataires sans réponse ni rendez-vous passent dans la liste d'appel des opérateurs.
export async function escalate(campaignId: string) {
  const c = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } })
  if (c.escalated) return 0
  const sent = await prisma.message.findMany({ where: { campaignId, direction: 'OUT' }, select: { donorId: true } })
  let n = 0
  for (const { donorId } of sent) {
    const [reply, rdv, open] = await Promise.all([
      prisma.message.findFirst({ where: { donorId, direction: 'IN', createdAt: { gte: c.createdAt } } }),
      prisma.appointment.findFirst({ where: { donorId, createdAt: { gte: c.createdAt } } }),
      prisma.callTask.findFirst({ where: { donorId, doneAt: null } }),
    ])
    if (reply || rdv || open) continue
    const reason = c.type === 'ALERTE' ? `Alerte ${c.bloodGroup} · SMS sans réponse` : 'Rappel d’aptitude · SMS sans réponse'
    await prisma.callTask.create({ data: { donorId, siteId: c.siteId, campaignId, reason } })
    n++
  }
  await prisma.campaign.update({ where: { id: campaignId }, data: { escalated: true } })
  return n
}

// Rappels quotidiens : donneurs redevenus aptes ces derniers jours et pas encore relancés.
export async function runReminders(countryCode: string, siteIds?: string[]) {
  const country = await countryConfig(countryCode)
  const day = todayIn(country.timezone)
  const from = addDays(day, -country.rules.reminderWindowDays)
  const sites = await prisma.organisation.findMany({ where: { countryCode, type: 'SITE', ...(siteIds ? { id: { in: siteIds } } : {}) } })
  let total = 0
  for (const site of sites) {
    const donors = await prisma.donor.findMany({ where: { siteId: site.id, optOut: false, lastDonationAt: { not: null } } })
    const due = donors.filter((d) => {
      const e = eligibility(d, country.rules, day, country.timezone)
      return e.apte && e.nextDay != null && e.nextDay >= from && e.nextDay <= day
    })
    if (!due.length) continue
    const already = await prisma.message.findMany({
      where: { donorId: { in: due.map((d) => d.id) }, kind: 'rappel', createdAt: { gte: new Date(from + 'T00:00:00Z') } },
      select: { donorId: true },
    })
    const done = new Set(already.map((m) => m.donorId))
    const contacts = await monthlyContacts(due.map((d) => d.id), day)
    const list = due.filter((d) => !done.has(d.id) && (contacts.get(d.id) ?? 0) < country.rules.monthlyContactCap)
    if (!list.length) continue
    const open = await nextOpenCollecte(site.id, country.timezone)
    const campaign = await prisma.campaign.create({ data: { siteId: site.id, type: 'RAPPEL', collecteId: open?.collecte.id, sent: list.length } })
    await sendTo(country, list, 'rappel', campaign.id, open ? collecteLabel(open.collecte) : { collecte: 'au site', date: 'prochainement' })
    total += list.length
  }
  return total
}
