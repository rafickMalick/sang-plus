import { useState } from 'react'
import { s } from '../../style.js'
import { api, qs } from '../api.js'
import { ELIG, P, fmtDay, fmtPhone, ini, sty } from '../format.js'
import { useLoad } from '../useLoad.js'
import { Avatar, CAPTION, CARD, Empty, GroupBadge, INPUT, Loading, Pill, Tabs, Toggle, ellipsis } from '../ui.jsx'

const RESULTS = [['RDV', 'Rendez-vous pris'], ['INJOIGNABLE', 'Injoignable'], ['INDISPONIBLE', 'Indisponible'], ['REFUS', 'Refus']]
const resStyle = (k) => (k === 'RDV' ? ['#e7f2ea', '#2f6e4b'] : k === 'REFUS' ? ['#f2e8e0', '#5c4048'] : ['#fdf1dc', '#9a6a1e'])

function Appels({ app, calls, reload }) {
  const [sel, setSel] = useState(null)
  const [rdv, setRdv] = useState(null)
  const collectes = useLoad('/collectes' + qs({ siteId: app.siteId }))
  const tasks = calls.tasks
  const cur = tasks.find((t) => t.id === sel) ?? tasks.find((t) => !t.result) ?? tasks[0]
  if (!cur) return <div style={s(`${CARD}; padding:22px`)}><Empty>Aucun donneur à appeler aujourd'hui.</Empty></div>
  const d = cur.donor
  const why = cur.reason.startsWith('Alerte')
    ? '« Les hôpitaux manquent de sang ' + d.bloodGroup + ' : pouvez-vous venir donner cette semaine ? »'
    : '« Vous pouvez à nouveau donner : une collecte a lieu près de chez vous. »'
  const openCols = (collectes.data ?? []).filter((c) => c.slots.some((sl) => !sl.past && sl.booked < sl.capacity))
  const rc = rdv && openCols.find((c) => c.id === rdv.col)

  const result = async (k) => {
    if (k === 'RDV') { setRdv(rdv ? null : { col: openCols[0]?.id, slot: null }); return }
    try { await api.post('/calls/' + cur.id, { result: k }); setRdv(null); reload() } catch (e) { app.flash(e.message) }
  }
  const confirm = async () => {
    if (!rc || rdv.slot == null) return
    try {
      await api.post('/calls/' + cur.id, { result: 'RDV', collecteId: rc.id, slotIndex: rdv.slot })
      app.flash('Rendez-vous noté · SMS de confirmation envoyé à ' + d.firstName)
      setRdv(null); reload(); collectes.reload()
    } catch (e) { app.flash(e.message) }
  }
  const next = () => { const n = tasks.find((t) => !t.result && t.id !== cur.id); setSel(n ? n.id : cur.id); setRdv(null) }

  return (
    <div className="g-console" style={s("display:grid; grid-template-columns:340px minmax(0,1fr); gap:18px; align-items:start")}>
      <div style={s(`${CARD}; padding:18px; display:flex; flex-direction:column; gap:12px`)}>
        <div style={s("display:flex; justify-content:space-between; align-items:baseline")}>
          <span style={s("font:600 15px 'Public Sans',sans-serif; color:#2b0d15")}>{calls.done} / {tasks.length} traités</span>
          <span style={s("font:500 12.5px 'Public Sans',sans-serif; color:#2f6e4b")}>{calls.rdv} rendez-vous</span>
        </div>
        <div style={s("height:8px; background:#f2e8e0; border-radius:999px; overflow:hidden")}>
          <div style={s(`height:100%; width:${Math.round((calls.done / Math.max(1, tasks.length)) * 100)}%; background:#3d8a5f; transition:width .3s`)}></div>
        </div>
        <div style={s("display:flex; flex-direction:column; gap:4px; max-height:560px; overflow-y:auto; margin:0 -6px; padding:0 6px")}>
          {tasks.map((t) => {
            const a = t.id === cur.id, rs = t.result ? resStyle(t.result) : null
            return (
              <div key={t.id} className="hover-cream" onClick={() => { setSel(t.id); setRdv(null) }} style={s(`display:flex; gap:12px; align-items:center; padding:10px 12px; border-radius:8px; cursor:pointer; background:${a ? '#fbf3ee' : '#fff'}; border:1px solid ${a ? '#c8102e' : 'transparent'}; opacity:${t.result && !a ? 0.6 : 1}`)}>
                <Avatar text={ini(t.donor.name)} size={36} font={12} light />
                <div style={s("flex:1; min-width:0")}>
                  <div style={s("display:flex; gap:8px; align-items:center")}>
                    <span style={s(`font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15; ${ellipsis}`)}>{t.donor.name}</span>
                    <span style={s("margin-left:auto; font:700 12px 'Public Sans',sans-serif; color:#c8102e")}>{t.donor.bloodGroup}</span>
                  </div>
                  <div style={s(`font:400 11.5px 'Public Sans',sans-serif; color:#8a6f76; ${ellipsis}`)}>{t.reason}</div>
                  {rs && <Pill bg={rs[0]} fg={rs[1]} css="display:inline-block; margin-top:4px; font-size:10.5px; padding:3px 8px">{t.resultLabel}</Pill>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={s(`${CARD}; padding:24px; display:flex; flex-direction:column; gap:18px; min-width:0`)}>
        <div style={s("display:flex; align-items:center; gap:14px; flex-wrap:wrap")}>
          <Avatar text={ini(d.name)} size={52} font={16} />
          <div style={s("flex:1; min-width:0")}>
            <div style={s("display:flex; align-items:center; gap:10px; flex-wrap:wrap")}>
              <span style={s("font:600 19px 'Public Sans',sans-serif; color:#2b0d15")}>{d.name}</span>
              <GroupBadge grp={d.bloodGroup} css="font:700 13px 'Public Sans',sans-serif; padding:4px 9px" />
            </div>
            <div style={s("font:400 13px 'Public Sans',sans-serif; color:#8a6f76; margin-top:3px")}>{d.zone} · {d.donationCount} dons · dernier don {d.lastDonationDay ? fmtDay(d.lastDonationDay, { year: true }) : 'jamais'} · parle {app.me.country.languages.find((l) => l.code === d.lang)?.label ?? d.lang}</div>
          </div>
        </div>
        <div style={s("background:#faf4ee; border:1px solid #f0e4da; border-radius:12px; padding:24px; display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center")}>
          <div style={s("font:600 34px 'Newsreader',serif; color:#2b0d15; font-variant-numeric:tabular-nums")}>{fmtPhone(d.phone)}</div>
          <a className="btn-red" href={'tel:' + d.phone} style={s("background:#c8102e; color:#fff; padding:13px 26px; border-radius:999px; font:600 14.5px 'Public Sans',sans-serif")}>Appeler depuis mon téléphone</a>
          <div style={s("font:400 12.5px/1.5 'Public Sans',sans-serif; color:#8a6f76; max-width:44ch")}>Sang+ ne passe pas l'appel : composez le numéro sur votre téléphone, puis notez le résultat ci-dessous.</div>
        </div>
        <div style={s("border:1px solid #f0e4da; border-radius:10px; padding:16px 18px")}>
          <div style={s(`${CAPTION}; margin-bottom:10px`)}>Script d'appel</div>
          <div style={s("display:flex; flex-direction:column; gap:8px; font:400 13.5px/1.5 'Public Sans',sans-serif; color:#5c4048")}>
            {[`« Bonjour ${d.firstName}, je vous appelle de l'${app.me.organisation?.name}. »`, why, 'Proposer un créneau ; la confirmation part par SMS.'].map((line, k) => (
              <div key={k} style={s("display:flex; gap:10px")}><span style={s("font:700 12px 'Public Sans',sans-serif; color:#c8102e; flex:none; width:16px")}>{k + 1}</span><span>{line}</span></div>
            ))}
          </div>
        </div>
        {!cur.result ? (
          <div style={s("display:flex; flex-direction:column; gap:10px")}>
            <div style={s(CAPTION)}>Résultat de l'appel</div>
            <div style={s("display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px")}>
              {RESULTS.map(([k, l]) => (
                <Toggle key={k} bw={1.5} p={k === 'RDV' && rdv ? P.green : P.off} onClick={() => result(k)} css="padding:12px; border-radius:8px; font:600 13.5px 'Public Sans',sans-serif">{l}</Toggle>
              ))}
            </div>
            {rdv && (
              <div style={s("border:1.5px solid #3d8a5f; border-radius:10px; padding:16px; display:flex; flex-direction:column; gap:12px; animation:floatin .25s ease")}>
                {openCols.length === 0 && <Empty>Aucune collecte avec des places libres.</Empty>}
                <div style={s("display:flex; gap:6px; flex-wrap:wrap")}>
                  {openCols.map((c) => (
                    <Toggle key={c.id} p={sty(rdv.col === c.id)} onClick={() => setRdv({ col: c.id, slot: null })} css="border-radius:999px; padding:7px 13px; font:600 12.5px 'Public Sans',sans-serif">{c.name + ' · ' + fmtDay(c.day)}</Toggle>
                  ))}
                </div>
                <div style={s("display:flex; gap:6px; flex-wrap:wrap")}>
                  {rc?.slots.filter((sl) => !sl.past && sl.booked < sl.capacity).slice(0, 12).map((sl) => (
                    <Toggle key={sl.index} p={rdv.slot === sl.index ? P.green : P.off} onClick={() => setRdv({ ...rdv, slot: sl.index })} css="border-radius:6px; padding:7px 11px; font:600 12.5px 'Public Sans',sans-serif">{sl.time + ' · ' + (sl.capacity - sl.booked) + ' pl.'}</Toggle>
                  ))}
                </div>
                <button onClick={confirm} style={s(`align-self:flex-start; background:${rc && rdv.slot != null ? '#3d8a5f' : '#a9c9b4'}; color:#fff; border:none; padding:11px 18px; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer`)}>
                  Confirmer · {rc && rdv.slot != null ? rc.name + ' · ' + rc.slots[rdv.slot].time : 'choisissez un créneau'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={s(`display:flex; align-items:center; gap:12px; flex-wrap:wrap; background:${resStyle(cur.result)[0]}; color:${resStyle(cur.result)[1]}; border-radius:10px; padding:14px 16px; font:600 14px 'Public Sans',sans-serif`)}>
            <span style={s("flex:1")}>{cur.resultLabel}</span>
            <button onClick={next} style={s("background:#431420; color:#f8ddcb; border:none; padding:10px 16px; border-radius:6px; font:600 13px 'Public Sans',sans-serif; cursor:pointer")}>Donneur suivant</button>
          </div>
        )}
      </div>
    </div>
  )
}

const ptStyle = { DON: ['Don confirmé', '#e7f2ea', '#2f6e4b'], ARRIVE: ['Arrivé', '#fdf1dc', '#9a6a1e'], AJOURNE: ['Ajourné', '#f2e8e0', '#5c4048'], ABSENT: ['Absent', '#f2e8e0', '#8a6f76'], PREVU: ['Attendu', '#fff', '#8a6f76'] }
const AJOURN = [[1, '1 mois'], [3, '3 mois'], [6, '6 mois'], [12, '12 mois']]

function Pointage({ app }) {
  const [colId, setColId] = useState(null)
  const { data, error, reload } = useLoad('/checkin' + qs({ siteId: app.siteId, collecteId: colId }))
  const [sel, setSel] = useState(null)
  const [q, setQ] = useState('')
  const [bag, setBag] = useState('')
  const [grp, setGrp] = useState(null)
  const found = useLoad(q.trim().length >= 2 && data?.current ? '/checkin/search' + qs({ siteId: app.siteId, collecteId: data.current.id, q: q.trim() }) : null)
  if (!data) return <Loading error={error} />
  if (!data.current) return <div style={s(`${CARD}; padding:22px`)}><Empty>Aucune collecte aujourd'hui sur ce site.</Empty></div>

  const row = data.rows.find((r) => r.id === sel)
  const act = async (body, msg) => {
    try { const r = await api.post('/checkin/' + row.id, body); if (msg) app.flash(msg(r)); reload() } catch (e) { app.flash(e.message) }
  }
  const walkin = async (d) => {
    try { const a = await api.post('/checkin/walkin', { collecteId: data.current.id, donorId: d.id }); setQ(''); setSel(a.id); setBag(''); setGrp(d.bloodGroup); reload() } catch (e) { app.flash(e.message) }
  }
  const st = data.stats
  const bagOk = bag.trim().length >= 4

  return (
    <div style={s("display:flex; flex-direction:column; gap:18px")}>
      {data.collectes.length > 1 && (
        <div style={s("display:flex; gap:6px; flex-wrap:wrap")}>
          {data.collectes.map((c) => <Toggle key={c.id} p={sty(c.id === data.current.id)} onClick={() => { setColId(c.id); setSel(null) }} css="border-radius:999px; padding:7px 14px; font:600 13px 'Public Sans',sans-serif">{c.name} · {c.hours}</Toggle>)}
        </div>
      )}
      <div className="g-kpi5" style={s("display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px")}>
        {[[st.expected, 'attendus', '#2b0d15'], [st.arrived, 'arrivés', '#2b0d15'], [st.donations, 'dons confirmés', '#2f6e4b'], [st.deferred, 'ajournés', '#5c4048']].map(([v, l, fg]) => (
          <div key={l} style={s(`${CARD}; padding:14px 18px`)}>
            <div style={s(`font:600 28px 'Newsreader',serif; color:${fg}`)}>{v}</div>
            <div style={s("font:500 12.5px 'Public Sans',sans-serif; color:#5c4048")}>{l}</div>
          </div>
        ))}
      </div>
      <div className="g-split" style={s("display:grid; grid-template-columns:minmax(0,1fr) 400px; gap:18px; align-items:start")}>
        <div style={s(`${CARD}; padding:18px 20px; display:flex; flex-direction:column; gap:12px; min-width:0`)}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={'Donneur sans rendez-vous : nom, téléphone ou ' + app.me.country.nationalId.label + '…'} style={s(INPUT)} />
          {q.trim().length >= 2 && (
            <div style={s("border:1px dashed #d8c3b5; border-radius:8px; padding:6px")}>
              {(found.data ?? []).map((d) => (
                <div key={d.id} style={s("display:flex; align-items:center; gap:10px; padding:8px 10px; font:400 13px 'Public Sans',sans-serif; color:#5c4048")}>
                  <span style={s(`flex:1; min-width:0; ${ellipsis}`)}><strong style={s("color:#2b0d15")}>{d.name}</strong> · {fmtPhone(d.phone)} · <span style={s("color:#c8102e; font-weight:700")}>{d.bloodGroup}</span> · {d.eligibility.label}</span>
                  <button onClick={() => walkin(d)} style={s("background:#431420; color:#f8ddcb; border:none; padding:7px 12px; border-radius:6px; font:600 12px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap")}>Pointer sans RDV</button>
                </div>
              ))}
              {found.data?.length === 0 && <div style={s("padding:10px; font:400 13px 'Public Sans',sans-serif; color:#8a6f76")}>Aucun donneur trouvé. Le pilote du site peut créer sa fiche au registre.</div>}
            </div>
          )}
          <div style={s(`${CAPTION}; margin-top:4px`)}>Rendez-vous · {data.current.name} · {data.current.hours}</div>
          <div style={s("display:flex; flex-direction:column")}>
            {data.rows.map((r) => {
              const c = ptStyle[r.status], a = sel === r.id
              return (
                <div key={r.id} className="hover-cream" onClick={() => { setSel(r.id); setBag(''); setGrp(r.donor.bloodGroup) }} style={s(`display:grid; grid-template-columns:64px minmax(0,1fr) 48px auto; gap:12px; align-items:center; padding:11px 12px; border-bottom:1px solid #f7efe8; cursor:pointer; background:${a ? '#fbf3ee' : '#fff'}; box-shadow:inset 3px 0 0 ${a ? '#c8102e' : 'transparent'}`)}>
                  <span style={s("font:700 13px 'Public Sans',sans-serif; color:#431420")}>{r.slot}</span>
                  <span style={s("min-width:0")}>
                    <span style={s(`display:block; font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15; ${ellipsis}`)}>{r.donor.name}</span>
                    <span style={s("display:block; font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>{fmtPhone(r.donor.phone)}</span>
                  </span>
                  <span style={s("font:700 13px 'Public Sans',sans-serif; color:#c8102e")}>{r.donor.bloodGroup}</span>
                  <Pill bg={c[1]} fg={c[2]} css="padding:5px 10px">{c[0]}</Pill>
                </div>
              )
            })}
            {data.rows.length === 0 && <Empty>Aucun rendez-vous pour cette collecte.</Empty>}
          </div>
        </div>

        <div style={s(`${CARD}; padding:22px; display:flex; flex-direction:column; gap:16px`)}>
          {!row && <Empty>Sélectionnez un donneur dans la liste.</Empty>}
          {row && (
            <>
              <div style={s("display:flex; align-items:center; gap:12px")}>
                <Avatar text={ini(row.donor.name)} />
                <div style={s("flex:1; min-width:0")}>
                  <div style={s("font:600 17px 'Public Sans',sans-serif; color:#2b0d15")}>{row.donor.name}</div>
                  <div style={s("font:400 12.5px 'Public Sans',sans-serif; color:#8a6f76")}>{fmtPhone(row.donor.phone)} · {app.me.country.nationalId.label} {row.donor.nationalId || '—'}</div>
                </div>
                <GroupBadge grp={row.donor.bloodGroup} />
              </div>
              {row.status === 'PREVU' && (
                <>
                  {!row.donor.eligibility.apte && <Pill bg={ELIG[row.donor.eligibility.kind][0]} fg={ELIG[row.donor.eligibility.kind][1]} css="align-self:flex-start; font-size:12px; padding:6px 12px">{row.donor.eligibility.label}</Pill>}
                  <button onClick={() => act({ action: 'arrive' })} style={s("background:#431420; color:#f8ddcb; border:none; padding:14px 0; border-radius:6px; font:600 14.5px 'Public Sans',sans-serif; cursor:pointer")}>Pointer l'arrivée</button>
                </>
              )}
              {row.status === 'ARRIVE' && (
                <>
                  <div style={s("border:1.5px solid #3d8a5f; border-radius:10px; padding:16px; display:flex; flex-direction:column; gap:10px")}>
                    <div style={s("font:600 14px 'Public Sans',sans-serif; color:#2f6e4b")}>Don effectué</div>
                    <input value={bag} onChange={(e) => setBag(e.target.value.toUpperCase())} placeholder="Numéro de poche, ex. CTN-26-048120" style={s(`${INPUT}; font-weight:500; letter-spacing:.02em`)} />
                    <label style={s("display:flex; align-items:center; gap:10px; font:500 13px 'Public Sans',sans-serif; color:#5c4048")}>Groupe confirmé
                      <select value={grp ?? row.donor.bloodGroup} onChange={(e) => setGrp(e.target.value)} style={s("flex:1; border:1px solid #e4d4c8; border-radius:6px; padding:9px; font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15; background:#fff")}>
                        {app.me.country.bloodGroups.map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </label>
                    <button disabled={!bagOk} onClick={() => act({ action: 'don', bagNumber: bag, bloodGroup: grp ?? row.donor.bloodGroup }, (r) => 'Don confirmé · fiche de ' + r.name + ' mise à jour')} style={s(`background:${bagOk ? '#3d8a5f' : '#a9c9b4'}; color:#fff; border:none; padding:12px 0; border-radius:6px; font:600 14px 'Public Sans',sans-serif; cursor:pointer`)}>Confirmer le don</button>
                  </div>
                  <div style={s("border:1px solid #f0e4da; border-radius:10px; padding:16px; display:flex; flex-direction:column; gap:10px")}>
                    <div style={s("font:600 14px 'Public Sans',sans-serif; color:#5c4048")}>Ajourné pour…</div>
                    <div style={s("display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px")}>
                      {AJOURN.map(([m, l]) => (
                        <button key={m} className="hover-cream" onClick={() => act({ action: 'ajourne', months: m }, (r) => r.name + ' · ' + r.donor.eligibility.label)} style={s("border:1px solid #e4d4c8; background:#fff; color:#431420; border-radius:6px; padding:9px; font:600 12.5px 'Public Sans',sans-serif; cursor:pointer")}>{l}</button>
                      ))}
                    </div>
                    <div style={s("font:400 11.5px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>Le motif n'est pas enregistré dans Sang+. Le donneur ne sera pas sollicité avant cette date.</div>
                  </div>
                </>
              )}
              {(row.status === 'DON' || row.status === 'AJOURNE') && (
                <div style={s(`background:${row.status === 'DON' ? '#e7f2ea' : '#f2e8e0'}; color:${row.status === 'DON' ? '#2f6e4b' : '#5c4048'}; border-radius:10px; padding:16px; font:500 13.5px/1.6 'Public Sans',sans-serif; animation:floatin .3s ease`)}>
                  <div style={s("font:600 15px 'Public Sans',sans-serif; margin-bottom:4px")}>{row.status === 'DON' ? 'Don confirmé' : 'Ajourné'}</div>
                  {row.donor.eligibility.label}. {row.status === 'DON' ? 'Un rappel partira automatiquement à cette date.' : 'Aucune sollicitation avant cette date.'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Journee({ app }) {
  const [tab, setTab] = useState('appels')
  const calls = useLoad('/calls' + qs({ siteId: app.siteId }), { poll: 8000 })
  const open = calls.data ? calls.data.tasks.filter((t) => !t.result).length : null
  return (
    <>
      <Tabs tabs={[['appels', 'Liste d’appel' + (open != null ? ' · ' + open : '')], ['pointage', 'Pointage du jour']]} value={tab} onChange={setTab} />
      {tab === 'appels' ? (calls.data ? <Appels app={app} calls={calls.data} reload={calls.reload} /> : <Loading error={calls.error} />) : <Pointage app={app} />}
    </>
  )
}
