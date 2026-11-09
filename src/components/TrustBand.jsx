import { s } from '../style.js'

// Les quatre maillons du circuit que Sang+ outille (profils réels du logiciel).
// Pas de noms d'institutions tant qu'aucun partenariat n'est signé.
const MAILLONS = ['Antennes de transfusion', 'Collectes mobiles', 'Agents de recrutement', 'Établissements demandeurs']

export default function TrustBand() {
  return (
    <div className="sp-trust" style={s("display:flex; align-items:center; gap:34px; padding:28px 56px; max-width:1400px; margin:0 auto; border-top:1px solid rgba(67,20,32,.14); box-sizing:border-box")}>
      <div style={s("font:600 11.5px 'Public Sans',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#8a6f76; white-space:nowrap")}>Un outil pour tout le circuit du don</div>
      <div style={s("display:flex; flex-wrap:wrap; align-items:center; gap:10px; font:600 14.5px 'Newsreader',serif; color:#5c4048")}>
        {MAILLONS.map((name, i) => (
          <span key={name} style={s("display:inline-flex; align-items:center; gap:10px")}>
            {i > 0 && <span style={s("color:#d8c3b5")}>·</span>}
            <span>{name}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
