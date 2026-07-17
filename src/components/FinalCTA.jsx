import { s } from '../style.js'

// Badges = positionnements produits, pas des certifications vérifiées —
// à valider/adapter avec la réalité de l'infrastructure avant publication.
const BADGES = [
  '✓ Hébergement des données en Afrique',
  '✓ Conçu pour la conformité RGPD',
  '✓ Chiffrement de bout en bout',
  '✓ Accès sécurisé par rôle',
]

export default function FinalCTA() {
  return (
    <div className="sp-final-cta" style={s("background:#431420; padding:64px 56px; text-align:center; box-sizing:border-box")}>
      <div style={s("max-width:760px; margin:0 auto")}>
        <h2 className="sp-final-cta-h2" style={s("font:600 34px/1.2 'Newsreader',serif; color:#f8ddcb; margin:0 0 14px; text-wrap:pretty")}>Prêt à équiper votre centre de transfusion ?</h2>
        <p style={s("font:400 15px/1.6 'Public Sans',sans-serif; color:#d9b8a8; margin:0 0 28px")}>Démo personnalisée, installation accompagnée, support en français et en langues locales.</p>
        <a href="#contact" style={s("display:inline-block; background:#c8102e; color:#fff; padding:15px 32px; border-radius:4px; font:600 15px 'Public Sans',sans-serif; margin-bottom:34px")}>Demander une démo</a>
        <div style={s("display:flex; flex-wrap:wrap; justify-content:center; gap:10px")}>
          {BADGES.map((b) => (
            <span key={b} style={s("border:1px solid rgba(248,221,203,.3); color:#d9b8a8; padding:8px 16px; border-radius:999px; font:500 12.5px 'Public Sans',sans-serif")}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
