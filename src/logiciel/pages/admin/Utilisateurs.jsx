import { useState } from 'react'
import { s } from '../../../style.js'
import { api } from '../../api.js'
import { ROLE_LABEL } from '../../format.js'
import { useLoad } from '../../useLoad.js'
import { BTN_DARK, BTN_LINE, CARD, Field, INPUT, Loading, Pill, Row, Table, ellipsis } from '../../ui.jsx'

// Rôle → types d'organisation autorisés comme périmètre.
const SCOPES = { SUPER_ADMIN: [], PILOTE: ['NATIONAL', 'REGIONAL', 'SITE'], OPERATEUR: ['SITE'], DEMANDEUR: ['HOSPITAL'] }
const ROLE_NOTE = {
  SUPER_ADMIN: 'Toute la plateforme : pays, organisations, comptes.',
  PILOTE: 'National, régional ou un site : tableau de bord, campagnes, collectes, registre. Règles si national.',
  OPERATEUR: 'Un site : liste d’appel et pointage le jour de la collecte.',
  DEMANDEUR: 'Un établissement : signaler un besoin et suivre l’alerte.',
}

export default function Utilisateurs({ app }) {
  const users = useLoad('/admin/users')
  const orgs = useLoad('/admin/organisations')
  const [form, setForm] = useState(null)
  if (!users.data || !orgs.data) return <Loading error={users.error || orgs.error} />
  const cols = '1.4fr 1fr 1.4fr 1.6fr .7fr'
  const scopeOrgs = form ? orgs.data.filter((o) => SCOPES[form.role].includes(o.type)) : []

  const save = async () => {
    try {
      const body = { name: form.name, title: form.title, email: form.email, role: form.role, organisationId: form.role === 'SUPER_ADMIN' ? null : form.organisationId || null }
      if (form.id) await api.patch('/admin/users/' + form.id, body)
      else await api.post('/admin/users', body)
      app.flash(form.id ? 'Compte modifié' : 'Compte créé · disponible dans la liste de démonstration')
      setForm(null); users.reload()
    } catch (e) { app.flash(e.message) }
  }
  const toggle = async (u) => {
    try { await api.patch('/admin/users/' + u.id, { active: !u.active }); users.reload() } catch (e) { app.flash(e.message) }
  }

  return (
    <div style={s("display:flex; flex-direction:column; gap:16px")}>
      <div style={s("display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px")}>
        {Object.entries(ROLE_LABEL).map(([k, l]) => (
          <div key={k} style={s(`${CARD}; padding:14px 16px`)}>
            <div style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{l}</div>
            <div style={s("font:400 12px/1.5 'Public Sans',sans-serif; color:#8a6f76; margin-top:4px")}>{ROLE_NOTE[k]}</div>
          </div>
        ))}
      </div>
      <div style={s("display:flex; justify-content:flex-end")}>
        <button onClick={() => setForm(form ? null : { name: '', title: '', email: '', role: 'OPERATEUR', organisationId: '' })} style={s(BTN_DARK)}>{form ? 'Fermer' : '+ Compte'}</button>
      </div>
      {form && (
        <div style={s(`${CARD}; padding:18px 20px; display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; animation:floatin .3s ease`)}>
          <Field label="Nom"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={s(INPUT)} /></Field>
          <Field label="Fonction"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={s(INPUT)} /></Field>
          <Field label="E-mail"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={s(INPUT)} /></Field>
          <Field label="Rôle">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, organisationId: '' })} style={s(INPUT)}>
              {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          {form.role !== 'SUPER_ADMIN' && (
            <Field label="Périmètre">
              <select value={form.organisationId} onChange={(e) => setForm({ ...form, organisationId: e.target.value })} style={s(INPUT)}>
                <option value="">—</option>
                {scopeOrgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
          )}
          <div style={s("display:flex; align-items:flex-end; gap:8px")}>
            <button onClick={save} style={s(`${BTN_DARK}; flex:1`)}>{form.id ? 'Enregistrer' : 'Créer le compte'}</button>
            {form.id && <button onClick={() => setForm(null)} style={s(BTN_LINE)}>Annuler</button>}
          </div>
        </div>
      )}
      <div style={s(`${CARD}; padding:18px 20px; min-width:0`)}>
        <Table cols={cols} minWidth={780} head={['Nom', 'Rôle', 'Périmètre', 'E-mail', 'Statut']}>
          {users.data.map((u) => (
            <Row key={u.id} cols={cols} onClick={() => setForm({ id: u.id, name: u.name, title: u.title, email: u.email, role: u.role, organisationId: u.organisationId ?? '' })} active={form?.id === u.id}>
              <span style={s("min-width:0")}>
                <span style={s(`display:block; font-weight:600; color:#2b0d15; ${ellipsis}`)}>{u.name}</span>
                <span style={s(`display:block; font-size:12px; color:#8a6f76; ${ellipsis}`)}>{u.title}</span>
              </span>
              <span>{ROLE_LABEL[u.role]}</span>
              <span style={s(ellipsis)}>{u.organisation ?? 'Plateforme'}</span>
              <span style={s(ellipsis)}>{u.email}</span>
              <span onClick={(e) => { e.stopPropagation(); toggle(u) }} style={s("cursor:pointer")} title="Activer / désactiver">
                <Pill bg={u.active ? '#e7f2ea' : '#f2e8e0'} fg={u.active ? '#2f6e4b' : '#8a6f76'}>{u.active ? 'Actif' : 'Inactif'}</Pill>
              </span>
            </Row>
          ))}
        </Table>
      </div>
    </div>
  )
}
