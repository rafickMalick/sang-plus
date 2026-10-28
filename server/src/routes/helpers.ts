import type { Campaign, Donor, Organisation } from '@prisma/client'
import { prisma } from '../db.js'
import { eligibility } from '../domain/eligibility.js'
import type { Ctx } from '../context.js'
import { dayOf, today } from '../time.js'

export const fullName = (d: Pick<Donor, 'firstName' | 'lastName'>) => d.firstName + ' ' + d.lastName
export const todayOf = (ctx: Ctx) => today(ctx.country.timezone)

export function donorView(ctx: Ctx, d: Donor & { site?: Organisation }) {
  const e = eligibility(d, ctx.country.rules, todayOf(ctx), ctx.country.timezone)
  return {
    id: d.id, name: fullName(d), firstName: d.firstName, phone: d.phone, nationalId: d.nationalId,
    bloodGroup: d.bloodGroup, sex: d.sex, birthYear: d.birthYear, zone: d.zone, lang: d.lang,
    siteId: d.siteId, siteName: d.site?.name,
    lastDonationDay: d.lastDonationAt ? dayOf(d.lastDonationAt, ctx.country.timezone) : null,
    donationCount: d.donationCount, optOut: d.optOut,
    eligibility: e,
  }
}

// Chiffres d'une campagne : envoyés, réponses « 1 », basculés en liste d'appel.
export async function campaignView(ctx: Ctx, c: Campaign) {
  const donorIds = (await prisma.message.findMany({ where: { campaignId: c.id, direction: 'OUT' }, select: { donorId: true } })).map((m) => m.donorId)
  const [yes, transferred] = await Promise.all([
    prisma.message.findMany({ where: { donorId: { in: donorIds }, direction: 'IN', body: ctx.country.sms.bookKeyword, createdAt: { gte: c.createdAt } }, distinct: ['donorId'], select: { donorId: true } }),
    prisma.callTask.count({ where: { campaignId: c.id } }),
  ])
  return {
    id: c.id, type: c.type, bloodGroup: c.bloodGroup, zone: c.zone, createdAt: c.createdAt,
    sent: c.sent, yes: yes.length, transferred, escalated: c.escalated,
  }
}
