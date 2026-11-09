import { s } from '../style.js'

export default function Hero() {
  return (
    <div className="sp-hero" style={s("display:grid; grid-template-columns:1.05fr 1fr; gap:60px; padding:84px 56px 88px; align-items:center; max-width:1400px; margin:0 auto; box-sizing:border-box")}>
      <div>
        <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#c8102e; margin-bottom:20px")}>Fidélisation des donneurs bénévoles · Bénin</div>
        <h1 style={s("font:600 clamp(28px,7vw + 4px,58px)/1.07 'Newsreader',serif; color:#2b0d15; margin:0 0 24px; text-wrap:pretty")}>Du premier don<br />au donneur régulier.</h1>
        <p style={s("font:400 17.5px/1.65 'Public Sans',sans-serif; color:#5c4048; margin:0 0 32px; max-width:52ch; text-wrap:pretty")}>Sang+ aide les antennes de transfusion à <strong style={s("color:#431420")}>rappeler chaque donneur bénévole dès qu'il redevient apte</strong>, à cibler les groupes en tension et à remplir les collectes mobiles. Le rappel part par SMS, et vos agents de recrutement appellent ceux qui n'ont pas répondu.</p>
        <div style={s("display:flex; gap:14px; align-items:center; flex-wrap:wrap")}>
          <a href="#contact" style={s("background:#c8102e; color:#fff; padding:15px 28px; border-radius:4px; font:600 15px 'Public Sans',sans-serif")}>Demander une démo</a>
          <a href="#campagne" style={s("border:1.5px solid #431420; color:#431420; padding:14px 26px; border-radius:4px; font:600 15px 'Public Sans',sans-serif")}>Voir l'outil en action</a>
        </div>
        <div style={s("margin-top:30px; font:400 13px 'Public Sans',sans-serif; color:#8a6f76")}>Règles d'aptitude paramétrées selon vos normes nationales · Aucune donnée médicale stockée</div>
      </div>
      <div style={s("position:relative")}>
        <img className="sp-hero-img" src="/assets/photo-don-1.png" alt="Collecte de sang en centre de santé" style={s("width:100%; height:430px; object-fit:cover; border-radius:8px; display:block; box-shadow:0 20px 50px rgba(43,13,21,.22)")} />
        <div className="sp-hero-badge" style={s("position:absolute; left:-26px; bottom:-24px; background:#431420; color:#f8ddcb; padding:18px 24px; border-radius:8px; box-shadow:0 14px 34px rgba(43,13,21,.3)")}>
          <div style={s("font:600 30px 'Newsreader',serif")}>Apte à nouveau ?</div>
          <div style={s("font:400 12px 'Public Sans',sans-serif; opacity:.75")}>Le rappel part automatiquement, le jour même.</div>
        </div>
      </div>
    </div>
  )
}
