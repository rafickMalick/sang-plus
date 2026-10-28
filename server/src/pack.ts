// Pack pays : tout ce qui est propre à un pays (libellés, formats, langues, règles, modèles).
// Les valeurs éditées dans l'application (table Country) surchargent celles du pack.
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { prisma } from './db.js'

export type Rules = {
  minIntervalDays: { M: number; F: number }
  ageMin: number
  ageMax: number
  monthlyContactCap: number
  reminderHour: number
  reminderWindowDays: number
  escalateAfterMinutes: number
  slotMinutes: number
  slotCapacity: number
}
export type TemplateKind = 'rappel' | 'alerte' | 'rdv' | 'stop'
export type Pack = {
  code: string
  name: string
  locale: string
  timezone: string
  currency: { code: string; label: string }
  phone: { prefix: string; example: string; pattern: string }
  nationalId: { label: string; hint: string; pattern: string; required: boolean }
  labels: Record<'national' | 'nationalLong' | 'site' | 'hospital' | 'zone', string>
  bloodGroups: string[]
  languages: { code: string; label: string }[]
  templates: Record<TemplateKind, Record<string, string>>
  templatesNote: string
  rules: Rules
  rulesNote: string
  sms: { bookKeyword: string; stopKeyword: string }
}

const dir = fileURLToPath(new URL('../packs/', import.meta.url))
export const PACKS: Record<string, Pack> = Object.fromEntries(
  readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => {
    const p = JSON.parse(readFileSync(dir + f, 'utf8')) as Pack
    return [p.code, p]
  })
)

// Pack effectif = pack fichier + surcharges enregistrées en base.
export async function countryConfig(code: string): Promise<Pack> {
  const base = PACKS[code]
  if (!base) throw new Error('Pack pays inconnu : ' + code)
  const row = await prisma.country.findUnique({ where: { code } })
  const rules = { ...base.rules, ...((row?.rules as Partial<Rules>) ?? {}) }
  rules.minIntervalDays = { ...base.rules.minIntervalDays, ...((row?.rules as Partial<Rules>)?.minIntervalDays ?? {}) }
  const over = (row?.templates as Partial<Record<TemplateKind, Record<string, string>>>) ?? {}
  const templates = Object.fromEntries(
    (Object.keys(base.templates) as TemplateKind[]).map((k) => [k, { ...base.templates[k], ...(over[k] ?? {}) }])
  ) as Pack['templates']
  return { ...base, rules, templates }
}
