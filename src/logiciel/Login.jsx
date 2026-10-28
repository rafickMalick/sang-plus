import { useEffect, useState } from 'react'
import { s } from '../style.js'
import { api } from './api.js'
import { ROLE_LABEL } from './format.js'

// Mode démonstration : on choisit un profil, sans mot de passe. L'authentification réelle remplacera cet écran.
export default function Login({ onEnter }) {
  const [users, setUsers] = useState(null)
  const [error, setError] = useState(null)
  const [sel, setSel] = useState(null)

  useEffect(() => {
    api.get('/demo/users')
      .then((u) => { setUsers(u); setSel((u.find((x) => x.role === 'PILOTE' && x.organisation.includes('Cotonou')) || u[0])?.id) })
      .catch(() => setError('L’API Sang+ ne répond pas. Lancez-la avec « npm run api » puis rechargez la page.'))
  }, [])

  return (
    <div className="g-login" style={s("min-height:100vh; display:grid; grid-template-columns:1.05fr 1fr; background:#faf4ee")}>
      <div className="g-login-art" style={s("position:relative; overflow:hidden; background:#431420; min-height:100vh")}>
        <img src="/assets/photo-don-1.png" alt="Collecte de sang" style={s("position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block")} />
        <div style={s("position:absolute; inset:0; background:linear-gradient(to top, rgba(43,13,21,.95) 15%, rgba(43,13,21,.25))")}></div>
        <div style={s("position:absolute; left:56px; right:56px; bottom:56px; color:#f8ddcb; display:flex; flex-direction:column; gap:18px")}>
          <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#f0a6b0")}>Plateforme nationale · ANTS Bénin</div>
          <div style={s("font:600 40px/1.15 'Newsreader',serif; max-width:17ch; text-wrap:pretty")}>Plus de donneurs qui reviennent.</div>
          <div style={s("display:flex; flex-direction:column; gap:8px; font:400 14.5px/1.5 'Public Sans',sans-serif; color:#e8cbbd; max-width:46ch")}>
            <span>Rappel automatique dès qu'un donneur redevient apte.</span>
            <span>Alerte ciblée par groupe et par zone en quelques minutes.</span>
            <span>Chaque don confirmé au site : des chiffres fiables.</span>
          </div>
        </div>
      </div>
      <div className="g-login-form" style={s("display:flex; flex-direction:column; justify-content:center; padding:48px 56px; box-sizing:border-box")}>
        <div style={s("max-width:460px; width:100%; margin:0 auto; display:flex; flex-direction:column; gap:16px")}>
          <a href="/" style={s("align-self:flex-start")}><img src="/assets/logo.png" alt="Sang+" style={s("height:42px; border-radius:8px; display:block")} /></a>
          <div>
            <h1 style={s("font:600 34px/1.15 'Newsreader',serif; color:#2b0d15; margin:10px 0 6px")}>Démonstration</h1>
            <p style={s("font:400 14.5px/1.6 'Public Sans',sans-serif; color:#5c4048; margin:0")}>Choisissez un profil pour entrer dans Sang+. Aucun mot de passe en mode démonstration.</p>
          </div>
          {error && <div style={s("background:#fbe9ec; color:#7d1a28; border-radius:8px; padding:12px 14px; font:500 13.5px/1.5 'Public Sans',sans-serif")}>{error}</div>}
          <div style={s("display:flex; flex-direction:column; gap:6px")}>
            {(users || []).map((u) => {
              const a = u.id === sel
              return (
                <button key={u.id} onClick={() => setSel(u.id)} onDoubleClick={() => onEnter(u.id)} style={s(`display:flex; align-items:center; gap:12px; text-align:left; border:1.5px solid ${a ? '#c8102e' : '#e4d4c8'}; background:${a ? '#fbf3ee' : '#fff'}; border-radius:8px; padding:10px 12px; cursor:pointer`)}>
                  <span style={s(`flex:none; width:14px; height:14px; border-radius:50%; border:2px solid ${a ? '#c8102e' : '#d8c3b5'}; background:${a ? '#c8102e' : '#fff'}; box-sizing:border-box`)}></span>
                  <span style={s("min-width:0; flex:1")}>
                    <span style={s("display:block; font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{u.name}</span>
                    <span style={s("display:block; font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>{u.title} · {u.organisation}</span>
                  </span>
                  <span style={s("font:600 10.5px 'Public Sans',sans-serif; letter-spacing:.06em; text-transform:uppercase; color:#8a6f76; white-space:nowrap")}>{ROLE_LABEL[u.role]}</span>
                </button>
              )
            })}
          </div>
          <button className="btn-red" disabled={!sel} onClick={() => onEnter(sel)} style={s("background:#c8102e; color:#fff; border:none; padding:15px 0; border-radius:6px; font:600 15px 'Public Sans',sans-serif; cursor:pointer")}>Entrer</button>
          <div style={s("border-top:1px solid #eadbd0; padding-top:14px; font:400 12.5px/1.6 'Public Sans',sans-serif; color:#8a6f76")}>Les donneurs n'ont pas de compte : ils sont joints par SMS et répondent par SMS. Données entièrement fictives.</div>
          <a href="/" style={s("font:600 13px 'Public Sans',sans-serif")}>← Retour au site</a>
        </div>
      </div>
    </div>
  )
}
