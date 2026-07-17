import { s } from '../style.js'

export default function PhotoBleed() {
  return (
    <div style={s("position:relative")}>
      <img className="sp-photo-quote" src="/assets/photo-campagne.png" alt="Campagne mobile de don de sang" style={s("width:100%; height:460px; object-fit:cover; display:block")} />
      <div style={s("position:absolute; inset:0; background:linear-gradient(to top, rgba(43,13,21,.82), rgba(43,13,21,.15))")}></div>
      <div className="sp-photo-quote-wrap" style={s("position:absolute; left:0; right:0; bottom:0; padding:0 56px 52px; max-width:1400px; margin:0 auto; box-sizing:border-box")}>
        <div className="sp-photo-quote-text" style={s("font:500 34px/1.25 'Newsreader',serif; color:#f8ddcb; max-width:26ch; text-wrap:balance")}>« Le sang ne se fabrique pas. Il se donne. »</div>
        <div style={s("font:400 14px 'Public Sans',sans-serif; color:#d9b8a8; margin-top:12px")}>Campagne mobile · Parakou, Bénin</div>
      </div>
    </div>
  )
}
