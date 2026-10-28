import { useState } from 'react'
import { s } from '../../style.js'
import { api } from '../api.js'
import { BTN_DARK, CARD, Stepper } from '../ui.jsx'

const TPLS = [['rappel', 'Rappel d’aptitude'], ['alerte', 'Alerte ciblée'], ['rdv', 'Confirmation de rendez-vous'], ['stop', 'Confirmation de désinscription (STOP)']]
const VALUE = "font:600 30px 'Newsreader',serif; color:#2b0d15; min-width:60px; text-align:center"

function Rule({ title, note, value, unit, onDown, onUp }) {
  return (
    <div style={s(`${CARD}; padding:20px 22px; display:flex; flex-direction:column; gap:10px`)}>
      <div style={s("font:600 15px 'Public Sans',sans-serif; color:#2b0d15")}>{title}</div>
      <div style={s("font:400 12.5px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>{note}</div>
      <div style={s("display:flex; align-items:center; gap:12px")}>
        <Stepper size={38} value={value} onDown={onDown} onUp={onUp} valueCss={VALUE} />
        <span style={s("font:500 14px 'Public Sans',sans-serif; color:#5c4048")}>{unit}</span>
      </div>
    </div>
  )
}

export default function Regles({ app }) {
  const c = app.me.country
  const [rules, setRules] = useState(c.rules)
  const [tpl, setTpl] = useState(Object.fromEntries(TPLS.map(([k]) => [k, c.templates[k]?.fr ?? ''])))
  const [saved, setSaved] = useState(true)
  const set = (p) => { setRules({ ...rules, ...p }); setSaved(false) }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

  const save = async () => {
    try {
      await api.put('/country', {
        rules: { minIntervalDays: rules.minIntervalDays, monthlyContactCap: rules.monthlyContactCap, reminderHour: rules.reminderHour, escalateAfterMinutes: rules.escalateAfterMinutes },
        templates: Object.fromEntries(Object.entries(tpl).map(([k, v]) => [k, { fr: v }])),
      })
      setSaved(true)
      app.refreshMe()
      app.flash('Règles publiées sur les ' + app.me.sites.length + ' sites · aptitudes recalculées')
    } catch (e) { app.flash(e.message) }
  }

  return (
    <div style={s("display:flex; flex-direction:column; gap:18px; max-width:1040px")}>
      <div style={s("background:#fdf1dc; color:#7a5414; border-radius:10px; padding:12px 16px; font:500 13px/1.5 'Public Sans',sans-serif")}>{c.rulesNote}</div>
      <div className="g-2" style={s("display:grid; grid-template-columns:1fr 1fr; gap:18px")}>
        <Rule title="Intervalle entre deux dons · hommes" note="Sert au calcul quotidien de l'aptitude et des rappels." value={rules.minIntervalDays.M} unit="jours"
          onDown={() => set({ minIntervalDays: { ...rules.minIntervalDays, M: clamp(rules.minIntervalDays.M - 7, 28, 365) } })} onUp={() => set({ minIntervalDays: { ...rules.minIntervalDays, M: clamp(rules.minIntervalDays.M + 7, 28, 365) } })} />
        <Rule title="Intervalle entre deux dons · femmes" note="Sert au calcul quotidien de l'aptitude et des rappels." value={rules.minIntervalDays.F} unit="jours"
          onDown={() => set({ minIntervalDays: { ...rules.minIntervalDays, F: clamp(rules.minIntervalDays.F - 7, 28, 365) } })} onUp={() => set({ minIntervalDays: { ...rules.minIntervalDays, F: clamp(rules.minIntervalDays.F + 7, 28, 365) } })} />
        <Rule title="Plafond de sollicitations" note="SMS et appels confondus, par donneur et par mois." value={rules.monthlyContactCap} unit="par mois"
          onDown={() => set({ monthlyContactCap: clamp(rules.monthlyContactCap - 1, 1, 10) })} onUp={() => set({ monthlyContactCap: clamp(rules.monthlyContactCap + 1, 1, 10) })} />
        <Rule title="Heure d'envoi des rappels" note="Heure locale ; les rappels partent même si personne n'est connecté." value={rules.reminderHour + ' h'} unit=""
          onDown={() => set({ reminderHour: clamp(rules.reminderHour - 1, 6, 20) })} onUp={() => set({ reminderHour: clamp(rules.reminderHour + 1, 6, 20) })} />
        <Rule title="Délai avant liste d'appel" note="Sans réponse au SMS passé ce délai, le donneur est confié aux opérateurs." value={rules.escalateAfterMinutes} unit="minutes"
          onDown={() => set({ escalateAfterMinutes: clamp(rules.escalateAfterMinutes - (rules.escalateAfterMinutes > 60 ? 60 : 1), 1, 4320) })} onUp={() => set({ escalateAfterMinutes: clamp(rules.escalateAfterMinutes + (rules.escalateAfterMinutes >= 60 ? 60 : 1), 1, 4320) })} />
      </div>
      <div style={s(`${CARD}; padding:20px 22px; display:flex; flex-direction:column; gap:16px`)}>
        <div style={s("font:600 15px 'Public Sans',sans-serif; color:#2b0d15")}>Modèles de SMS · français</div>
        <div style={s("font:400 12.5px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>{c.templatesNote}</div>
        {TPLS.map(([k, l]) => (
          <label key={k} style={s("display:flex; flex-direction:column; gap:6px; font:600 12.5px 'Public Sans',sans-serif; color:#431420")}>{l}
            <textarea value={tpl[k]} onChange={(e) => { setTpl({ ...tpl, [k]: e.target.value }); setSaved(false) }} style={s("min-height:64px; border:1px solid #e4d4c8; border-radius:8px; padding:11px 12px; font:400 13.5px/1.55 'Public Sans',sans-serif; color:#2b0d15; background:#faf4ee; resize:vertical; outline:none")} />
            <span style={s(`font:400 11.5px 'Public Sans',sans-serif; color:${tpl[k].length > 160 ? '#9a6a1e' : '#8a6f76'}`)}>{tpl[k].length} caractères · {Math.max(1, Math.ceil(tpl[k].length / 160))} SMS · variables {'{prénom} {collecte} {date} {heure} {groupe}'}</span>
          </label>
        ))}
      </div>
      <div style={s("display:flex; align-items:center; gap:14px; flex-wrap:wrap")}>
        <span style={s("flex:1; min-width:220px; font:400 13px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>Les règles s'appliquent à tous les sites du pays. Le registre et les alertes se recalculent immédiatement.</span>
        <button onClick={save} style={s(BTN_DARK)}>{saved ? 'Publié ✓' : 'Publier sur les ' + app.me.sites.length + ' sites'}</button>
      </div>
    </div>
  )
}
