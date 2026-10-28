// Réponses des donneurs (webhook de la passerelle SMS, ou simulateur en démonstration).
import { prisma } from '../db.js'
import { countryConfig } from '../pack.js'
import { book, collecteLabel, firstFreeSlot, nextOpenCollecte, slotTime } from './booking.js'
import { fill, normalizePhone, sendSms, template } from './messaging.js'

export async function handleInbound(countryCode: string, from: string, text: string) {
  const country = await countryConfig(countryCode)
  const donor = await prisma.donor.findUnique({ where: { countryCode_phone: { countryCode, phone: normalizePhone(from) } } })
  if (!donor) return { outcome: 'inconnu' as const }
  await prisma.message.create({ data: { donorId: donor.id, direction: 'IN', kind: 'reponse', body: text, status: 'RECU' } })
  const word = text.trim().toUpperCase()

  if (word === country.sms.stopKeyword) {
    await prisma.donor.update({ where: { id: donor.id }, data: { optOut: true } })
    await prisma.callTask.updateMany({ where: { donorId: donor.id, doneAt: null }, data: { doneAt: new Date(), result: 'REFUS', resultLabel: 'Désinscrit par SMS (STOP)' } })
    await sendSms(donor, 'stop', template(country, 'stop', donor.lang))
    return { outcome: 'desinscrit' as const }
  }

  if (word === country.sms.bookKeyword) {
    // Créneau sur la collecte proposée par la dernière campagne, sinon la prochaine collecte du site.
    const last = await prisma.message.findFirst({ where: { donorId: donor.id, direction: 'OUT', campaignId: { not: null } }, orderBy: { createdAt: 'desc' }, include: { campaign: true } })
    let target = null
    if (last?.campaign?.collecteId) {
      const c = await prisma.collecte.findUnique({ where: { id: last.campaign.collecteId } })
      const slot = c ? await firstFreeSlot(c, country.timezone) : -1
      if (c && slot >= 0) target = { collecte: c, slot }
    }
    target ??= await nextOpenCollecte(donor.siteId, country.timezone)
    if (!target) return { outcome: 'complet' as const }
    await book(donor.id, target.collecte, target.slot, 'SMS')
    const heure = slotTime(target.collecte, target.slot)
    await prisma.callTask.updateMany({ where: { donorId: donor.id, doneAt: null }, data: { doneAt: new Date(), result: 'RDV', resultLabel: 'RDV pris par SMS · ' + target.collecte.name + ' ' + heure } })
    await sendSms(donor, 'rdv', fill(template(country, 'rdv', donor.lang), { 'prénom': donor.firstName, ...collecteLabel(target.collecte), heure }))
    return { outcome: 'rdv' as const, collecte: target.collecte.name, heure }
  }

  return { outcome: 'libre' as const }
}
