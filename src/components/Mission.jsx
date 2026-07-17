import { s } from '../style.js'

const ITEMS = [
  { n: '01 — Recenser', t: 'Une base régionale de donneurs', d: 'Groupes sanguins, historique de dons, localisation — une vue fiable des donneurs de chaque région.', border: true },
  { n: '02 — Sensibiliser', t: 'Des messages santé qui parlent', d: 'Wolof, fon, dendi, yoruba, pulaar… la sensibilisation porte quand elle est dite dans la langue du donneur.', border: true },
  { n: '03 — Mobiliser', t: 'Des campagnes qui remplissent', d: 'Une collecte régionale se lance en minutes : Sang+ contacte les donneurs par SMS ou appel vocal.', border: false },
]

export default function Mission() {
  return (
    <div id="mission" className="sp-mission" style={s("display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid rgba(67,20,32,.14); border-bottom:1px solid rgba(67,20,32,.14); max-width:1400px; margin:0 auto")}>
      {ITEMS.map((it) => (
        <div key={it.n} className="sp-mission-col" style={s(`padding:42px 44px${it.border ? '; border-right:1px solid rgba(67,20,32,.14)' : ''}`)}>
          <div style={s("font:600 13px 'Public Sans',sans-serif; color:#c8102e; margin-bottom:10px")}>{it.n}</div>
          <div style={s("font:500 22px 'Newsreader',serif; color:#2b0d15; margin-bottom:8px")}>{it.t}</div>
          <div style={s("font:400 14px/1.6 'Public Sans',sans-serif; color:#5c4048")}>{it.d}</div>
        </div>
      ))}
    </div>
  )
}
