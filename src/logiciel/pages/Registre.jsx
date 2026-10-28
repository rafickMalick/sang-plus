import { useRef, useState } from 'react'
import { s } from '../../style.js'
import { api, qs } from '../api.js'
import { ELIG, fmtDay, fmtPhone, ini, rsty, sty } from '../format.js'
import { useLoad } from '../useLoad.js'
import { Avatar, BTN_DARK, BTN_LINE, CAPTION, CARD, Empty, Field, GroupBadge, INPUT, Loading, Pill, Row, Table, Timeline, Toggle, ellipsis } from '../ui.jsx'

function DonorPanel({ app, id }) {
  const { data, error } = useLoad(id ? '/donors/' + id : null)
  if (!id) return <div style={s(`${CARD}; padding:22px`)}><Empty>Aucun donneur sélectionné.</Empty></div>
  if (!data) return <div style={s(`${CARD}; padding:22px`)}><Loading error={error} /></div>
  const c = app.me.country
  const e = ELIG[data.eligibility.kind]
  const facts = [
    [c.nationalId.label, data.nationalId || 'non renseigné'], [c.labels.zone, data.zone],
    ['Dernier don', data.lastDonationDay ? fmtDay(data.lastDonationDay, { year: true }) : 'jamais'], ['Nombre de dons', data.donationCount],
    ['Site', data.siteName], ['Sollicitations ce mois', data.contactsMonth + ' / ' + c.rules.monthlyContactCap],
    ['Langue', c.languages.find((l) => l.code === data.lang)?.label ?? data.lang], ['Sexe · naissance', (data.sex === 'F' ? 'F' : 'M') + (data.birthYear ? ' · ' + data.birthYear : '')],
  ]
  return (
    <div style={s(`${CARD}; padding:22px; display:flex; flex-direction:column; gap:16px`)}>
      <div style={s("display:flex; align-items:center; gap:12px")}>
        <Avatar text={ini(data.name)} />
        <div style={s("min-width:0; flex:1")}>
          <div style={s("font:600 17px 'Public Sans',sans-serif; color:#2b0d15")}>{data.name}</div>
          <div style={s("font:400 12.5px 'Public Sans',sans-serif; color:#8a6f76")}>{fmtPhone(data.phone)}</div>
        </div>
        <GroupBadge grp={data.bloodGroup} />
      </div>
      <Pill bg={e[0]} fg={e[1]} css="align-self:flex-start; font-size:12px; padding:6px 12px">{data.eligibility.label}</Pill>
      <div style={s("display:grid; grid-template-columns:1fr 1fr; gap:8px")}>
        {facts.map(([l, v]) => (
          <div key={l} style={s("background:#faf4ee; border-radius:8px; padding:10px 12px; min-width:0")}>
            <div style={s("font:400 11px 'Public Sans',sans-serif; color:#8a6f76")}>{l}</div>
            <div style={s(`font:600 13px 'Public Sans',sans-serif; color:#2b0d15; ${ellipsis}`)}>{v}</div>
          </div>
        ))}
      </div>
      <div>
        <div style={s(`${CAPTION}; margin-bottom:10px`)}>Historique</div>
        {data.timeline.length ? <Timeline items={data.timeline.map((x) => ({ t: x.text, m: fmtDay(x.day, { year: true }), tone: x.tone }))} /> : <Empty>Aucun échange enregistré.</Empty>}
      </div>
      <div style={s("background:#faf4ee; border-radius:8px; padding:12px 14px; font:400 12px/1.55 'Public Sans',sans-serif; color:#5c4048")}>Aucune donnée médicale : le questionnaire, l'examen et le motif d'un ajournement restent dans le circuit de l'{c.labels.national}.</div>
    </div>
  )
}

function NewDonor({ app, onDone }) {
  const c = app.me.country
  const site = app.me.sites[0]
  const [f, setF] = useState({ firstName: '', lastName: '', phone: c.phone.prefix + ' 01 ', nationalId: '', bloodGroup: 'O+', sex: 'F', birthYear: '', zone: site.zones[0], lang: 'fr', lastDonationDay: '' })
  const set = (p) => setF({ ...f, ...p })
  const save = async () => {
    try {
      const r = await api.post('/donors', { ...f, siteId: site.id, nationalId: f.nationalId || null, birthYear: f.birthYear ? Number(f.birthYear) : null, lastDonationDay: f.lastDonationDay || null })
      app.flash(r.result === 'created' ? 'Fiche créée' : 'Ce donneur existait déjà : fiche complétée')
      onDone()
    } catch (e) { app.flash(e.message) }
  }
  return (
    <div style={s(`${CARD}; padding:18px 20px; display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; animation:floatin .3s ease`)}>
      <Field label="Prénom"><input value={f.firstName} onChange={(e) => set({ firstName: e.target.value })} style={s(INPUT)} /></Field>
      <Field label="Nom"><input value={f.lastName} onChange={(e) => set({ lastName: e.target.value })} style={s(INPUT)} /></Field>
      <Field label="Téléphone"><input value={f.phone} onChange={(e) => set({ phone: e.target.value })} placeholder={c.phone.example} style={s(INPUT)} /></Field>
      <Field label={c.nationalId.label + (c.nationalId.required ? '' : ' (facultatif)')}><input value={f.nationalId} onChange={(e) => set({ nationalId: e.target.value })} style={s(INPUT)} /></Field>
      <Field label="Groupe"><select value={f.bloodGroup} onChange={(e) => set({ bloodGroup: e.target.value })} style={s(INPUT)}>{c.bloodGroups.map((g) => <option key={g}>{g}</option>)}</select></Field>
      <Field label="Sexe"><select value={f.sex} onChange={(e) => set({ sex: e.target.value })} style={s(INPUT)}><option value="F">Femme</option><option value="M">Homme</option></select></Field>
      <Field label="Année de naissance"><input value={f.birthYear} onChange={(e) => set({ birthYear: e.target.value.replace(/\D/g, '').slice(0, 4) })} style={s(INPUT)} /></Field>
      <Field label={c.labels.zone}><select value={f.zone} onChange={(e) => set({ zone: e.target.value })} style={s(INPUT)}>{site.zones.map((z) => <option key={z}>{z}</option>)}</select></Field>
      <Field label="Langue des SMS"><select value={f.lang} onChange={(e) => set({ lang: e.target.value })} style={s(INPUT)}>{c.languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select></Field>
      <Field label="Dernier don (facultatif)"><input type="date" value={f.lastDonationDay} onChange={(e) => set({ lastDonationDay: e.target.value })} style={s(INPUT)} /></Field>
      <div style={s("display:flex; align-items:flex-end")}><button onClick={save} style={s(`${BTN_DARK}; width:100%`)}>Enregistrer la fiche</button></div>
    </div>
  )
}

export default function Registre({ app }) {
  const c = app.me.country
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('Tous')
  const [status, setStatus] = useState('tous')
  const [sel, setSel] = useState(null)
  const [adding, setAdding] = useState(false)
  const [report, setReport] = useState(null)
  const file = useRef(null)
  const { data, error, reload } = useLoad('/donors' + qs({ siteId: app.me.national ? null : app.siteId, q, group, status }))
  const canEdit = !app.me.national
  const cols = '1.5fr 1.25fr .5fr 1fr 1fr 1.3fr 1fr'
  const current = sel ?? data?.rows[0]?.id

  const importFile = async (ev) => {
    const f = ev.target.files?.[0]
    ev.target.value = ''
    if (!f) return
    try {
      const r = await api.post('/donors/import', { siteId: app.siteId, csv: await f.text(), fileName: f.name })
      setReport({ ...r, fileName: f.name })
      app.flash(r.created + ' fiches créées · ' + r.merged + ' doublons fusionnés')
      reload()
    } catch (e) { app.flash(e.message) }
  }

  return (
    <div className="g-split" style={s("display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:18px; align-items:start")}>
      <div style={s("display:flex; flex-direction:column; gap:14px; min-width:0")}>
        {report && (
          <div style={s("background:#e7f2ea; border-radius:10px; padding:14px 18px; display:flex; gap:18px; flex-wrap:wrap; font:500 13px 'Public Sans',sans-serif; color:#2f6e4b; animation:floatin .3s ease")}>
            <strong>Import « {report.fileName} »</strong><span>{report.read} lignes lues</span><span>{report.created} nouvelles fiches</span><span>{report.merged} doublons fusionnés (téléphone ou {c.nationalId.label})</span>
            {report.errors.length > 0 && <span style={s("color:#9a6a1e")} title={report.errors.map((e) => 'Ligne ' + e.line + ' : ' + e.reason).join('\n')}>{report.errors.length} lignes rejetées</span>}
          </div>
        )}
        {adding && <NewDonor app={app} onDone={() => { setAdding(false); reload() }} />}
        <div style={s(`${CARD}; padding:18px 20px; min-width:0`)}>
          <div style={s("display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:12px")}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={'Nom, téléphone ou ' + c.nationalId.label + '…'} style={s(`${INPUT}; flex:1; min-width:200px`)} />
            {[['tous', 'Tous'], ['apte', 'Aptes'], ['non', 'Non aptes']].map(([id, l]) => (
              <Toggle key={id} p={sty(status === id)} onClick={() => setStatus(id)} css="border-radius:999px; padding:7px 13px; font:600 12.5px 'Public Sans',sans-serif; white-space:nowrap">{l}</Toggle>
            ))}
            {canEdit && (
              <>
                <button onClick={() => setAdding(!adding)} style={s(BTN_LINE)}>{adding ? 'Fermer' : '+ Donneur'}</button>
                <button onClick={() => file.current.click()} style={s(BTN_LINE)} title="CSV : prenom;nom;telephone;id_national;groupe;sexe;annee_naissance;commune;langue;dernier_don">Importer un fichier</button>
                <input ref={file} type="file" accept=".csv,text/csv" onChange={importFile} style={s("display:none")} />
              </>
            )}
          </div>
          <div style={s("display:flex; gap:5px; flex-wrap:wrap; margin-bottom:12px")}>
            {['Tous'].concat(c.bloodGroups).map((g) => (
              <Toggle key={g} p={rsty(g === group)} onClick={() => setGroup(g)} css="border-radius:5px; padding:5px 9px; font:700 12px 'Public Sans',sans-serif">{g}</Toggle>
            ))}
          </div>
          {!data ? <Loading error={error} /> : (
            <>
              <Table cols={cols} minWidth={780} head={['Nom', 'Téléphone', 'Groupe', c.labels.zone, 'Dernier don', 'Statut', app.me.national ? 'Site' : 'Sollicitations']}>
                <div style={s("max-height:520px; overflow-y:auto")}>
                  {data.rows.map((d) => {
                    const e = ELIG[d.eligibility.kind]
                    return (
                      <Row key={d.id} cols={cols} onClick={() => setSel(d.id)} active={d.id === current}>
                        <span style={s(`font-weight:600; color:#2b0d15; ${ellipsis}`)}>{d.name}</span>
                        <span style={s("white-space:nowrap; font-variant-numeric:tabular-nums")}>{fmtPhone(d.phone)}</span>
                        <span style={s("font-weight:700; color:#c8102e")}>{d.bloodGroup}</span>
                        <span style={s(ellipsis)}>{d.zone}</span>
                        <span style={s("white-space:nowrap")}>{d.lastDonationDay ? fmtDay(d.lastDonationDay, { year: true }) : '—'}</span>
                        <span><Pill bg={e[0]} fg={e[1]}>{d.eligibility.label}</Pill></span>
                        <span style={s(ellipsis)}>{app.me.national ? d.siteName?.replace('Antenne ANTS ', '') : d.contactsMonth + ' / ' + c.rules.monthlyContactCap + ' ce mois'}</span>
                      </Row>
                    )
                  })}
                  {data.rows.length === 0 && <Empty>Aucun donneur ne correspond.</Empty>}
                </div>
              </Table>
              <div style={s("margin-top:12px; font:400 12.5px 'Public Sans',sans-serif; color:#8a6f76")}>{data.total} fiches{data.total > data.rows.length ? ' · ' + data.rows.length + ' affichées, affinez la recherche' : ''} · un donneur = une fiche, dédoublonnée par téléphone et {c.nationalId.label}</div>
            </>
          )}
        </div>
      </div>
      <DonorPanel app={app} id={current} />
    </div>
  )
}
