// Dates exprimées dans le fuseau du pays : un « jour » est une chaîne AAAA-MM-JJ.

export function dayOf(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}
export const today = (tz: string) => dayOf(new Date(), tz)

export function addDays(day: string, n: number): string {
  const d = new Date(day + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 86400000)
}

// Instant correspondant à midi (heure du pays) d'un jour donné — suffisant pour stocker des dates de don.
export const noonOf = (day: string) => new Date(day + 'T12:00:00Z')

export function minutesIn(tz: string, date = new Date()): number {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(date).split(':').map(Number)
  return (h % 24) * 60 + m
}

export function hourIn(tz: string, date = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(date))
}

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
export function fmtDay(day: string, withWeekday = false): string {
  const d = new Date(day + 'T12:00:00Z')
  const s = d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]
  return withWeekday ? DAYS[d.getUTCDay()] + ' ' + s : s
}
const MONTHS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
// Forme longue pour les SMS (« mercredi 28 octobre »).
export function fmtDayLong(day: string): string {
  const d = new Date(day + 'T12:00:00Z')
  return DAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS_LONG[d.getUTCMonth()]
}
export const fmtMinutes = (m: number) => Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0')
