import { s } from '../style.js'

export default function Footer() {
  return (
    <div style={s("background:#2b0d15; display:flex; align-items:center; justify-content:space-between; padding:22px 56px")}>
      <img src="/assets/logo.png" alt="Sang+" style={s("height:28px; border-radius:6px; display:block")} />
      <div style={s("font:400 12.5px 'Public Sans',sans-serif; color:#a97f8b")}>Sang+ — l'outil de mobilisation des donneurs de sang · Bénin · Sénégal · © 2026</div>
    </div>
  )
}
