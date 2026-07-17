import { s } from '../style.js'

// Présenté comme une capacité technique (compatibilité réseau),
// pas comme un partenariat commercial affiché.
export default function NetworkPartners() {
  return (
    <div className="sp-partners" style={s("border-bottom:1px solid rgba(67,20,32,.14); padding:36px 56px; box-sizing:border-box")}>
      <div style={s("max-width:1400px; margin:0 auto; display:flex; align-items:center; gap:40px; flex-wrap:wrap")}>
        <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#8a6f76; white-space:nowrap")}>SMS &amp; appels vocaux sur tous les réseaux</div>
        <div style={s("display:flex; flex-wrap:wrap; align-items:center; gap:28px; font:600 14.5px 'Newsreader',serif; color:#5c4048")}>
          <span>Orange</span><span>MTN</span><span>Moov Africa</span><span>Wave</span>
          <span style={s("font:400 13px 'Public Sans',sans-serif; color:#8a6f76")}>+ opérateurs locaux</span>
        </div>
      </div>
    </div>
  )
}
