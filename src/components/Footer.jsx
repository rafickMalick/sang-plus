import { s } from '../style.js'

const COLS = [
  {
    title: 'Produit',
    links: [
      { label: 'Alertes ciblées', href: '#campagne' },
      { label: 'Registre des donneurs', href: '#outil' },
      { label: "Liste d'appel", href: '#appel' },
      { label: 'Garanties', href: '#impact' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Comment ça marche', href: '#mission' },
      { label: 'Demander une démonstration', href: '#contact' },
    ],
  },
]

export default function Footer() {
  return (
    <div className="sp-footer-outer" style={s("background:#2b0d15; padding:56px 56px 0; box-sizing:border-box")}>
      <div className="sp-footer-grid" style={s("max-width:1400px; margin:0 auto; display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:40px; padding-bottom:44px; border-bottom:1px solid rgba(248,221,203,.12); box-sizing:border-box")}>
        <div>
          <img src="/assets/logo.png" alt="Sang+" style={s("height:34px; border-radius:6px; display:block; margin-bottom:14px")} />
          <div style={s("font:400 13px/1.6 'Public Sans',sans-serif; color:#a97f8b; max-width:32ch")}>L'outil de fidélisation des donneurs bénévoles pour les services de transfusion sanguine.</div>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#e08a96; margin-bottom:16px")}>{col.title}</div>
            <div style={s("display:flex; flex-direction:column; gap:11px; font:400 13.5px 'Public Sans',sans-serif")}>
              {col.links.map((l) => (
                <a key={l.label} href={l.href} style={s("color:#d9b8a8")}>{l.label}</a>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#e08a96; margin-bottom:16px")}>Contact</div>
          <div style={s("display:flex; flex-direction:column; gap:11px; font:400 13.5px 'Public Sans',sans-serif")}>
            <a href="mailto:contact@sang-plus.org" style={s("color:#d9b8a8")}>contact@sang-plus.org</a>
            <span style={s("color:#a97f8b")}>Bénin · bientôt l’Afrique de l’Ouest</span>
            <a href="#contact" style={s("color:#d9b8a8")}>Demander une démo</a>
          </div>
        </div>
      </div>
      <div className="sp-footer-bottom" style={s("max-width:1400px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:20px 0; font:400 12.5px 'Public Sans',sans-serif; color:#8a5f6b; box-sizing:border-box")}>
        <span>© 2026 Sang+ — Fidélisation des donneurs de sang</span>
        <span>Conçu pour le Bénin</span>
      </div>
    </div>
  )
}
