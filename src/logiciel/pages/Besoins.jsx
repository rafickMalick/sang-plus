import { useState } from 'react'
import { s } from '../../style.js'
import { api } from '../api.js'
import { fmtAt, rsty, sty } from '../format.js'
import { useLoad } from '../useLoad.js'
import { CARD, Empty, Loading, Stepper, Toggle } from '../ui.jsx'

const URGS = [['Vitale', 'sous 6 h'], ['Urgente', 'sous 24 h'], ['Programmée', 'sous 72 h']]
const FIELD = "font:600 12.5px 'Public Sans',sans-serif; color:#431420"

export default function Besoins({ app }) {
  const { data, error, reload } = useLoad('/needs', { poll: 8000 })
  const [f, setF] = useState({ service: '', bloodGroup: 'O+', quantity: 2, urgency: 'Urgente' })
  const site = app.me.sites[0]
  const submit = async () => {
    try {
      await api.post('/needs', f)
      app.flash('Besoin transmis à ' + site.name)
      reload()
    } catch (e) { app.flash(e.message) }
  }
  const ok = f.service.trim().length >= 2

  return (
    <div className="g-split" style={s("display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:18px; align-items:start")}>
      <div style={s(`${CARD}; padding:22px; display:flex; flex-direction:column; gap:18px`)}>
        <div style={s("font:600 22px 'Newsreader',serif; color:#2b0d15")}>Signaler un besoin</div>
        <label style={s(`display:flex; flex-direction:column; gap:6px; ${FIELD}`)}>Service
          <input value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} placeholder="ex. Pédiatrie, Maternité, Urgences" style={s("border:1px solid #e4d4c8; border-radius:6px; padding:11px 12px; font:400 14px 'Public Sans',sans-serif; color:#2b0d15; background:#faf4ee; outline:none")} />
        </label>
        <div style={s("display:flex; flex-direction:column; gap:8px")}>
          <span style={s(FIELD)}>Groupe sanguin</span>
          <div style={s("display:flex; gap:6px; flex-wrap:wrap")}>
            {app.me.country.bloodGroups.map((g) => (
              <Toggle key={g} bw={1.5} p={rsty(g === f.bloodGroup)} onClick={() => setF({ ...f, bloodGroup: g })} css="border-radius:6px; padding:8px 12px; font:700 13.5px 'Public Sans',sans-serif; min-width:52px">{g}</Toggle>
            ))}
          </div>
        </div>
        <div style={s("display:flex; align-items:center; gap:12px")}>
          <span style={s(`flex:1; ${FIELD}`)}>Nombre de poches</span>
          <Stepper size={36} value={f.quantity} onDown={() => setF({ ...f, quantity: Math.max(1, f.quantity - 1) })} onUp={() => setF({ ...f, quantity: Math.min(50, f.quantity + 1) })} valueCss="font:600 24px 'Newsreader',serif; color:#2b0d15; min-width:30px; text-align:center" />
        </div>
        <div style={s("display:flex; flex-direction:column; gap:8px")}>
          <span style={s(FIELD)}>Urgence</span>
          <div style={s("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px")}>
            {URGS.map(([u, sub]) => (
              <Toggle key={u} bw={1.5} p={sty(u === f.urgency)} onClick={() => setF({ ...f, urgency: u })} css="border-radius:8px; padding:10px; text-align:left">
                <span style={s("display:block; font:600 13.5px 'Public Sans',sans-serif")}>{u}</span>
                <span style={s("display:block; font:400 11.5px 'Public Sans',sans-serif; opacity:.8")}>{sub}</span>
              </Toggle>
            ))}
          </div>
        </div>
        <button disabled={!ok} onClick={submit} style={s(`background:${ok ? '#c8102e' : '#d8c3b5'}; color:#fff; border:none; padding:14px 0; border-radius:6px; font:600 14.5px 'Public Sans',sans-serif; cursor:pointer`)}>Transmettre à {site?.name}</button>
        <div style={s("font:400 12px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>Aucune information sur le patient n'est demandée.</div>
      </div>

      <div style={s("display:flex; flex-direction:column; gap:12px")}>
        <div style={s("font:600 16px 'Public Sans',sans-serif; color:#2b0d15")}>Mes signalements</div>
        {!data && <Loading error={error} />}
        {data?.length === 0 && <Empty>Aucun signalement pour l'instant.</Empty>}
        {data?.map((b) => {
          const done = b.status !== 'TRANSMIS'
          return (
            <div key={b.id} style={s(`${CARD}; padding:16px 18px; display:flex; flex-direction:column; gap:12px; animation:floatin .3s ease`)}>
              <div style={s("display:flex; align-items:center; gap:12px")}>
                <span style={s("font:700 15px 'Public Sans',sans-serif; color:#c8102e; background:#fbe9ec; padding:8px 10px; border-radius:6px")}>{b.bloodGroup}</span>
                <div style={s("flex:1; min-width:0")}>
                  <div style={s("font:600 14px 'Public Sans',sans-serif; color:#2b0d15")}>{b.quantity} poches · {b.urgency}</div>
                  <div style={s("font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>{b.service} · {fmtAt(b.createdAt)}</div>
                </div>
              </div>
              <div style={s("display:flex; flex-direction:column; gap:8px; border-top:1px solid #f7efe8; padding-top:12px")}>
                <div style={s("display:flex; gap:10px; align-items:center; font:500 13px 'Public Sans',sans-serif; color:#2b0d15")}><span style={s("width:8px; height:8px; border-radius:50%; background:#3d8a5f")}></span>Transmis à {b.site}</div>
                <div style={s(`display:flex; gap:10px; align-items:center; font:500 13px 'Public Sans',sans-serif; color:${done ? '#2b0d15' : '#8a6f76'}`)}>
                  <span style={s(`width:8px; height:8px; border-radius:50%; background:${done ? '#3d8a5f' : '#d8c3b5'}`)}></span>
                  {done ? 'Alerte lancée · ' + b.solicited + ' donneurs ' + b.bloodGroup + ' sollicités' : 'En attente d’une alerte du site'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
