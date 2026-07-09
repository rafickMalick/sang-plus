import { s } from '../style.js'

export default function Contact() {
  return (
    <div id="contact" style={s("display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; padding:80px 56px; max-width:1400px; margin:0 auto; box-sizing:border-box")}>
      <img src="/assets/photo-don-2.png" alt="Donneuse au centre de don" style={s("width:100%; height:360px; object-fit:cover; border-radius:8px; display:block; box-shadow:0 16px 40px rgba(43,13,21,.18)")} />
      <div>
        <h2 style={s("font:600 38px/1.15 'Newsreader',serif; color:#2b0d15; margin:0 0 14px; text-wrap:pretty")}>Vous êtes une autorité de santé ?</h2>
        <p style={s("font:400 15.5px/1.65 'Public Sans',sans-serif; color:#5c4048; margin:0 0 28px; max-width:48ch; text-wrap:pretty")}>Découvrez comment Sang+ peut équiper vos centres de transfusion. Démo personnalisée avec vos données régionales, installation en moins d'une semaine.</p>
        <div style={s("display:flex; gap:10px")}>
          <input placeholder="votre.email@sante.gouv" style={s("flex:1; max-width:320px; padding:14px 16px; border:1.5px solid #d8c3b5; border-radius:4px; font:400 14px 'Public Sans',sans-serif; background:#fff; color:#2b0d15; outline:none")} />
          <span style={s("background:#431420; color:#f8ddcb; padding:14px 24px; border-radius:4px; font:600 14px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap")}>Être recontacté</span>
        </div>
        <div style={s("margin-top:18px; font:400 12.5px 'Public Sans',sans-serif; color:#8a6f76")}>Ou écrivez-nous : <a href="mailto:contact@sang-plus.org">contact@sang-plus.org</a></div>
      </div>
    </div>
  )
}
