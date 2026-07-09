import { s } from '../style.js'

export default function Hero() {
  return (
    <div style={s("display:grid; grid-template-columns:1.05fr 1fr; gap:60px; padding:84px 56px 88px; align-items:center; max-width:1400px; margin:0 auto; box-sizing:border-box")}>
      <div>
        <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#c8102e; margin-bottom:20px")}>Outil des autorités de santé · Bénin · Sénégal · Afrique de l'Ouest</div>
        <h1 style={s("font:600 58px/1.07 'Newsreader',serif; color:#2b0d15; margin:0 0 24px; text-wrap:pretty")}>Chaque poche compte.<br />Chaque donneur aussi.</h1>
        <p style={s("font:400 17.5px/1.65 'Public Sans',sans-serif; color:#5c4048; margin:0 0 32px; max-width:52ch; text-wrap:pretty")}>Sang+ aide les ministères de la santé, agences et centres de transfusion à <strong style={s("color:#431420")}>recenser, sensibiliser et mobiliser</strong> les donneurs de sang — par SMS et appels vocaux, dans leur langue.</p>
        <div style={s("display:flex; gap:14px; align-items:center")}>
          <a href="#contact" style={s("background:#c8102e; color:#fff; padding:15px 28px; border-radius:4px; font:600 15px 'Public Sans',sans-serif")}>Demander une démo</a>
          <a href="#campagne" style={s("border:1.5px solid #431420; color:#431420; padding:14px 26px; border-radius:4px; font:600 15px 'Public Sans',sans-serif")}>Voir l'outil en action</a>
        </div>
        <div style={s("margin-top:30px; font:400 13px 'Public Sans',sans-serif; color:#8a6f76")}>Conçu avec les centres nationaux de transfusion sanguine.</div>
      </div>
      <div style={s("position:relative")}>
        <img src="/assets/photo-don-1.png" alt="Collecte de sang en centre de santé" style={s("width:100%; height:430px; object-fit:cover; border-radius:8px; display:block; box-shadow:0 20px 50px rgba(43,13,21,.22)")} />
        <div style={s("position:absolute; left:-26px; bottom:-24px; background:#431420; color:#f8ddcb; padding:18px 24px; border-radius:8px; box-shadow:0 14px 34px rgba(43,13,21,.3)")}>
          <div style={s("font:600 30px 'Newsreader',serif")}>1 don = 3 vies</div>
          <div style={s("font:400 12px 'Public Sans',sans-serif; opacity:.75")}>sensibilisation · recensement · mobilisation</div>
        </div>
      </div>
    </div>
  )
}
