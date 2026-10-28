import { s } from '../../../style.js'
import { api } from '../../api.js'
import { ORG_LABEL, ROLE_LABEL } from '../../format.js'
import { useLoad } from '../../useLoad.js'
import { BTN_DARK, BTN_LINE, CARD, Kpi, Loading, TITLE } from '../../ui.jsx'

export default function Overview({ app }) {
  const { data, error, reload } = useLoad('/admin/overview', { poll: 10000 })
  if (!data) return <Loading error={error} />

  const job = async (name, label) => {
    try {
      const r = await api.post('/admin/jobs/' + name)
      app.flash(label + ' : ' + (r.sent ?? r.transferred) + (name === 'reminders' ? ' SMS envoyés' : ' donneurs transférés'))
      reload()
    } catch (e) { app.flash(e.message) }
  }
  const reset = async () => {
    try { await api.post('/admin/reset'); app.flash('Données de démonstration réinitialisées'); setTimeout(() => window.location.reload(), 800) } catch (e) { app.flash(e.message) }
  }
  const list = (obj, labels) => Object.entries(labels).map(([k, l]) => (
    <div key={k} style={s("display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f7efe8; font:500 13.5px 'Public Sans',sans-serif; color:#5c4048")}>
      <span>{l}</span><strong style={s("color:#2b0d15")}>{obj[k] ?? 0}</strong>
    </div>
  ))

  return (
    <div style={s("display:flex; flex-direction:column; gap:20px")}>
      <div className="g-kpi5" style={s("display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px")}>
        <Kpi label="Pays actifs" value={data.countries.filter((c) => c.active).length} note={data.countries.map((c) => c.name).join(', ')} />
        <Kpi label="Donneurs" value={data.donors.toLocaleString('fr-FR')} note="tous pays confondus" />
        <Kpi label="SMS aujourd'hui" value={data.smsToday} note={data.repliesToday + ' réponses reçues'} />
        <Kpi label="Liste d'appel" value={data.openCalls} note="donneurs à rappeler" />
        <Kpi label="Campagnes" value={data.campaigns} note="alertes et rappels" />
      </div>
      <div className="g-2" style={s("display:grid; grid-template-columns:1fr 1fr 1fr; gap:18px")}>
        <div style={s(`${CARD}; padding:20px 22px`)}>
          <div style={s(`${TITLE}; margin-bottom:8px`)}>Pays et packs</div>
          {data.countries.map((c) => (
            <div key={c.code} style={s("display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #f7efe8; font:500 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>
              <span style={s("font:700 12px 'Public Sans',sans-serif; background:#f2e8e0; color:#431420; padding:4px 8px; border-radius:5px")}>{c.code}</span>
              <span style={s("flex:1")}>{c.name}</span>
              <span style={s(`font:600 11.5px 'Public Sans',sans-serif; color:${c.active ? '#2f6e4b' : '#8a6f76'}`)}>{c.active ? 'Actif' : 'Inactif'}</span>
            </div>
          ))}
          <div style={s("margin-top:12px; font:400 12.5px/1.55 'Public Sans',sans-serif; color:#8a6f76")}>Nouveau pays : ajouter un fichier <code>server/packs/&lt;code&gt;.json</code> (libellés, téléphone, identifiant, langues, modèles, règles) puis ses organisations. Aucun code à modifier.</div>
        </div>
        <div style={s(`${CARD}; padding:20px 22px`)}>
          <div style={s(`${TITLE}; margin-bottom:8px`)}>Organisations</div>
          {list(data.orgs, ORG_LABEL)}
          <button onClick={() => app.go('organisations')} style={s("margin-top:12px; border:none; background:none; color:#8a1c2b; font:600 13px 'Public Sans',sans-serif; cursor:pointer; padding:0")}>Gérer les organisations →</button>
        </div>
        <div style={s(`${CARD}; padding:20px 22px`)}>
          <div style={s(`${TITLE}; margin-bottom:8px`)}>Comptes par rôle</div>
          {list(data.users, ROLE_LABEL)}
          <button onClick={() => app.go('utilisateurs')} style={s("margin-top:12px; border:none; background:none; color:#8a1c2b; font:600 13px 'Public Sans',sans-serif; cursor:pointer; padding:0")}>Gérer les comptes →</button>
        </div>
      </div>
      <div style={s(`${CARD}; padding:20px 22px; display:flex; flex-direction:column; gap:14px`)}>
        <div style={s(TITLE)}>Tâches planifiées et démonstration</div>
        <div style={s("font:400 13px/1.55 'Public Sans',sans-serif; color:#8a6f76")}>
          Passerelle SMS : <strong style={s("color:#431420")}>{data.gateway}</strong> (aucun SMS réel n'est envoyé). Les rappels partent chaque jour à l'heure fixée dans les règles ; les SMS restés sans réponse basculent en liste d'appel après le délai configuré. Ces boutons déclenchent les tâches tout de suite.
        </div>
        <div style={s("display:flex; gap:8px; flex-wrap:wrap")}>
          <button onClick={() => job('reminders', 'Rappels')} style={s(BTN_DARK)}>Lancer les rappels du jour</button>
          <button onClick={() => job('escalate', 'Bascule')} style={s(BTN_LINE)}>Basculer les sans-réponse</button>
          <button onClick={() => app.go('simulateur')} style={s(BTN_LINE)}>Ouvrir le simulateur SMS</button>
          <button onClick={reset} style={s(`${BTN_LINE}; margin-left:auto; border-color:#c8102e; color:#c8102e`)}>Réinitialiser les données de démo</button>
        </div>
      </div>
    </div>
  )
}
