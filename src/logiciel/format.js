// Mise en forme et palettes partagées par les écrans du logiciel.
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']

export function fmtDay(day, { year = false, weekday = false } = {}) {
  if (!day) return '—'
  const d = new Date(String(day).slice(0, 10) + 'T12:00:00Z')
  return (weekday ? DAYS[d.getUTCDay()] + ' ' : '') + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + (year ? ' ' + d.getUTCFullYear() : '')
}
export function fmtAt(iso) {
  const d = new Date(iso)
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const sameDay = d.toDateString() === new Date().toDateString()
  return sameDay ? 'Aujourd’hui · ' + time : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' · ' + time
}
export const fmtPhone = (p) => (p || '').replace(/^(\+\d{3})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5 $6')

export const P = {
  on: { bg: '#431420', fg: '#f8ddcb', bd: '#431420' },
  off: { bg: '#ffffff', fg: '#431420', bd: '#e4d4c8' },
  rOn: { bg: '#c8102e', fg: '#fff', bd: '#c8102e' },
  rOff: { bg: '#fff', fg: '#c8102e', bd: '#f0d4d9' },
  green: { bg: '#3d8a5f', fg: '#fff', bd: '#3d8a5f' },
}
export const sty = (a) => (a ? P.on : P.off)
export const rsty = (a) => (a ? P.rOn : P.rOff)

export const LEVELS = {
  NORMAL: { bg: '#e7f2ea', fg: '#2f6e4b', dot: '#3d8a5f', label: 'Normal' },
  BAS: { bg: '#fdf1dc', fg: '#9a6a1e', dot: '#e0a64a', label: 'Bas' },
  CRITIQUE: { bg: '#fbe9ec', fg: '#a8283a', dot: '#c8102e', label: 'Critique' },
}
export const ELIG = {
  apte: ['#e7f2ea', '#2f6e4b'], attente: ['#fdf1dc', '#9a6a1e'], ajourne: ['#f2e8e0', '#5c4048'], age: ['#f2e8e0', '#5c4048'], stop: ['#f2e8e0', '#8a6f76'],
}
export const TONE = { ok: '#3d8a5f', warn: '#c98a2b', red: '#c8102e', muted: '#b09aa0' }
export const ROLE_LABEL = { SUPER_ADMIN: 'Super admin', PILOTE: 'Pilote', OPERATEUR: 'Opérateur de site', DEMANDEUR: 'Demandeur' }
export const ORG_LABEL = { NATIONAL: 'Service national', REGIONAL: 'Région', SITE: 'Site de collecte', HOSPITAL: 'Établissement' }
export const ini = (n) => n.replace(/^Dr\.? /, '').split(' ').map((w) => w[0]).join('').slice(0, 2)
