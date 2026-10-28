// Données de démonstration — Bénin. Entièrement fictives, générées de façon déterministe
// et relatives à la date du jour pour que la démo reste « vivante ».
import { fileURLToPath } from 'node:url'
import type { Prisma, Sex, StockLevel } from '@prisma/client'
import { prisma } from '../src/db.js'
import { PACKS } from '../src/pack.js'
import { addDays, noonOf, today } from '../src/time.js'

const pack = PACKS.BJ
const G = pack.bloodGroups

let seedState = 20261018
const rnd = () => { seedState = (Math.imul(seedState, 1103515245) + 12345) >>> 0; return seedState / 4294967296 }
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
const wpick = <T,>(p: [T, number][]) => { const t = p.reduce((a, x) => a + x[1], 0); let x = rnd() * t; for (const q of p) { if ((x -= q[1]) < 0) return q[0] } return p[0][0] }
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))

const F_NAMES = ['Afi', 'Bisola', 'Adjara', 'Mireille', 'Nafissatou', 'Rachidatou', 'Fifamè', 'Chimène', 'Prudence', 'Hermione', 'Aïcha', 'Yvette', 'Bérénice', 'Pélagie', 'Nadège', 'Grâce', 'Mariette', 'Sègbè', 'Edwige', 'Clarisse', 'Romaine', 'Sandrine']
const M_NAMES = ['Kofi', 'Gildas', 'Euloge', 'Romaric', 'Arnaud', 'Ulrich', 'Basile', 'Didier', 'Sourou', 'Codjo', 'Ismaël', 'Florent', 'Hospice', 'Rodrigue', 'Landry', 'Serge', 'Wilfried', 'Josué', 'Mathias', 'Bienvenu', 'Fiacre', 'Aurel']
const LAST = ['Hounkpatin', 'Adéoti', 'Boni', 'Dossa', 'Houngbédji', 'Bio', 'Tossou', 'Ahouansou', 'Agbo', 'Sanni', 'Gbaguidi', 'Kpossou', 'Akakpo', 'Zannou', 'Assogba', 'Amoussou', 'Gnonlonfoun', 'Lokossou', 'Djossou', 'Adjovi', 'Hountondji', 'Fagla', 'Ahyi', 'Sossa', 'Vodounou', 'Orou', 'Yarou', 'Chabi', 'Sabi', 'Gounou']

const SITES = [
  { key: 'cotonou', name: 'Antenne ANTS Cotonou', city: 'Cotonou', zones: ['Cotonou', 'Abomey-Calavi', 'Sèmè-Podji', 'Ouidah'], donors: 260, langs: ['fr', 'fon', 'goun', 'yoruba'] },
  { key: 'portonovo', name: 'Antenne ANTS Porto-Novo', city: 'Porto-Novo', zones: ['Porto-Novo', 'Adjarra', 'Avrankou'], donors: 70, langs: ['fr', 'goun', 'yoruba'] },
  { key: 'parakou', name: 'Antenne ANTS Parakou', city: 'Parakou', zones: ['Parakou', 'Tchaourou', 'N’Dali'], donors: 60, langs: ['fr', 'bariba', 'dendi'] },
  { key: 'abomey', name: 'Antenne ANTS Abomey', city: 'Abomey', zones: ['Abomey', 'Bohicon', 'Djidja'], donors: 45, langs: ['fr', 'fon'] },
  { key: 'lokossa', name: 'Antenne ANTS Lokossa', city: 'Lokossa', zones: ['Lokossa', 'Comè', 'Athiémé'], donors: 35, langs: ['fr', 'fon'] },
  { key: 'natitingou', name: 'Antenne ANTS Natitingou', city: 'Natitingou', zones: ['Natitingou', 'Tanguiéta', 'Boukoumbé'], donors: 30, langs: ['fr', 'dendi'] },
]

// Stock de la veille par site (n = normal, b = bas, c = critique), dans l'ordre des groupes du pack.
const STOCK_YESTERDAY: Record<string, string> = {
  cotonou: 'ncnbnbnb', portonovo: 'nbnnbcnb', parakou: 'ncnbnbnb', abomey: 'nnnnbnnb', lokossa: 'nbnbnnbn', natitingou: 'bcnbbcnc',
}
const STOCK_TODAY: Record<string, string | null> = {
  cotonou: null, portonovo: 'nbnnbcnb', parakou: 'ncnbnbnn', abomey: 'nnnnbnnb', lokossa: 'nbnbnnbn', natitingou: null,
}
const LEVEL: Record<string, StockLevel> = { n: 'NORMAL', b: 'BAS', c: 'CRITIQUE' }

export async function seed() {
  seedState = 20261018
  const tz = pack.timezone
  const day = today(tz)
  const at = (d: string, h: number, m = 0) => new Date(d + 'T' + String(h - 1).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00Z') // heure locale UTC+1

  await prisma.$transaction([
    prisma.auditLog.deleteMany(), prisma.need.deleteMany(), prisma.callTask.deleteMany(), prisma.message.deleteMany(),
    prisma.appointment.deleteMany(), prisma.campaign.deleteMany(), prisma.collecte.deleteMany(), prisma.stockReading.deleteMany(),
    prisma.donation.deleteMany(), prisma.donor.deleteMany(), prisma.user.deleteMany(), prisma.organisation.deleteMany(), prisma.country.deleteMany(),
  ])

  await prisma.country.create({ data: { code: pack.code, name: pack.name } })

  // ----- organisations
  const ants = await prisma.organisation.create({ data: { countryCode: 'BJ', type: 'NATIONAL', name: 'ANTS — Siège', shortName: 'ANTS', city: 'Cotonou' } })
  const site: Record<string, string> = {}
  for (const s of SITES) {
    const o = await prisma.organisation.create({ data: { countryCode: 'BJ', type: 'SITE', name: s.name, city: s.city, zones: s.zones, parentId: ants.id } })
    site[s.key] = o.id
  }
  const cnhu = await prisma.organisation.create({ data: { countryCode: 'BJ', type: 'HOSPITAL', name: 'CNHU Hubert Koutoukou Maga', shortName: 'CNHU-HKM', city: 'Cotonou', parentId: site.cotonou } })
  const chumel = await prisma.organisation.create({ data: { countryCode: 'BJ', type: 'HOSPITAL', name: 'CHU de la Mère et de l’Enfant Lagune', shortName: 'CHU-MEL', city: 'Cotonou', parentId: site.cotonou } })
  await prisma.organisation.create({ data: { countryCode: 'BJ', type: 'HOSPITAL', name: 'CHD Borgou', shortName: 'CHD Borgou', city: 'Parakou', parentId: site.parakou } })

  // ----- utilisateurs de démonstration
  const users = [
    { name: 'Équipe Sang+', title: 'Super administrateur', email: 'admin@sang-plus.org', role: 'SUPER_ADMIN' as const, organisationId: null },
    { name: 'Dr Hortense Akplogan', title: 'Pilote national', email: 'h.akplogan@ants.bj', role: 'PILOTE' as const, organisationId: ants.id },
    { name: 'Afi Dossou', title: 'Responsable de site', email: 'afi.dossou@ants.bj', role: 'PILOTE' as const, organisationId: site.cotonou },
    { name: 'Gildas Bio', title: 'Responsable de site', email: 'g.bio@ants.bj', role: 'PILOTE' as const, organisationId: site.parakou },
    { name: 'Romuald Kiki', title: 'Opérateur de site', email: 'r.kiki@ants.bj', role: 'OPERATEUR' as const, organisationId: site.cotonou },
    { name: 'Dr Ismaël Bako', title: 'Pédiatrie', email: 'i.bako@cnhu.bj', role: 'DEMANDEUR' as const, organisationId: cnhu.id },
  ]
  for (const u of users) await prisma.user.create({ data: u })

  // ----- donneurs
  const phones = new Set<string>()
  const donorRows: Prisma.DonorCreateManyInput[] = []
  const nameSeen = new Set<string>()
  for (const s of SITES) {
    for (let i = 0; i < s.donors; i++) {
      const sex: Sex = rnd() < 0.42 ? 'F' : 'M'
      let first = '', last = ''
      for (let k = 0; k < 30; k++) { first = pick(sex === 'F' ? F_NAMES : M_NAMES); last = pick(LAST); if (!nameSeen.has(first + last)) break }
      nameSeen.add(first + last)
      let phone = ''
      do { phone = '+22901' + pick(['97', '96', '95', '91', '67', '66', '62', '61', '51']) + String(int(0, 999999)).padStart(6, '0') } while (phones.has(phone))
      phones.add(phone)
      const interval = pack.rules.minIntervalDays[sex]
      const u = rnd()
      const lastDays = u < 0.08 ? null
        : u < 0.2 ? interval + int(0, 6) // redevenus aptes cette semaine → rappels
        : u < 0.45 ? int(15, interval - 3) // pas encore aptes
        : int(interval + 7, 480)
      const zone = s.key === 'cotonou' ? wpick([['Cotonou', 50], ['Abomey-Calavi', 30], ['Sèmè-Podji', 10], ['Ouidah', 10]]) : pick(s.zones)
      const lastDay = lastDays == null ? null : addDays(day, -lastDays)
      donorRows.push({
        countryCode: 'BJ', siteId: site[s.key], firstName: first, lastName: last, phone,
        nationalId: rnd() < 0.62 ? String(int(1000000000, 9999999999)) : null,
        bloodGroup: wpick([['O+', 34], ['A+', 20], ['B+', 18], ['AB+', 5], ['O−', 12], ['A−', 5], ['B−', 5], ['AB−', 2]]),
        sex, birthYear: Number(day.slice(0, 4)) - int(19, 58), zone, lang: wpick(s.langs.map((l, k) => [l, k === 0 ? 3 : 2] as [string, number])),
        lastDonationAt: lastDay ? noonOf(lastDay) : null,
        donationCount: lastDay ? 1 + Math.floor(rnd() * rnd() * 16) : 0,
        deferredUntil: rnd() < 0.05 ? noonOf(addDays(day, int(10, 120))) : null,
        optOut: rnd() < 0.02,
      })
    }
  }
  await prisma.donor.createMany({ data: donorRows })
  const donors = await prisma.donor.findMany({ orderBy: { phone: 'asc' } })
  await prisma.donation.createMany({
    data: donors.filter((d) => d.lastDonationAt).map((d) => ({ donorId: d.id, siteId: d.siteId, date: d.lastDonationAt!, confirmedGroup: d.bloodGroup })),
  })

  // ----- stock
  for (const s of SITES) {
    const rows: Prisma.StockReadingCreateManyInput[] = G.map((g, i) => ({ siteId: site[s.key], day: addDays(day, -1), group: g, level: LEVEL[STOCK_YESTERDAY[s.key][i]] }))
    const t = STOCK_TODAY[s.key]
    if (t) rows.push(...G.map((g, i) => ({ siteId: site[s.key], day, group: g, level: LEVEL[t[i]] })))
    await prisma.stockReading.createMany({ data: rows })
  }

  // ----- collectes
  const mk = (siteKey: string, type: 'FIXE' | 'MOBILE', name: string, place: string, d: string, startH: number, slots: number) =>
    prisma.collecte.create({ data: { siteId: site[siteKey], type, name, place, day: d, startMinutes: startH * 60, slotCount: slots, slotMinutes: pack.rules.slotMinutes, slotCapacity: pack.rules.slotCapacity } })
  const stMichel = await mk('cotonou', 'MOBILE', 'Paroisse Saint-Michel', 'Cotonou, quartier Saint-Michel', day, 8, 10)
  const fixe = await mk('cotonou', 'FIXE', 'Antenne ANTS Cotonou', 'Avenue Jean-Paul II', addDays(day, 1), 8, 16)
  const uac = await mk('cotonou', 'MOBILE', 'Université d’Abomey-Calavi', 'Campus, amphi Idriss Déby', addDays(day, 6), 8, 14)
  const dantokpa = await mk('cotonou', 'MOBILE', 'Marché Dantokpa', 'Cotonou, entrée nord', addDays(day, 13), 9, 10)
  await mk('portonovo', 'FIXE', 'Antenne ANTS Porto-Novo', 'Quartier Ouando', addDays(day, 1), 8, 12)
  await mk('parakou', 'MOBILE', 'Université de Parakou', 'Campus principal', addDays(day, 4), 8, 12)
  await mk('abomey', 'FIXE', 'Antenne ANTS Abomey', 'Centre-ville', addDays(day, 2), 8, 10)

  const cot = donors.filter((d) => d.siteId === site.cotonou && !d.optOut)
  const used = new Set<string>()
  const take = (n: number, f: (d: (typeof cot)[number]) => boolean) => {
    const out = cot.filter((d) => !used.has(d.id) && f(d)).slice(0, n)
    out.forEach((d) => used.add(d.id))
    return out
  }
  const eligibleNow = (d: (typeof cot)[number]) => !d.deferredUntil && (!d.lastDonationAt || addDays(d.lastDonationAt.toISOString().slice(0, 10), pack.rules.minIntervalDays[d.sex]) <= day)
  const appts: Prisma.AppointmentCreateManyInput[] = []
  const fillCollecte = (c: { id: string; slotCount: number }, n: number, zone?: string) =>
    take(n, (d) => eligibleNow(d) && (!zone || d.zone === zone)).forEach((d, i) =>
      appts.push({ collecteId: c.id, donorId: d.id, slotIndex: Math.min(c.slotCount - 1, Math.floor(i / 2)), source: i % 3 ? 'SMS' : 'APPEL' }))
  fillCollecte(stMichel, 14, 'Cotonou')
  fillCollecte(fixe, 12)
  fillCollecte(uac, 38)
  fillCollecte(dantokpa, 9)
  await prisma.appointment.createMany({ data: appts })

  // ----- campagnes passées (alerte B− il y a 2 jours, rappels d'hier) et liste d'appel
  const fill = (tpl: string, v: Record<string, string>) => tpl.replace(/\{([^}]+)\}/g, (m, k: string) => v[k] ?? m)
  const twoDays = addDays(day, -2), yesterday = addDays(day, -1)
  const alertB = await prisma.campaign.create({ data: { siteId: site.cotonou, type: 'ALERTE', bloodGroup: 'B−', zone: 'Cotonou', collecteId: stMichel.id, sent: 0, escalated: true, createdAt: at(twoDays, 10, 5) } })
  const rappel = await prisma.campaign.create({ data: { siteId: site.cotonou, type: 'RAPPEL', collecteId: stMichel.id, sent: 0, escalated: true, createdAt: at(yesterday, 9) } })

  const msgs: Prisma.MessageCreateManyInput[] = []
  const tasks: Prisma.CallTaskCreateManyInput[] = []
  const runPast = (campaign: { id: string; createdAt: Date }, kind: 'alerte' | 'rappel', list: typeof cot, replies: number, reasonTxt: string) => {
    list.forEach((d, i) => {
      msgs.push({ donorId: d.id, campaignId: campaign.id, direction: 'OUT', kind, status: 'LIVRE', createdAt: campaign.createdAt,
        body: fill(pack.templates[kind].fr, { 'prénom': d.firstName, groupe: d.bloodGroup, collecte: stMichel.name, date: 'aujourd’hui' }) })
      if (i < replies) msgs.push({ donorId: d.id, direction: 'IN', kind: 'reponse', body: '1', status: 'RECU', createdAt: new Date(+campaign.createdAt + (20 + i * 7) * 60000) })
      else tasks.push({ donorId: d.id, siteId: site.cotonou, campaignId: campaign.id, reason: reasonTxt, createdAt: new Date(+campaign.createdAt + 3 * 3600000) })
    })
  }
  const bList = take(9, (d) => d.bloodGroup === 'B−' || d.bloodGroup === 'B+')
  runPast(alertB, 'alerte', bList, 3, 'Alerte B− · SMS sans réponse')
  const rList = take(12, (d) => eligibleNow(d) && !!d.lastDonationAt)
  runPast(rappel, 'rappel', rList, 4, 'Rappel d’aptitude · SMS sans réponse')
  await prisma.message.createMany({ data: msgs })
  await prisma.callTask.createMany({ data: tasks })
  await prisma.campaign.update({ where: { id: alertB.id }, data: { sent: bList.length } })
  await prisma.campaign.update({ where: { id: rappel.id }, data: { sent: rList.length } })

  // ----- besoins des établissements
  await prisma.need.create({ data: { hospitalId: chumel.id, siteId: site.cotonou, service: 'Maternité', bloodGroup: 'O−', quantity: 4, urgency: 'Vitale', status: 'TRANSMIS', createdAt: at(day, 7, 40) } })
  await prisma.need.create({ data: { hospitalId: cnhu.id, siteId: site.cotonou, service: 'Pédiatrie', bloodGroup: 'B−', quantity: 2, urgency: 'Urgente', status: 'ALERTE', campaignId: alertB.id, createdAt: at(twoDays, 9, 10) } })

  await prisma.auditLog.create({ data: { action: 'demo.initialisation', entity: 'Country', entityId: 'BJ', details: { donors: donors.length } } })
  return { donors: donors.length, appointments: appts.length }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then((r) => console.log('Données de démonstration créées :', r))
    .catch((e) => { console.error(e); process.exitCode = 1 })
    .finally(() => prisma.$disconnect())
}
