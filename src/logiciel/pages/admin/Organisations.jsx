import { useState } from 'react'
import { s } from '../../../style.js'
import { api } from '../../api.js'
import { ORG_LABEL } from '../../format.js'
import { useLoad } from '../../useLoad.js'
import { BTN_DARK, BTN_LINE, CARD, Field, INPUT, Loading, Pill, Row, Table, ellipsis } from '../../ui.jsx'

const TYPE_STYLE = { NATIONAL: ['#431420', '#f8ddcb'], REGIONAL: ['#f2e8e0', '#431420'], SITE: ['#fdf1dc', '#9a6a1e'], HOSPITAL: ['#e7f2ea', '#2f6e4b'] }
const PARENT_TYPES = { REGIONAL: ['NATIONAL'], SITE: ['NATIONAL', 'REGIONAL'], HOSPITAL: ['SITE'] }

export default function Organisations({ app }) {
  const { data, error, reload } = useLoad('/admin/organisations')
  const [form, setForm] = useState(null)
  if (!data) return <Loading error={error} />
  const byId = Object.fromEntries(data.map((o) => [o.id, o]))
  const cols = '1.8fr 1fr 1fr 1.6fr .6fr .6fr'
  const parents = form ? data.filter((o) => (PARENT_TYPES[form.type] ?? []).includes(o.type)) : []

  const save = async () => {
    try {
      const body = { type: form.type, name: form.name, shortName: form.shortName || null, city: form.city || null, parentId: form.parentId || null, zones: form.zones.split(',').map((z) => z.trim()).filter(Boolean) }
      if (form.id) await api.patch('/admin/organisations/' + form.id, body)
      else await api.post('/admin/organisations', body)
      app.flash(form.id ? 'Organisation modifiée' : 'Organisation créée')
      setForm(null); reload()
    } catch (e) { app.flash(e.message) }
  }
  const edit = (o) => setForm({ id: o.id, type: o.type, name: o.name, shortName: o.shortName ?? '', city: o.city ?? '', parentId: o.parentId ?? '', zones: o.zones.join(', ') })

  return (
    <div style={s("display:flex; flex-direction:column; gap:16px")}>
      <div style={s("display:flex; gap:10px; align-items:center; flex-wrap:wrap")}>
        <span style={s("flex:1; font:400 13px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>Un arbre par pays : service national → (région) → sites de collecte → établissements demandeurs rattachés au site qui les fournit. Le périmètre d'un compte est un nœud de cet arbre.</span>
        <button onClick={() => setForm(form ? null : { type: 'SITE', name: '', shortName: '', city: '', parentId: data.find((o) => o.type === 'NATIONAL')?.id ?? '', zones: '' })} style={s(BTN_DARK)}>{form ? 'Fermer' : '+ Organisation'}</button>
      </div>
      {form && (
        <div style={s(`${CARD}; padding:18px 20px; display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; animation:floatin .3s ease`)}>
          <Field label="Type">
            <select value={form.type} disabled={!!form.id} onChange={(e) => setForm({ ...form, type: e.target.value, parentId: '' })} style={s(INPUT)}>
              {Object.entries(ORG_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field label="Nom"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={s(INPUT)} /></Field>
          <Field label="Sigle (facultatif)"><input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} style={s(INPUT)} /></Field>
          <Field label="Ville"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={s(INPUT)} /></Field>
          {form.type !== 'NATIONAL' && (
            <Field label="Rattachée à">
              <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} style={s(INPUT)}>
                <option value="">—</option>
                {parents.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
          )}
          {form.type === 'SITE' && <Field label={app.me.country.labels.zone + 's desservies (virgules)'} css="grid-column:span 2"><input value={form.zones} onChange={(e) => setForm({ ...form, zones: e.target.value })} placeholder="ex. Cotonou, Abomey-Calavi" style={s(INPUT)} /></Field>}
          <div style={s("display:flex; align-items:flex-end; gap:8px")}>
            <button onClick={save} style={s(`${BTN_DARK}; flex:1`)}>{form.id ? 'Enregistrer' : 'Créer'}</button>
            {form.id && <button onClick={() => setForm(null)} style={s(BTN_LINE)}>Annuler</button>}
          </div>
        </div>
      )}
      <div style={s(`${CARD}; padding:18px 20px; min-width:0`)}>
        <Table cols={cols} minWidth={820} head={['Nom', 'Type', 'Rattachée à', app.me.country.labels.zone + 's', 'Comptes', 'Donneurs']}>
          {data.map((o) => {
            const st = TYPE_STYLE[o.type]
            return (
              <Row key={o.id} cols={cols} onClick={() => edit(o)} active={form?.id === o.id}>
                <span style={s(`font-weight:600; color:#2b0d15; ${ellipsis}`)}>{o.name}{o.shortName ? ' · ' + o.shortName : ''}</span>
                <span><Pill bg={st[0]} fg={st[1]}>{ORG_LABEL[o.type]}</Pill></span>
                <span style={s(ellipsis)}>{o.parentId ? byId[o.parentId]?.name : '—'}</span>
                <span style={s(ellipsis)}>{o.zones.join(', ') || '—'}</span>
                <span>{o.users}</span>
                <span>{o.donors}</span>
              </Row>
            )
          })}
        </Table>
      </div>
    </div>
  )
}
