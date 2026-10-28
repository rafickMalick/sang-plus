import { useCallback, useEffect, useRef, useState } from 'react'
import { s } from '../style.js'
import { api, getDemoUser, setDemoUser } from './api.js'
import { ini } from './format.js'
import { Loading } from './ui.jsx'
import Login from './Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Campagnes from './pages/Campagnes.jsx'
import Collectes from './pages/Collectes.jsx'
import Registre from './pages/Registre.jsx'
import National from './pages/National.jsx'
import Regles from './pages/Regles.jsx'
import Journee from './pages/Journee.jsx'
import Besoins from './pages/Besoins.jsx'
import AdminOverview from './pages/admin/Overview.jsx'
import Organisations from './pages/admin/Organisations.jsx'
import Utilisateurs from './pages/admin/Utilisateurs.jsx'
import Simulateur from './pages/admin/Simulateur.jsx'
import Journal from './pages/admin/Journal.jsx'

// Écran : [composant, titre, sous-titre(me)]
const PAGES = {
  admin: [AdminOverview, 'Vue d’ensemble', () => 'Plateforme Sang+ · pays, organisations, comptes'],
  organisations: [Organisations, 'Organisations', () => 'Service national, sites de collecte et établissements'],
  utilisateurs: [Utilisateurs, 'Utilisateurs', () => 'Comptes, rôles et périmètres'],
  simulateur: [Simulateur, 'Simulateur SMS', () => 'Messages envoyés et réponses des donneurs (démonstration)'],
  journal: [Journal, 'Journal', () => 'Toutes les actions enregistrées'],
  national: [National, 'Tableau national', (me) => me.country.labels.national + ' · ' + me.sites.length + ' sites de collecte'],
  dashboard: [Dashboard, 'Tableau de bord', (me) => me.organisation?.name + ' · l’essentiel de la journée'],
  campagnes: [Campagnes, 'Campagnes', () => 'Alertes ciblées et rappels automatiques'],
  collectes: [Collectes, 'Collectes et créneaux', () => 'Sessions fixes et mobiles du site'],
  registre: [Registre, 'Registre des donneurs', (me) => (me.national ? 'Tous les sites · une fiche par donneur' : me.organisation?.name)],
  regles: [Regles, 'Règles et modèles', (me) => 'Fixés au niveau national, appliqués à tous les sites · ' + me.country.name],
  journee: [Journee, 'Ma journée', (me) => me.organisation?.name + ' · appels et pointage'],
  besoins: [Besoins, 'Signalement de besoin', (me) => me.organisation?.name + ' · transmis au site de collecte'],
}

function navFor(me) {
  const r = me.user.role
  if (r === 'SUPER_ADMIN') return [['admin', 'Vue d’ensemble'], ['organisations', 'Organisations'], ['utilisateurs', 'Utilisateurs'], ['regles', 'Règles et modèles'], ['simulateur', 'Simulateur SMS'], ['journal', 'Journal']]
  if (r === 'PILOTE' && me.national) return [['national', 'Tableau national'], ['registre', 'Registre national'], ['regles', 'Règles nationales']]
  if (r === 'PILOTE') return [['dashboard', 'Tableau de bord'], ['campagnes', 'Campagnes'], ['collectes', 'Collectes'], ['registre', 'Registre des donneurs']]
  if (r === 'OPERATEUR') return [['journee', 'Ma journée']]
  return [['besoins', 'Signalement de besoin']]
}

export default function Logiciel() {
  const [userId, setUserId] = useState(getDemoUser())
  const [me, setMe] = useState(null)
  const [error, setError] = useState(null)
  const [route, setRoute] = useState({ page: null, params: {} })
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  useEffect(() => {
    if (!userId) return
    setMe(null)
    api.get('/me')
      .then((m) => { setMe(m); setRoute({ page: m.home === 'dashboard' && m.national ? 'national' : m.home, params: {} }) })
      .catch((e) => { if (e.status === 401) { setDemoUser(null); setUserId(null) } else setError(e) })
  }, [userId])

  const flash = useCallback((t) => {
    setToast(t)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3200)
  }, [])

  if (!userId) return <Login onEnter={(id) => { setDemoUser(id); setUserId(id) }} />
  if (!me) return <div style={s("padding:40px")}><Loading error={error} /></div>

  const nav = navFor(me)
  const go = (page, params = {}) => setRoute({ page, params })
  const [Page, title, sub] = PAGES[route.page] ?? PAGES[nav[0][0]]
  const refreshMe = () => api.get('/me').then(setMe).catch((e) => flash(e.message))
  const app = { me, go, flash, refreshMe, params: route.params, siteId: me.sites[0]?.id }
  const logout = () => { setDemoUser(null); setUserId(null); setMe(null) }
  const hasCta = me.user.role === 'PILOTE' && !me.national && route.page !== 'campagnes'

  return (
    <>
      <div className="g-shell" style={s("display:grid; grid-template-columns:248px minmax(0,1fr); min-height:100vh")}>
        <aside className="g-side" style={s("background:#431420; display:flex; flex-direction:column; padding:20px 14px; gap:4px; position:sticky; top:0; height:100vh; box-sizing:border-box")}>
          <img className="g-side-logo" src="/assets/logo.png" alt="Sang+" style={s("height:34px; border-radius:7px; display:block; margin:2px 0 18px 6px; align-self:flex-start")} />
          <div className="g-side-org" style={s("background:#5a2230; border-radius:8px; padding:10px 12px; margin-bottom:14px")}>
            <div style={s("font:600 13.5px 'Public Sans',sans-serif; color:#f8ddcb")}>{me.organisation?.name ?? 'Plateforme Sang+'}</div>
            <div style={s("font:400 11.5px 'Public Sans',sans-serif; color:#c99aa6")}>{me.country.name}{me.national ? ' · ' + me.sites.length + ' sites' : me.organisation?.city ? ' · ' + me.organisation.city : ''}</div>
          </div>
          <div className="g-side-cap" style={s("font:600 10.5px 'Public Sans',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#a87885; padding:0 12px 6px")}>{me.user.title}</div>
          <div className="g-side-nav" style={s("display:flex; flex-direction:column; gap:2px")}>
            {nav.map(([id, label]) => {
              const a = route.page === id
              return <button key={id} onClick={() => go(id)} style={s(`display:flex; align-items:center; border:none; text-align:left; background:${a ? '#5a2230' : 'transparent'}; color:${a ? '#f8ddcb' : '#c99aa6'}; padding:10px 12px; border-radius:6px; font:600 14px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap`)}>{label}</button>
            })}
          </div>
          <div className="g-side-foot" style={s("margin-top:auto; border-top:1px solid rgba(248,221,203,.12); padding-top:14px; display:flex; flex-wrap:wrap; align-items:center; gap:10px")}>
            <span style={s("flex:none; width:34px; height:34px; border-radius:50%; background:#f8ddcb; color:#431420; display:flex; align-items:center; justify-content:center; font:700 12px 'Public Sans',sans-serif")}>{ini(me.user.name)}</span>
            <div className="g-side-user" style={s("min-width:0; flex:1 1 140px")}>
              <div style={s("font:600 13px 'Public Sans',sans-serif; color:#f8ddcb; overflow:hidden; text-overflow:ellipsis; white-space:nowrap")}>{me.user.name}</div>
              <div style={s("font:400 11px 'Public Sans',sans-serif; color:#c99aa6")}>Mode démonstration</div>
            </div>
            <button onClick={logout} style={s("border:1px solid rgba(248,221,203,.25); background:transparent; color:#f8ddcb; border-radius:6px; padding:7px 9px; font:600 11.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap; flex:1 1 100%")}>Changer de profil</button>
          </div>
        </aside>

        <main style={s("min-width:0; display:flex; flex-direction:column")}>
          <div className="g-head" style={s("display:flex; align-items:center; gap:16px; padding:22px 32px; border-bottom:1px solid #eadbd0")}>
            <div style={s("min-width:0; flex:1")}>
              <h1 style={s("font:600 28px/1.2 'Newsreader',serif; color:#2b0d15; margin:0")}>{route.page === 'dashboard' ? 'Bonjour ' + me.user.name.split(' ')[0] : title}</h1>
              <div style={s("font:400 13.5px 'Public Sans',sans-serif; color:#8a6f76; margin-top:2px")}>{sub(me)}</div>
            </div>
            <span className="g-head-date" style={s("font:500 13px 'Public Sans',sans-serif; color:#5c4048; white-space:nowrap; text-transform:capitalize")}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: me.country.timezone })}</span>
            {hasCta && <button className="g-head-cta" onClick={() => go('campagnes')} style={s("background:#c8102e; color:#fff; border:none; padding:11px 18px; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap")}>Lancer une alerte</button>}
          </div>
          <div className="g-body" style={s("padding:28px 32px; display:flex; flex-direction:column; gap:20px")}>
            <Page key={route.page + JSON.stringify(route.params)} app={app} />
          </div>
        </main>
      </div>
      {toast && (
        <div style={s("position:fixed; left:50%; bottom:28px; transform:translateX(-50%); background:#2b0d15; color:#f8ddcb; padding:13px 22px; border-radius:8px; font:600 13.5px 'Public Sans',sans-serif; box-shadow:0 14px 34px rgba(43,13,21,.3); z-index:100; animation:floatin .3s ease; max-width:calc(100vw - 40px); box-sizing:border-box")}>{toast}</div>
      )}
    </>
  )
}
