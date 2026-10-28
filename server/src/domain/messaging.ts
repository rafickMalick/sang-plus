// Envoi et réception des SMS. La passerelle est derrière une interface : en démonstration,
// le simulateur n'envoie rien et marque le message « livré » après un court délai.
import type { Donor } from '@prisma/client'
import { prisma } from '../db.js'
import type { Pack, TemplateKind } from '../pack.js'

export interface SmsGateway {
  name: string
  send(to: string, body: string): Promise<{ ok: boolean }>
}

const simulator: SmsGateway = { name: 'simulateur', send: async () => ({ ok: true }) }
export const gateway: SmsGateway = simulator

export function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{([^}]+)\}/g, (m, k: string) => vars[k] ?? m)
}

export function template(country: Pack, kind: TemplateKind, lang: string): string {
  const t = country.templates[kind]
  return t[lang] ?? t.fr ?? Object.values(t)[0]
}

export async function sendSms(donor: Donor, kind: string, body: string, campaignId?: string) {
  const msg = await prisma.message.create({
    data: { donorId: donor.id, campaignId, direction: 'OUT', kind, body, status: 'ENVOYE' },
  })
  const res = await gateway.send(donor.phone, body)
  setTimeout(() => {
    prisma.message.update({ where: { id: msg.id }, data: { status: res.ok ? 'LIVRE' : 'ECHEC' } }).catch(() => {})
  }, 1500)
  return msg
}

export const normalizePhone = (p: string) => p.replace(/[\s.-]/g, '')
