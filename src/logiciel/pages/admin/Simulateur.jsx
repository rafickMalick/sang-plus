import { useState } from 'react'
import { s } from '../../../style.js'
import { api } from '../../api.js'
import { fmtAt, fmtPhone } from '../../format.js'
import { useLoad } from '../../useLoad.js'
import { CARD, Empty, Loading, Pill, ellipsis } from '../../ui.jsx'

const OUTCOME = { rdv: (r) => 'Créneau réservé · ' + r.collecte + ' à ' + r.heure, desinscrit: () => 'Donneur désinscrit', complet: () => 'Plus de créneau libre', libre: () => 'Réponse enregistrée', inconnu: () => 'Numéro inconnu' }
const KIND = { alerte: 'Alerte', rappel: 'Rappel', rdv: 'Confirmation RDV', stop: 'Désinscription', reponse: 'Réponse' }

// Simule le téléphone des donneurs : on voit les SMS partis et on peut répondre à leur place.
export default function Simulateur({ app }) {
  const { data, error, reload } = useLoad('/admin/messages', { poll: 3000 })
  const [busy, setBusy] = useState(null)
  if (!data) return <Loading error={error} />
  const kw = app.me.country.sms

  const reply = async (m, text) => {
    setBusy(m.id)
    try { const r = await api.post('/admin/simulator/reply', { donorId: m.donor.id, text }); app.flash(m.donor.name + ' : ' + OUTCOME[r.outcome](r)); reload() } catch (e) { app.flash(e.message) } finally { setBusy(null) }
  }

  return (
    <div style={s("display:flex; flex-direction:column; gap:14px; max-width:980px")}>
      <div style={s("background:#fdf1dc; color:#7a5414; border-radius:10px; padding:12px 16px; font:500 13px/1.5 'Public Sans',sans-serif")}>
        Passerelle de démonstration : aucun SMS ne part réellement. Répondez à la place d'un donneur : « {kw.bookKeyword} » réserve le premier créneau libre, « {kw.stopKeyword} » le désinscrit. En production, ces réponses arrivent par le webhook de l'opérateur SMS.
      </div>
      <div style={s(`${CARD}; padding:6px 0`)}>
        {data.length === 0 && <Empty>Aucun message pour l'instant. Lancez une alerte ou les rappels du jour.</Empty>}
        {data.map((m) => {
          const out = m.direction === 'OUT'
          const canReply = out && (m.kind === 'alerte' || m.kind === 'rappel') && !m.donor.optOut
          return (
            <div key={m.id} style={s("display:grid; grid-template-columns:200px minmax(0,1fr) auto; gap:14px; align-items:center; padding:12px 18px; border-bottom:1px solid #f7efe8")}>
              <div style={s("min-width:0")}>
                <div style={s(`font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15; ${ellipsis}`)}>{m.donor.name}</div>
                <div style={s(`font:400 12px 'Public Sans',sans-serif; color:#8a6f76; ${ellipsis}`)}>{fmtPhone(m.donor.phone)} · {m.donor.site.replace('Antenne ANTS ', '')}</div>
              </div>
              <div style={s(`display:flex; flex-direction:column; align-items:${out ? 'flex-start' : 'flex-end'}; gap:4px; min-width:0`)}>
                <div style={s(`max-width:100%; background:${out ? '#431420' : '#e7f2ea'}; color:${out ? '#f8ddcb' : '#2f6e4b'}; border-radius:${out ? '12px 12px 12px 3px' : '12px 12px 3px 12px'}; padding:9px 12px; font:${out ? 400 : 600} 13px/1.5 'Public Sans',sans-serif`)}>{m.body}</div>
                <div style={s("display:flex; gap:8px; align-items:center; font:400 11.5px 'Public Sans',sans-serif; color:#8a6f76")}>
                  <span>{KIND[m.kind] ?? m.kind}</span>·<span>{fmtAt(m.at)}</span>
                  {out && <Pill bg={m.status === 'LIVRE' ? '#e7f2ea' : '#f2e8e0'} fg={m.status === 'LIVRE' ? '#2f6e4b' : '#8a6f76'} css="font-size:10.5px; padding:2px 8px">{m.status === 'LIVRE' ? 'Livré' : m.status === 'ECHEC' ? 'Échec' : 'Envoyé'}</Pill>}
                </div>
              </div>
              <div style={s("display:flex; gap:6px")}>
                {canReply && (
                  <>
                    <button disabled={busy === m.id} onClick={() => reply(m, kw.bookKeyword)} style={s("background:#3d8a5f; color:#fff; border:none; padding:8px 12px; border-radius:6px; font:600 12.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap")}>Répondre « {kw.bookKeyword} »</button>
                    <button disabled={busy === m.id} onClick={() => reply(m, kw.stopKeyword)} style={s("background:#fff; color:#5c4048; border:1px solid #e4d4c8; padding:8px 10px; border-radius:6px; font:600 12.5px 'Public Sans',sans-serif; cursor:pointer")}>{kw.stopKeyword}</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
