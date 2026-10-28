import { useEffect, useState } from 'react'
import { s } from '../../style.js'
import { api, qs } from '../api.js'
import { fmtAt, fmtDay, rsty, sty, TONE } from '../format.js'
import { useLoad } from '../useLoad.js'
import { BTN_DARK, CAPTION, CARD, Empty, Loading, Pill, Row, Table, Tabs, Toggle, ellipsis } from '../ui.jsx'

function Alerte({ app, onSent }) {
  const site = app.me.sites[0]
  const [draft, setDraft] = useState({ group: app.params.group ?? 'O−', zone: site.zones[0] })
  const [prev, setPrev] = useState(null)
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let live = true
    setPrev(null)
    api.post('/campaigns/preview', { siteId: site.id, bloodGroup: draft.group, zone: draft.zone }).then((p) => live && setPrev(p)).catch((e) => app.flash(e.message))
    return () => { live = false }
  }, [draft.group, draft.zone, tick])

  const send = async () => {
    if (!prev?.count || busy) return
    setBusy(true)
    try {
      const c = await api.post('/campaigns', { siteId: site.id, bloodGroup: draft.group, zone: draft.zone })
      app.flash(c.sent + ' SMS envoyés · donneurs ' + draft.group + ' de ' + draft.zone)
      onSent()
      setTick((n) => n + 1)
    } catch (e) { app.flash(e.message) } finally { setBusy(false) }
  }
  const stat = (v, l, bg, fg) => (
    <div style={s(`background:${bg}; border-radius:8px; padding:12px 14px`)}>
      <div style={s(`font:600 26px 'Newsreader',serif; color:${fg}`)}>{v ?? '…'}</div>
      <div style={s(`font:500 12px 'Public Sans',sans-serif; color:${fg}`)}>{l}</div>
    </div>
  )
  const step = "font:600 12.5px 'Public Sans',sans-serif; color:#431420"

  return (
    <div style={s(`${CARD}; padding:22px; display:flex; flex-direction:column; gap:18px; min-width:0`)}>
      <div style={s("font:600 22px 'Newsreader',serif; color:#2b0d15")}>Nouvelle alerte</div>
      <div style={s("display:flex; flex-direction:column; gap:8px")}>
        <span style={s(step)}>1. Groupe sanguin</span>
        <div style={s("display:flex; gap:6px; flex-wrap:wrap")}>
          {app.me.country.bloodGroups.map((g) => (
            <Toggle key={g} bw={1.5} p={rsty(g === draft.group)} onClick={() => setDraft({ ...draft, group: g })} css="border-radius:6px; padding:8px 12px; font:700 13.5px 'Public Sans',sans-serif; min-width:52px">{g}</Toggle>
          ))}
        </div>
      </div>
      <div style={s("display:flex; flex-direction:column; gap:8px")}>
        <span style={s(step)}>2. {app.me.country.labels.zone}</span>
        <div style={s("display:flex; gap:6px; flex-wrap:wrap")}>
          {site.zones.map((z) => (
            <Toggle key={z} p={sty(z === draft.zone)} onClick={() => setDraft({ ...draft, zone: z })} css="border-radius:999px; padding:7px 14px; font:600 13px 'Public Sans',sans-serif; white-space:nowrap">{z}</Toggle>
          ))}
        </div>
        <span style={s("font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>Une alerte vise toujours un groupe et une zone, jamais tout le fichier.</span>
      </div>
      <div style={s("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px")}>
        {stat(prev?.count, 'donneurs aptes ciblés', '#e7f2ea', '#2f6e4b')}
        {stat(prev?.excludedNotApt, 'exclus · pas encore aptes', '#faf4ee', '#5c4048')}
        {stat(prev?.excludedCap, 'exclus · plafond mensuel atteint', '#faf4ee', '#5c4048')}
      </div>
      <div>
        <div style={s(`${CAPTION}; margin-bottom:8px`)}>3. Destinataires · les plus fidèles d'abord</div>
        <div style={s("border:1px solid #f0e4da; border-radius:8px; max-height:240px; overflow-y:auto")}>
          {prev?.targets.map((d) => (
            <div key={d.id} style={s("display:grid; grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) 70px; gap:10px; align-items:center; padding:9px 14px; border-bottom:1px solid #f7efe8; font:400 13px 'Public Sans',sans-serif; color:#5c4048")}>
              <span style={s(`font-weight:600; color:#2b0d15; ${ellipsis}`)}>{d.name}</span>
              <span style={s(ellipsis)}>{d.lastDonationDay ? 'Dernier don ' + fmtDay(d.lastDonationDay, { year: true }) : 'Jamais donné'}</span>
              <span style={s("text-align:right; font-weight:600; color:#431420")}>{d.donationCount} dons</span>
            </div>
          ))}
          {prev && prev.count === 0 && <Empty>Aucun donneur apte et sollicitable dans cette zone.</Empty>}
        </div>
      </div>
      {prev && (
        <div style={s("display:flex; flex-direction:column; gap:8px")}>
          <div style={s(CAPTION)}>SMS envoyé{prev.collecte ? ' · propose ' + prev.collecte : ''}</div>
          <div style={s("background:#431420; color:#f8ddcb; border-radius:12px 12px 12px 3px; padding:12px 14px; font:400 13.5px/1.55 'Public Sans',sans-serif; max-width:520px")}>{prev.preview}</div>
        </div>
      )}
      <div style={s("display:flex; align-items:center; gap:14px; flex-wrap:wrap; border-top:1px solid #f0e4da; padding-top:16px")}>
        <span style={s("flex:1; min-width:220px; font:400 12.5px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>SMS d'abord. Ceux qui ne répondent pas passent automatiquement dans la liste d'appel des opérateurs.</span>
        <button onClick={send} style={s(`background:${prev?.count && !busy ? '#c8102e' : '#d8c3b5'}; color:#fff; border:none; padding:13px 22px; border-radius:6px; font:600 14px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap`)}>{busy ? 'Envoi…' : 'Envoyer · ' + (prev?.count ?? 0) + ' SMS'}</button>
      </div>
    </div>
  )
}

function Recent({ app, list, reload }) {
  const escalate = async (id) => {
    try { const r = await api.post('/campaigns/' + id + '/escalate'); app.flash(r.transferred + ' donneurs ajoutés à la liste d’appel'); reload() } catch (e) { app.flash(e.message) }
  }
  return (
    <div style={s("display:flex; flex-direction:column; gap:12px")}>
      <div style={s("font:600 16px 'Public Sans',sans-serif; color:#2b0d15")}>Campagnes récentes</div>
      {list.length === 0 && <Empty>Aucune campagne pour l'instant.</Empty>}
      {list.map((a) => (
        <div key={a.id} style={s(`${CARD}; padding:16px 18px; display:flex; flex-direction:column; gap:12px; animation:floatin .3s ease`)}>
          <div style={s("display:flex; align-items:center; gap:10px")}>
            <span style={s(`font:700 14px 'Public Sans',sans-serif; color:#c8102e; background:#fbe9ec; padding:6px 10px; border-radius:6px; white-space:nowrap`)}>{a.type === 'ALERTE' ? a.bloodGroup : 'Rappel'}</span>
            <div style={s("flex:1; min-width:0")}>
              <div style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{a.type === 'ALERTE' ? 'Alerte · ' + a.zone : 'Rappels d’aptitude'}</div>
              <div style={s("font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>{fmtAt(a.createdAt)}</div>
            </div>
            <span style={s(`display:flex; align-items:center; gap:6px; font:600 11.5px 'Public Sans',sans-serif; color:${a.escalated ? '#3d8a5f' : '#c98a2b'}; white-space:nowrap`)}>
              <span style={s(`width:7px; height:7px; border-radius:50%; background:${a.escalated ? '#3d8a5f' : '#c98a2b'}; animation:${a.escalated ? 'none' : 'pulse 1.4s infinite'}`)}></span>
              {a.escalated ? 'Sans-réponse transférés' : 'En attente de réponses'}
            </span>
          </div>
          <div style={s("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; text-align:center")}>
            {[[a.sent, 'SMS', '#faf4ee', '#2b0d15', '#8a6f76'], [a.yes, 'ont répondu « 1 »', '#e7f2ea', '#2f6e4b', '#2f6e4b'], [a.transferred, 'en liste d’appel', '#fdf1dc', '#9a6a1e', '#9a6a1e']].map(([v, l, bg, fg, lfg]) => (
              <div key={l} style={s(`background:${bg}; border-radius:6px; padding:8px`)}>
                <div style={s(`font:600 18px 'Newsreader',serif; color:${fg}`)}>{v}</div>
                <div style={s(`font:400 11px 'Public Sans',sans-serif; color:${lfg}`)}>{l}</div>
              </div>
            ))}
          </div>
          {!a.escalated && (
            <button onClick={() => escalate(a.id)} style={s("align-self:flex-start; border:none; background:none; color:#8a1c2b; font:600 12.5px 'Public Sans',sans-serif; cursor:pointer; padding:0")}>Transférer les sans-réponse maintenant →</button>
          )}
        </div>
      ))}
    </div>
  )
}

function Rappels({ app }) {
  const { data, error, reload } = useLoad('/reminders' + qs({ siteId: app.siteId }), { poll: 5000 })
  if (!data) return <Loading error={error} />
  const cols = '1.5fr .5fr 1fr 2fr'
  const run = async () => {
    try { const r = await api.post('/campaigns/reminders', { siteId: app.siteId }); app.flash(r.sent ? r.sent + ' rappels envoyés' : 'Aucun rappel en attente : tout est déjà envoyé'); reload() } catch (e) { app.flash(e.message) }
  }
  const kpi = (label, value, note, color = '#2b0d15') => (
    <div style={s(`${CARD}; padding:16px 18px`)}>
      <div style={s("font:600 12.5px 'Public Sans',sans-serif; color:#5c4048")}>{label}</div>
      <div style={s(`font:600 28px 'Newsreader',serif; color:${color}; margin:4px 0 2px`)}>{value}</div>
      <div style={s("font:400 11.5px 'Public Sans',sans-serif; color:#8a6f76")}>{note}</div>
    </div>
  )
  return (
    <div style={s("display:flex; flex-direction:column; gap:18px")}>
      <div className="g-kpi5" style={s("display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px")}>
        <div style={s("background:#431420; border-radius:10px; padding:16px 18px; color:#f8ddcb")}>
          <div style={s("font:600 12.5px 'Public Sans',sans-serif; color:#f0a6b0")}>Envoi quotidien</div>
          <div style={s("font:600 28px 'Newsreader',serif; margin:4px 0 2px")}>{data.stats.hour} h 00</div>
          <div style={s("font:400 11.5px 'Public Sans',sans-serif; color:#d9b8a8")}>même si personne n'est connecté</div>
        </div>
        {kpi('Redevenus aptes · 7 jours', data.stats.total, 'dernier don + intervalle légal')}
        {kpi('Créneau réservé', data.stats.booked, 'réponse « 1 » ou appel', '#2f6e4b')}
        {kpi('Demain', data.stats.tomorrow, 'donneurs qui redeviennent aptes')}
      </div>
      <div style={s(`${CARD}; padding:18px 20px; min-width:0; display:flex; flex-direction:column; gap:12px`)}>
        <div style={s("display:flex; align-items:center; gap:12px; flex-wrap:wrap")}>
          <span style={s("flex:1; font:400 13px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>Calculés chaque jour à partir du dernier don et des règles nationales. Les sans-réponse passent en liste d'appel.</span>
          <button onClick={run} style={s(BTN_DARK)}>Envoyer les rappels maintenant</button>
        </div>
        <Table cols={cols} minWidth={640} head={['Donneur', 'Groupe', 'Apte depuis', 'Suivi']}>
          {data.rows.map((r) => (
            <Row key={r.id} cols={cols}>
              <span style={s(`font-weight:600; color:#2b0d15; ${ellipsis}`)}>{r.name}</span>
              <span style={s("font-weight:700; color:#c8102e")}>{r.bloodGroup}</span>
              <span>{fmtDay(r.sinceDay)}</span>
              <span style={s("display:flex; align-items:center; gap:8px; min-width:0")}><span style={s(`flex:none; width:8px; height:8px; border-radius:50%; background:${TONE[r.status.tone]}`)}></span><span style={s(ellipsis)}>{r.status.label}</span></span>
            </Row>
          ))}
          {data.rows.length === 0 && <Empty>Aucun donneur redevenu apte cette semaine.</Empty>}
        </Table>
      </div>
    </div>
  )
}

export default function Campagnes({ app }) {
  const [tab, setTab] = useState('alerte')
  const recent = useLoad('/campaigns' + qs({ siteId: app.siteId }), { poll: 5000 })
  return (
    <>
      <Tabs tabs={[['alerte', 'Alerte ciblée'], ['rappels', 'Rappels automatiques']]} value={tab} onChange={setTab} />
      {tab === 'alerte' ? (
        <div className="g-split" style={s("display:grid; grid-template-columns:minmax(0,1fr) 380px; gap:18px; align-items:start")}>
          <Alerte app={app} onSent={recent.reload} />
          {recent.data ? <Recent app={app} list={recent.data} reload={recent.reload} /> : <Loading error={recent.error} />}
        </div>
      ) : <Rappels app={app} />}
    </>
  )
}
