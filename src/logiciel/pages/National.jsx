import { s } from '../../style.js'
import { LEVELS, fmtDay } from '../format.js'
import { useLoad } from '../useLoad.js'
import { CARD, Kpi, Loading } from '../ui.jsx'

export default function National({ app }) {
  const { data, error } = useLoad('/national')
  if (!data) return <Loading error={error} />
  const G = app.me.country.bloodGroups
  const cols = `display:grid; grid-template-columns:minmax(200px,1.8fr) repeat(${G.length},46px) minmax(120px,1fr); gap:6px; align-items:center`

  return (
    <div style={s("display:flex; flex-direction:column; gap:20px")}>
      <div className="g-kpi5" style={s("display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px")}>
        {data.kpis.map((k) => <Kpi key={k.label} {...k} />)}
      </div>
      <div style={s(`${CARD}; padding:20px 22px; min-width:0`)}>
        <div style={s("display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:14px")}>
          <div style={s("font:600 16px 'Public Sans',sans-serif; color:#2b0d15")}>Stock par site · dernier relevé</div>
          <div style={s("display:flex; gap:14px; font:500 12px 'Public Sans',sans-serif; color:#5c4048")}>
            {Object.values(LEVELS).map((l) => (
              <span key={l.label} style={s("display:flex; align-items:center; gap:6px")}><span style={s(`width:10px; height:10px; border-radius:3px; background:${l.dot}`)}></span>{l.label}</span>
            ))}
          </div>
        </div>
        <div style={s("overflow-x:auto")}>
          <div style={s(`${cols}; padding:8px 0; font:600 10.5px 'Public Sans',sans-serif; letter-spacing:.06em; text-transform:uppercase; color:#8a6f76; border-bottom:1px solid #f0e4da; min-width:760px`)}>
            <span>Site</span>
            {G.map((g) => <span key={g} style={s("text-align:center")}>{g}</span>)}
            <span>Relevé</span>
          </div>
          {data.sites.map((x) => (
            <div key={x.id} style={s(`${cols}; padding:10px 0; border-bottom:1px solid #f7efe8; min-width:760px`)}>
              <span style={s("min-width:0")}>
                <span style={s("display:block; font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{x.name}</span>
                <span style={s("display:block; font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>{x.city} · {x.donors} donneurs</span>
              </span>
              {G.map((g) => {
                const l = LEVELS[x.levels[g]]
                return <span key={g} title={g + ' · ' + (l?.label ?? 'non relevé')} style={s(`height:26px; border-radius:5px; background:${l?.dot ?? '#f2e8e0'}`)}></span>
              })}
              <span style={s(`font:500 12.5px 'Public Sans',sans-serif; color:${x.late ? '#c8102e' : '#5c4048'}`)}>{x.readingDay ? (x.late ? fmtDay(x.readingDay) + ' · en retard' : 'Aujourd’hui') : 'Aucun relevé'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
