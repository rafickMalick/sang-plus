import { s } from '../style.js'

const ITEMS = [
  { n: '01 — Fidéliser', t: 'Chaque donneur rappelé au bon moment', d: 'Sang+ calcule l’aptitude à partir de la date du dernier don et de vos règles nationales. Le donneur reçoit un SMS le matin où il peut donner à nouveau.', border: true },
  { n: '02 — Cibler', t: 'Des alertes par groupe et par commune', d: 'Quand un groupe est en tension, l’alerte vise les donneurs aptes de ce groupe dans une commune, jamais tout le fichier. Un plafond mensuel évite de lasser les donneurs.', border: true },
  { n: '03 — Remplir les collectes', t: 'Des créneaux plutôt que des files d’attente', d: 'Le donneur répond « 1 » pour réserver un créneau. Ceux qui n’ont pas répondu passent dans la liste d’appel de vos agents de recrutement.', border: false },
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
