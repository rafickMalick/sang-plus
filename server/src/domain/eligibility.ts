import type { Donor } from '@prisma/client'
import type { Rules } from '../pack.js'
import { addDays, dayOf, fmtDay } from '../time.js'

export type EligibilityKind = 'apte' | 'attente' | 'ajourne' | 'age' | 'stop'
export type Eligibility = { apte: boolean; kind: EligibilityKind; label: string; nextDay: string | null }

type DonorLike = Pick<Donor, 'sex' | 'birthYear' | 'lastDonationAt' | 'deferredUntil' | 'optOut'>

// Aptitude calculée uniquement à partir des règles du pack : aucune donnée médicale.
export function eligibility(d: DonorLike, rules: Rules, today: string, tz: string): Eligibility {
  if (d.optOut) return { apte: false, kind: 'stop', label: 'Désinscrit (STOP)', nextDay: null }
  if (d.deferredUntil) {
    const until = dayOf(d.deferredUntil, tz)
    if (until > today) return { apte: false, kind: 'ajourne', label: 'Ajourné jusqu’au ' + fmtDay(until), nextDay: until }
  }
  if (d.birthYear) {
    const age = Number(today.slice(0, 4)) - d.birthYear
    if (age < rules.ageMin || age > rules.ageMax) return { apte: false, kind: 'age', label: 'Hors tranche d’âge', nextDay: null }
  }
  if (!d.lastDonationAt) return { apte: true, kind: 'apte', label: 'Apte', nextDay: null }
  const next = addDays(dayOf(d.lastDonationAt, tz), rules.minIntervalDays[d.sex])
  if (next > today) return { apte: false, kind: 'attente', label: 'Apte le ' + fmtDay(next), nextDay: next }
  return { apte: true, kind: 'apte', label: 'Apte', nextDay: next }
}
