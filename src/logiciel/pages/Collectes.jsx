import { useState } from 'react'
import { s } from '../../style.js'
import { api, qs } from '../api.js'
import { fmtDay, sty } from '../format.js'
import { useLoad } from '../useLoad.js'
import { CAPTION, CARD, Empty, INPUT, Loading, Stepper, Toggle } from '../ui.jsx'

const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0) }

export default function Collectes({ app }) {
  const { data, error, reload } = useLoad('/collectes' + qs({ siteId: app.siteId }))
  const [sel, setSel] = useState(null)
  const [form, setForm] = useState(null)
  if (!data) return <Loading error={error} />
  const cur = data.find((c) => c.id === sel) ?? data[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const create = async () => {
    try {
      const c = await api.post('/collectes', { siteId: app.siteId, type: form.type, name: form.name, place: form.place, day: form.day, startMinutes: toMinutes(form.start), slotCount: form.n })
      app.flash('Collecte créée · les rappels et alertes proposeront ses créneaux')
      setForm(null); setSel(c.id); reload()
    } catch (e) { app.flash(e.message) }
  }

  return (
    <div className="g-split" style={s("display:grid; grid-template-columns:360px minmax(0,1fr); gap:18px; align-items:start")}>
      <div style={s("display:flex; flex-direction:column; gap:10px")}>
        <button onClick={() => setForm(form ? null : { type: 'MOBILE', name: '', place: '', day: tomorrow, start: '08:00', n: 10 })} style={s("background:#431420; color:#f8ddcb; border:none; padding:12px 0; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer")}>{form ? 'Fermer' : '+ Nouvelle collecte'}</button>
        {form && (
          <div style={s(`${CARD}; padding:16px; display:flex; flex-direction:column; gap:12px; animation:floatin .3s ease`)}>
            <div style={s("display:flex; gap:6px")}>
              {[['MOBILE', 'Mobile'], ['FIXE', 'Fixe']].map(([t, l]) => (
                <Toggle key={t} p={sty(form.type === t)} onClick={() => setForm({ ...form, type: t })} css="flex:1; border-radius:6px; padding:8px; font:600 13px 'Public Sans',sans-serif">{l}</Toggle>
              ))}
            </div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom (ex. Lycée Coulibaly)" style={s(INPUT)} />
            <input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Lieu précis (facultatif)" style={s(INPUT)} />
            <div style={s("display:flex; gap:8px")}>
              <input type="date" value={form.day} min={tomorrow} onChange={(e) => setForm({ ...form, day: e.target.value })} style={s(`${INPUT}; flex:1; min-width:0`)} />
              <input type="time" value={form.start} step="1800" onChange={(e) => setForm({ ...form, start: e.target.value })} style={s(`${INPUT}; width:110px`)} />
            </div>
            <div style={s("display:flex; align-items:center; gap:10px; font:500 13px 'Public Sans',sans-serif; color:#5c4048")}>
              <span style={s("flex:1")}>Créneaux de {app.me.country.rules.slotMinutes} min · {app.me.country.rules.slotCapacity} places</span>
              <Stepper value={form.n} onDown={() => setForm({ ...form, n: Math.max(2, form.n - 1) })} onUp={() => setForm({ ...form, n: Math.min(24, form.n + 1) })} valueCss="font:700 14px 'Public Sans',sans-serif; color:#2b0d15; min-width:20px; text-align:center" />
            </div>
            <button disabled={form.name.trim().length < 2} onClick={create} style={s(`background:${form.name.trim().length < 2 ? '#d8c3b5' : '#c8102e'}; color:#fff; border:none; padding:11px 0; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer`)}>Créer la collecte</button>
          </div>
        )}
        {data.length === 0 && <Empty>Aucune collecte programmée.</Empty>}
        {data.map((c) => {
          const a = c.id === cur?.id, mob = c.type === 'MOBILE'
          return (
            <div key={c.id} onClick={() => setSel(c.id)} style={s(`background:${a ? '#fbf3ee' : '#fff'}; border:1.5px solid ${a ? '#c8102e' : '#f0e4da'}; border-radius:10px; padding:14px 16px; cursor:pointer; display:flex; flex-direction:column; gap:6px`)}>
              <div style={s("display:flex; align-items:center; gap:8px")}>
                <span style={s(`font:600 11px 'Public Sans',sans-serif; padding:3px 9px; border-radius:999px; background:${mob ? '#fdf1dc' : '#f2e8e0'}; color:${mob ? '#9a6a1e' : '#5c4048'}`)}>{mob ? 'Mobile' : 'Fixe'}</span>
                <span style={s("margin-left:auto; font:500 12px 'Public Sans',sans-serif; color:#5c4048; white-space:nowrap")}>{c.booked} / {c.capacity}</span>
              </div>
              <div style={s("font:600 15px 'Public Sans',sans-serif; color:#2b0d15")}>{c.name}</div>
              <div style={s("font:400 12.5px 'Public Sans',sans-serif; color:#8a6f76; text-transform:capitalize")}>{c.dayLabel} · {c.hours}</div>
            </div>
          )
        })}
      </div>

      {cur && (
        <div style={s(`${CARD}; padding:22px; display:flex; flex-direction:column; gap:18px; min-width:0`)}>
          <div>
            <div style={s("font:600 24px/1.2 'Newsreader',serif; color:#2b0d15")}>{cur.name}</div>
            <div style={s("font:400 13.5px 'Public Sans',sans-serif; color:#8a6f76; margin-top:4px")}>{cur.type === 'MOBILE' ? 'Collecte mobile' : 'Site fixe'} · {cur.place} · {fmtDay(cur.day, { weekday: true })} · {cur.hours}</div>
          </div>
          <div style={s("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px")}>
            {[[cur.booked, 'rendez-vous pris'], [cur.capacity - cur.booked, 'places libres'], [Math.round((cur.booked / cur.capacity) * 100) + ' %', 'taux de remplissage']].map(([v, l]) => (
              <div key={l} style={s("background:#faf4ee; border-radius:8px; padding:12px")}>
                <div style={s("font:600 24px 'Newsreader',serif; color:#2b0d15")}>{v}</div>
                <div style={s("font:400 12px 'Public Sans',sans-serif; color:#5c4048")}>{l}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={s(`${CAPTION}; margin-bottom:10px`)}>Créneaux</div>
            <div style={s("display:grid; grid-template-columns:repeat(auto-fill,minmax(112px,1fr)); gap:8px")}>
              {cur.slots.map((sl) => {
                const full = sl.booked >= sl.capacity
                return (
                  <div key={sl.index} style={s(`border:1px solid #f0e4da; border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:6px; background:${full ? '#fbf3ee' : '#fff'}; opacity:${sl.past ? 0.5 : 1}`)}>
                    <div style={s("display:flex; justify-content:space-between")}>
                      <span style={s("font:700 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{sl.time}</span>
                      <span style={s("font:500 12px 'Public Sans',sans-serif; color:#5c4048")}>{sl.booked}/{sl.capacity}</span>
                    </div>
                    <div style={s("height:5px; background:#f2e8e0; border-radius:999px; overflow:hidden")}>
                      <div style={s(`height:100%; width:${Math.round((sl.booked / sl.capacity) * 100)}%; background:${full ? '#c8102e' : '#e0a64a'}`)}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={s("font:400 12.5px/1.6 'Public Sans',sans-serif; color:#8a6f76; border-top:1px solid #f0e4da; padding-top:14px")}>Le donneur répond « 1 » au SMS pour réserver le premier créneau libre et reçoit une confirmation immédiate. Les créneaux passés ne sont plus proposés.</div>
        </div>
      )}
    </div>
  )
}
