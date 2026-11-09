import { s } from '../style.js'

// Engagements vérifiables dans le code (règles du pack pays, schéma de données).
// Remplacer par des résultats mesurés une fois un pilote mené.
const STATS = [
  { v: '0', l: 'donnée médicale stockée', red: false, border: false },
  { v: '2', l: 'SMS maximum par donneur et par mois (réglable)', red: false, border: true },
  { v: '1', l: 'chiffre à répondre pour réserver un créneau', red: true, border: true },
  { v: 'STOP', l: 'suffit pour ne plus être contacté', red: true, border: true },
]

export default function Impact() {
  return (
    <div id="impact" className="sp-impact" style={s("display:grid; grid-template-columns:repeat(4,1fr); padding:64px 56px; border-bottom:1px solid rgba(67,20,32,.14); max-width:1400px; margin:0 auto; box-sizing:border-box")}>
      {STATS.map((st) => (
        <div key={st.l} style={s(`text-align:center; padding:0 12px${st.border ? '; border-left:1px solid rgba(67,20,32,.14)' : ''}`)}>
          <div style={s(`font:600 50px 'Newsreader',serif; color:${st.red ? '#c8102e' : '#2b0d15'}`)}>{st.v}</div>
          <div style={s("font:500 13px 'Public Sans',sans-serif; color:#8a6f76")}>{st.l}</div>
        </div>
      ))}
    </div>
  )
}
