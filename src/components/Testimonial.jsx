import { s } from '../style.js'

// Contenu 100% fictif/illustratif — remplacer par une vraie citation
// et une vraie photo avant mise en ligne.
export default function Testimonial() {
  return (
    <div className="sp-testimonial" style={s("display:flex; align-items:center; gap:40px; max-width:980px; margin:0 auto; padding:76px 56px; box-sizing:border-box")}>
      <div style={s("width:108px; height:108px; flex:none; border-radius:50%; background:#f2e8e0; border:1px solid #e4d4c8; display:flex; align-items:center; justify-content:center; font:500 12px 'Public Sans',sans-serif; color:#b09aa0; margin:0 auto")}>Photo</div>
      <div>
        <div style={s("font:italic 500 23px/1.5 'Newsreader',serif; color:#2b0d15; margin-bottom:18px; text-wrap:pretty")}>« Avant Sang+, organiser une collecte prenait deux semaines. Aujourd'hui, on recontacte 3 000 donneurs recensés en une matinée — chacun dans sa langue. »</div>
        <div style={s("font:600 14px 'Public Sans',sans-serif; color:#431420")}>Dr Aïcha Koné</div>
        <div style={s("font:400 13px 'Public Sans',sans-serif; color:#8a6f76; margin-bottom:10px")}>Responsable régionale de la transfusion sanguine</div>
        <div style={s("font:italic 400 11.5px 'Public Sans',sans-serif; color:#b09aa0")}>Témoignage illustratif — à remplacer par un retour réel de vos équipes.</div>
      </div>
    </div>
  )
}
