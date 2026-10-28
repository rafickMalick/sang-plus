// Tâches planifiées : rappels quotidiens à l'heure locale et bascule des SMS sans réponse.
import { prisma } from './db.js'
import { escalate, runReminders } from './domain/campaigns.js'
import { countryConfig, PACKS } from './pack.js'
import { hourIn, today as todayIn } from './time.js'

async function tick() {
  for (const code of Object.keys(PACKS)) {
    const country = await countryConfig(code)
    const limit = new Date(Date.now() - country.rules.escalateAfterMinutes * 60000)
    const due = await prisma.campaign.findMany({ where: { escalated: false, createdAt: { lte: limit }, site: { countryCode: code } }, select: { id: true } })
    for (const c of due) await escalate(c.id)

    const day = todayIn(country.timezone)
    if (hourIn(country.timezone) >= country.rules.reminderHour) {
      const doneToday = await prisma.campaign.count({ where: { type: 'RAPPEL', site: { countryCode: code }, createdAt: { gte: new Date(day + 'T00:00:00Z') } } })
      if (!doneToday) await runReminders(code)
    }
  }
}

export function startJobs(log: (msg: string) => void) {
  const run = () => tick().catch((e) => log('Tâche planifiée en erreur : ' + e.message))
  setTimeout(run, 5000)
  return setInterval(run, 30000)
}
