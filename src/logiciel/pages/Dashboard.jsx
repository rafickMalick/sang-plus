import { useState } from 'react'
import { s } from '../../style.js'
import { api, qs } from '../api.js'
import { LEVELS, fmtAt, fmtDay } from '../format.js'
import { useLoad } from '../useLoad.js'
import { BTN_LINE, BTN_RED, CARD, Empty, Kpi, Loading, TITLE } from '../ui.jsx'

function StockCard({ app, stock, reload }) {
  const groups = app.me.country.bloodGroups
  const [edit, setEdit] = useState(null)
  const levels = edit ?? stock.levels
  const save = async () => {
    try {
      await api.put('/stock', { siteId: app.siteId, levels: edit })
      app.flash('Relevé du ' + fmtDay(stock.day) + ' enregistré · visible au niveau national')
      setEdit(null)
      reload()
    } catch (e) { app.flash(e.message) }
  }
  const critical = groups.filter((g) => levels[g] === 'CRITIQUE')

  return (
    <div style={s(`${CARD}; padding:20px 22px; display:flex; flex-direction:column; gap:14px`)}>
      <div style={s("display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap")}>
        <div style={s(TITLE)}>Niveaux de stock</div>
        <div style={s(`font:500 12.5px 'Public Sans',sans-serif; color:${stock.saved ? '#2f6e4b' : '#c8102e'}`)}>{stock.saved ? 'Relevé enregistré aujourd’hui' : 'Relevé du jour à enregistrer'}</div>
      </div>
      <div style={s("display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px")}>
        {groups.map((g) => {
          const l = LEVELS[levels[g]] ?? { bg: '#f7efe8', fg: '#8a6f76', label: 'Non relevé' }
          return (
            <div key={g} style={s(`background:${l.bg}; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px`)}>
              <span style={s("font:700 17px 'Public Sans',sans-serif; color:#2b0d15")}>{g}</span>
              {edit ? (
                <div style={s("display:flex; gap:3px; flex-wrap:wrap")}>
                  {Object.entries(LEVELS).map(([k, L]) => (
                    <button key={k} title={L.label} onClick={() => setEdit({ ...edit, [g]: k })} style={s(`flex:1; min-width:0; border:1.5px solid ${levels[g] === k ? L.dot : '#e4d4c8'}; background:${levels[g] === k ? L.dot : '#fff'}; color:${levels[g] === k ? '#fff' : L.fg}; border-radius:5px; padding:4px 0; font:600 11px 'Public Sans',sans-serif; cursor:pointer`)}>{L.label.slice(0, 4)}</button>
                  ))}
                </div>
              ) : (
                <span style={s(`font:600 12px 'Public Sans',sans-serif; color:${l.fg}`)}>{l.label}</span>
              )}
            </div>
          )
        })}
      </div>
      <div style={s("display:flex; gap:8px; flex-wrap:wrap; align-items:center")}>
        {edit ? (
          <>
            <button onClick={save} style={s("background:#431420; color:#f8ddcb; border:none; padding:10px 16px; border-radius:6px; font:600 13px 'Public Sans',sans-serif; cursor:pointer")}>Enregistrer le relevé</button>
            <button onClick={() => setEdit(null)} style={s(BTN_LINE)}>Annuler</button>
          </>
        ) : (
          <button onClick={() => setEdit(Object.fromEntries(groups.map((g) => [g, stock.levels[g] ?? 'NORMAL'])))} style={s(BTN_LINE)}>Saisir le relevé du jour</button>
        )}
        {!edit && critical.length > 0 && (
          <button onClick={() => app.go('campagnes', { group: critical[0] })} style={s(`${BTN_RED}; padding:10px 16px; font-size:13px`)}>Alerter les donneurs {critical[0]}</button>
        )}
      </div>
    </div>
  )
}

export default function Dashboard({ app }) {
  const { data, error, reload } = useLoad('/dashboard' + qs({ siteId: app.siteId }))
  if (!data) return <Loading error={error} />

  return (
    <div style={s("display:flex; flex-direction:column; gap:20px")}>
      <div className="g-kpi5" style={s("display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px")}>
        {data.kpis.map((k) => <Kpi key={k.label} {...k} />)}
      </div>

      <div className="g-2" style={s("display:grid; grid-template-columns:1.2fr 1fr; gap:18px")}>
        <StockCard app={app} stock={data.stock} reload={reload} />
        <div style={s(`${CARD}; padding:20px 22px; display:flex; flex-direction:column; gap:12px`)}>
          <div style={s(TITLE)}>Besoins signalés par les établissements</div>
          {data.needs.length === 0 && <Empty>Aucun besoin signalé.</Empty>}
          {data.needs.map((b) => (
            <div key={b.id} style={s("border:1px solid #f0e4da; border-radius:8px; padding:12px 14px; display:flex; align-items:center; gap:12px; flex-wrap:wrap")}>
              <span style={s("flex:none; font:700 15px 'Public Sans',sans-serif; color:#c8102e; background:#fbe9ec; padding:8px 10px; border-radius:6px")}>{b.bloodGroup}</span>
              <div style={s("flex:1; min-width:160px")}>
                <div style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{b.quantity} poches · {b.urgency}</div>
                <div style={s("font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>{b.hospital} · {b.service} · {fmtAt(b.createdAt)}</div>
              </div>
              {b.status === 'TRANSMIS'
                ? <button onClick={() => app.go('campagnes', { group: b.bloodGroup })} style={s("background:#431420; color:#f8ddcb; border:none; padding:9px 14px; border-radius:6px; font:600 12.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap")}>Préparer l'alerte</button>
                : <span style={s("font:600 11.5px 'Public Sans',sans-serif; color:#2f6e4b; background:#e7f2ea; padding:5px 10px; border-radius:999px; white-space:nowrap")}>Alerte lancée</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="g-2" style={s("display:grid; grid-template-columns:1fr 1fr; gap:18px")}>
        <div style={s(`${CARD}; padding:20px 22px; display:flex; flex-direction:column; gap:12px`)}>
          <div style={s("display:flex; justify-content:space-between; align-items:baseline; gap:10px")}>
            <div style={s(TITLE)}>Prochaines collectes</div>
            <button onClick={() => app.go('collectes')} style={s("border:none; background:none; color:#8a1c2b; font:600 13px 'Public Sans',sans-serif; cursor:pointer; padding:0")}>Tout voir</button>
          </div>
          {data.collectes.length === 0 && <Empty>Aucune collecte programmée.</Empty>}
          {data.collectes.map((c) => (
            <div key={c.id} style={s("display:flex; flex-direction:column; gap:6px; padding:8px 0; border-bottom:1px solid #f7efe8")}>
              <div style={s("display:flex; justify-content:space-between; gap:10px")}>
                <span style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{c.name}</span>
                <span style={s("font:500 12.5px 'Public Sans',sans-serif; color:#5c4048; white-space:nowrap")}>{c.booked} / {c.capacity}</span>
              </div>
              <div style={s("font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>{c.type === 'MOBILE' ? 'Collecte mobile' : 'Site fixe'} · {fmtDay(c.day, { weekday: true })}</div>
              <div style={s("height:6px; background:#f2e8e0; border-radius:999px; overflow:hidden")}>
                <div style={s(`height:100%; width:${Math.round((c.booked / c.capacity) * 100)}%; background:#c8102e`)}></div>
              </div>
            </div>
          ))}
        </div>

        <div style={s(`${CARD}; padding:20px 22px; display:flex; flex-direction:column; gap:14px`)}>
          <div style={s(TITLE)}>Aujourd'hui sur le site</div>
          <div style={s("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px")}>
            {[[data.today.rappels, 'rappels d’aptitude envoyés'], [data.today.calls, 'donneurs en liste d’appel'], [data.today.dons, 'dons confirmés au site']].map(([v, l]) => (
              <div key={l} style={s("background:#faf4ee; border-radius:8px; padding:12px")}>
                <div style={s("font:600 24px 'Newsreader',serif; color:#2b0d15")}>{v}</div>
                <div style={s("font:400 12px/1.4 'Public Sans',sans-serif; color:#5c4048")}>{l}</div>
              </div>
            ))}
          </div>
          <div style={s("display:flex; flex-direction:column; gap:8px")}>
            {data.campaigns.map((c) => (
              <div key={c.id} style={s("display:flex; align-items:center; gap:10px; font:400 13px 'Public Sans',sans-serif; color:#5c4048")}>
                <span style={s(`width:8px; height:8px; border-radius:50%; background:${c.escalated ? '#3d8a5f' : '#c98a2b'}; flex:none`)}></span>
                <span style={s("flex:1")}>{c.type === 'ALERTE' ? <>Alerte <strong style={s("color:#c8102e")}>{c.bloodGroup}</strong> · {c.zone}</> : 'Rappels d’aptitude'} · {c.sent} SMS · {c.yes} « 1 »</span>
                <span style={s("color:#8a6f76; white-space:nowrap")}>{fmtAt(c.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
