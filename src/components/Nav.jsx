import { s } from '../style.js'

export default function Nav() {
  return (
    <div className="sp-nav" style={s("position:sticky; top:0; z-index:50; display:flex; align-items:center; justify-content:space-between; padding:14px 56px; background:#faf4eeee; backdrop-filter:blur(8px); border-bottom:1px solid rgba(67,20,32,.14); box-sizing:border-box")}>
      <img src="/assets/logo.png" alt="Sang+" style={s("height:40px; border-radius:8px; display:block")} />
      <div style={s("display:flex; align-items:center; gap:22px")}>
        <div className="sp-nav-links" style={s("display:flex; align-items:center; gap:30px; font:500 14px 'Public Sans',sans-serif; color:#431420")}>
          <a href="#mission" style={s("color:#431420")}>La mission</a>
          <a href="#campagne" style={s("color:#431420")}>Assistance Campagne</a>
          <a href="#outil" style={s("color:#431420")}>L'outil</a>
          <a href="#impact" style={s("color:#431420")}>Impact</a>
        </div>
        <a href="#contact" style={s("background:#431420; color:#f8ddcb; padding:11px 22px; border-radius:4px; font:600 14px 'Public Sans',sans-serif; white-space:nowrap")}>Demander une démo</a>
      </div>
    </div>
  )
}
