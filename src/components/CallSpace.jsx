import { useEffect, useRef, useState } from 'react'
import { s } from '../style.js'
import { CONTACTS, tplText, initials } from '../data.js'

const ON = { bg: '#431420', fg: '#f8ddcb', bd: '#431420' }
const OFF = { bg: '#ffffff', fg: '#431420', bd: '#e4d4c8' }
const sty = (a) => (a ? ON : OFF)
const DOTS = { dispo: '#3d8a5f', occupe: '#c98a2b', inelig: '#b09aa0' }
const DOT_TEXT = { dispo: '#2f6e4b', occupe: '#9a6a1e', inelig: '#8a6f76' }
const ST_COLORS = { 'A répondu OUI': ['#e7f2ea', '#2f6e4b'], 'Contacté': ['#fdf1dc', '#9a6a1e'], 'À rappeler': ['#fdf1dc', '#9a6a1e'], 'À contacter': ['#fbe9ec', '#a8283a'], 'Refus': ['#f2e8e0', '#5c4048'], 'Injoignable': ['#f2e8e0', '#5c4048'] }
const TONE_DOT = { ok: '#3d8a5f', warn: '#c98a2b', red: '#c8102e', muted: '#b09aa0' }
const RESET = { phase: 'idle', secs: 0, outcome: null, draft: null, notes: '', muted: false, speaker: false }
const OUTCOMES = [
  { id: 'oui', label: 'Accepte · inscrit à la collecte', status: 'A répondu OUI', tone: 'ok' },
  { id: 'rappel', label: 'À rappeler plus tard', status: 'À rappeler', tone: 'warn' },
  { id: 'refus', label: 'Ne souhaite pas donner', status: 'Refus', tone: 'muted' },
  { id: 'nrp', label: 'Pas de réponse', status: 'Injoignable', tone: 'muted' },
]
const TPLS = [['invit', 'Invitation collecte'], ['rappel', 'Rappel RDV'], ['merci', 'Remerciement']]
const GROUPS = ['Tous', 'O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB+']
const AVAIL = [['dispo', 'Disponibles'], ['occupe', 'Occupés'], ['inelig', 'Non éligibles'], ['tous', 'Tous']]

const mm = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0')
const LABEL = "font:600 10.5px 'Public Sans',sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#8a6f76"

function Stat({ label, value, wide }) {
  return (
    <div style={s(`${wide ? 'grid-column:1 / -1; ' : ''}background:#fff; border:1px solid #f0e4da; border-radius:8px; padding:10px 12px`)}>
      <div style={s("font:400 10.5px 'Public Sans',sans-serif; color:#8a6f76")}>{label}</div>
      <div style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{value}</div>
    </div>
  )
}

export default function CallSpace() {
  const [c, setState] = useState({ sel: 0, mode: 'appel', phase: 'idle', secs: 0, ringAt: 0, muted: false, speaker: false, outcome: null, avail: 'dispo', grp: 'Tous', q: '', tpl: 'invit', draft: null, notes: '', threads: {}, history: {}, statuses: {} })
  const setC = (p) => setState((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }))
  const timeouts = useRef([])
  const later = (ms, fn) => timeouts.current.push(setTimeout(fn, ms))

  useEffect(() => {
    const tick = setInterval(() => {
      setState((prev) => {
        if (prev.phase === 'ringing' && Date.now() - prev.ringAt > 2800) return { ...prev, phase: 'live', secs: 0 }
        if (prev.phase === 'live') return { ...prev, secs: prev.secs + 1 }
        return prev
      })
    }, 1000)
    return () => { clearInterval(tick); timeouts.current.forEach(clearTimeout) }
  }, [])

  const q = c.q.trim().toLowerCase()
  const indexed = CONTACTS.map((x, i) => ({ ...x, i }))
  const matchBase = (x, st) => (st.grp === 'Tous' || x.groupe === st.grp) && (!q || x.name.toLowerCase().includes(q) || x.commune.toLowerCase().includes(q))
  const visibleOf = (st) => indexed.filter((x) => matchBase(x, st) && (st.avail === 'tous' || x.dispo === st.avail))
  const items = visibleOf(c)

  const i = c.sel
  const ct = CONTACTS[i]
  const status = c.statuses[i] || ct.status
  const sc = ST_COLORS[status] || ST_COLORS['Contacté']
  const first = ct.name.split(' ')[0]
  const draft = c.draft == null ? tplText(c.tpl, ct) : c.draft
  const thread = c.threads[i] || ct.seed.map((m) => ({ dir: m.dir, text: m.text || tplText(m.key, ct), time: m.time, st: m.dir === 'out' ? 'Livré' : '' }))
  const addHist = (st, e) => ({ ...st.history, [i]: [e].concat(st.history[i] || []) })
  const lineBusy = c.phase === 'ringing' || c.phase === 'live'
  const lineColor = lineBusy ? '#e8b078' : '#8fbf8a'
  const lineName = 'ANTS ' + (ct.ville === 'Parakou' ? 'Parakou' : 'Cotonou')
  const hasWarn = !!ct.warn
  const warnBg = ct.dispo === 'inelig' ? '#f2e8e0' : '#fdf1dc'
  const warnFg = ct.dispo === 'inelig' ? '#5c4048' : '#7a5414'
  const tab = (a) => (a ? { bg: '#fff', fg: '#2b0d15' } : { bg: 'transparent', fg: '#8a6f76' })
  const modeCall = tab(c.mode === 'appel')
  const modeSms = tab(c.mode === 'sms')
  const hist = (c.history[i] || []).concat(ct.hist)

  const start = () => setC({ phase: 'ringing', ringAt: Date.now(), secs: 0, outcome: null })
  const hangup = () => setC((st) => ({ phase: 'ended', outcome: st.phase === 'ringing' ? 'nrp' : st.outcome }))

  const save = () => setState((st) => {
    const o = OUTCOMES.find((x) => x.id === st.outcome)
    const dur = st.secs > 0 ? ' · ' + mm(st.secs) : ''
    const e = { t: 'Appel' + dur + ' · ' + o.label.toLowerCase() + (st.notes ? ' — « ' + st.notes + ' »' : ''), m: "À l'instant", tone: o.tone }
    const visible = visibleOf(st).map((x) => x.i)
    const pos = visible.indexOf(i)
    const next = pos >= 0 && pos < visible.length - 1 ? visible[pos + 1] : i
    return { ...st, ...RESET, history: addHist(st, e), statuses: { ...st.statuses, [i]: o.status }, sel: next }
  })

  const send = () => {
    if (!draft.trim()) return
    const msgIdx = thread.length
    const tpl = c.tpl
    setState((st) => {
      const cur = st.statuses[i] || ct.status
      return {
        ...st,
        draft: '',
        threads: { ...st.threads, [i]: thread.concat([{ dir: 'out', text: draft, time: "À l'instant", st: 'Envoyé' }]) },
        history: addHist(st, { t: 'SMS envoyé · ' + (tpl === 'invit' ? 'invitation collecte' : tpl === 'rappel' ? 'rappel RDV' : 'remerciement'), m: "À l'instant", tone: 'muted' }),
        statuses: { ...st.statuses, [i]: cur === 'À contacter' ? 'Contacté' : cur },
      }
    })
    later(1200, () => setState((st) => ({ ...st, threads: { ...st.threads, [i]: (st.threads[i] || []).map((m, k) => (k === msgIdx ? { ...m, st: 'Livré' } : m)) } })))
    if (ct.dispo === 'dispo' && tpl === 'invit') {
      later(3400, () => setState((st) => ({
        ...st,
        threads: { ...st.threads, [i]: (st.threads[i] || []).concat([{ dir: 'in', text: 'OUI', time: "à l'instant" }]) },
        history: { ...st.history, [i]: [{ t: 'SMS · a répondu OUI', m: "À l'instant", tone: 'ok' }].concat(st.history[i] || []) },
        statuses: { ...st.statuses, [i]: 'A répondu OUI' },
      })))
    }
  }

  return (
    <div id="appel" className="sp-call-outer" style={s("background:#faf4ee; padding:84px 56px; box-sizing:border-box")}>
      <div style={s("max-width:1400px; margin:0 auto")}>
        <div style={s("text-align:center; margin-bottom:40px")}>
          <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#c8102e; margin-bottom:14px")}>Espace d'appel</div>
          <h2 className="sp-call-h2" style={s("font:600 40px/1.15 'Newsreader',serif; color:#2b0d15; margin:0 0 12px; text-wrap:pretty")}>Le bon donneur, au bon moment, au bout du fil</h2>
          <p style={s("font:400 15.5px/1.6 'Public Sans',sans-serif; color:#5c4048; margin:0 auto; max-width:64ch; text-wrap:pretty")}>Filtrez les donneurs disponibles et éligibles, puis appelez-les ou écrivez-leur directement depuis le navigateur. <strong style={s("color:#431420")}>Choisissez un donneur et lancez un appel.</strong></p>
        </div>

        <div style={s("background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 30px 80px rgba(43,13,21,.2); border:1px solid #e4d4c8")}>
          <div style={s("display:flex; align-items:center; gap:8px; padding:12px 18px; background:#2b0d15")}>
            <span style={s("width:11px;height:11px;border-radius:50%;background:#e0656f")}></span>
            <span style={s("width:11px;height:11px;border-radius:50%;background:#e8b078")}></span>
            <span style={s("width:11px;height:11px;border-radius:50%;background:#8fbf8a")}></span>
            <div style={s("flex:1; display:flex; justify-content:center; min-width:0")}>
              <span className="sp-call-url" style={s("background:#431420; color:#d9b8a8; font:400 12px 'Public Sans',sans-serif; padding:6px 40px; border-radius:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis")}>app.sang-plus.org/appels</span>
            </div>
            <span style={s(`display:flex; align-items:center; gap:6px; font:600 11px 'Public Sans',sans-serif; color:${lineColor}; white-space:nowrap`)}><span style={s(`width:7px;height:7px;border-radius:50%;background:${lineColor}`)}></span>{lineBusy ? 'EN APPEL' : 'LIGNE PRÊTE'}</span>
          </div>

          <div className="sp-call" style={s("display:grid; grid-template-columns:320px minmax(0,1fr) 290px; min-height:600px")}>
            {/* liste */}
            <div className="sp-call-list" style={s("border-right:1px solid #f0e4da; padding:18px; display:flex; flex-direction:column; gap:12px; min-width:0; background:#fff")}>
              <input value={c.q} onChange={(e) => setC({ q: e.target.value })} placeholder="Nom ou commune…" style={s("width:100%; box-sizing:border-box; border:1px solid #e4d4c8; border-radius:6px; padding:10px 12px; font:400 13.5px 'Public Sans',sans-serif; color:#2b0d15; background:#faf4ee; outline:none")} />
              <div style={s("display:flex; flex-wrap:wrap; gap:6px")}>
                {AVAIL.map(([id, label]) => {
                  const p = sty(c.avail === id)
                  const n = indexed.filter((x) => matchBase(x, c) && (id === 'tous' || x.dispo === id)).length
                  return <button key={id} onClick={() => setC({ avail: id })} style={s(`border:1px solid ${p.bd}; background:${p.bg}; color:${p.fg}; border-radius:999px; padding:6px 12px; font:600 12px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap`)}>{label} · {n}</button>
                })}
              </div>
              <div style={s("display:flex; align-items:center; gap:6px; flex-wrap:wrap")}>
                <span style={s(`${LABEL}; margin-right:2px`)}>Groupe</span>
                {GROUPS.map((g) => {
                  const p = g === c.grp ? { bg: '#c8102e', fg: '#fff', bd: '#c8102e' } : { bg: '#fff', fg: '#c8102e', bd: '#f0d4d9' }
                  return <button key={g} onClick={() => setC({ grp: g })} style={s(`border:1px solid ${p.bd}; background:${p.bg}; color:${p.fg}; border-radius:5px; padding:4px 8px; font:700 11.5px 'Public Sans',sans-serif; cursor:pointer`)}>{g}</button>
                })}
              </div>
              <div className="sp-call-items" style={s("display:flex; flex-direction:column; gap:4px; overflow-y:auto; max-height:470px; margin:0 -6px; padding:0 6px")}>
                {items.map((x) => {
                  const a = x.i === c.sel
                  return (
                    <div key={x.name} className="hover-cream" onClick={() => setC({ sel: x.i, ...RESET })} style={s(`display:flex; gap:12px; align-items:center; padding:10px 12px; border-radius:8px; cursor:pointer; background:${a ? '#fbf3ee' : '#ffffff'}; border:1px solid ${a ? '#c8102e' : 'transparent'}`)}>
                      <span style={s("position:relative; flex:none; width:38px; height:38px; border-radius:50%; background:#f2e8e0; color:#431420; display:flex; align-items:center; justify-content:center; font:600 12.5px 'Public Sans',sans-serif")}>
                        {initials(x.name)}
                        <span style={s(`position:absolute; right:-1px; bottom:-1px; width:11px; height:11px; border-radius:50%; background:${DOTS[x.dispo]}; border:2px solid #fff`)}></span>
                      </span>
                      <div style={s("flex:1; min-width:0")}>
                        <div style={s("display:flex; align-items:center; gap:8px")}>
                          <span style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15; overflow:hidden; text-overflow:ellipsis; white-space:nowrap")}>{x.name}</span>
                          <span style={s("margin-left:auto; font:700 12px 'Public Sans',sans-serif; color:#c8102e")}>{x.groupe}</span>
                        </div>
                        <div style={s("font:400 12px 'Public Sans',sans-serif; color:#8a6f76; overflow:hidden; text-overflow:ellipsis; white-space:nowrap")}>{x.commune} · {x.levelName} · {x.dons}{x.dons > 1 ? ' dons' : ' don'}</div>
                        <div style={s(`font:500 11.5px 'Public Sans',sans-serif; color:${DOT_TEXT[x.dispo]}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`)}>{x.availText}</div>
                      </div>
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <div style={s("padding:26px 10px; text-align:center; font:400 13px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>Aucun donneur ne correspond à ces filtres.</div>
                )}
              </div>
            </div>

            {/* poste de travail */}
            <div className="sp-call-work" style={s("padding:22px 26px; display:flex; flex-direction:column; gap:18px; min-width:0")}>
              <div className="sp-call-head" style={s("display:flex; align-items:center; gap:14px")}>
                <span style={s("flex:none; width:52px; height:52px; border-radius:50%; background:#431420; color:#f8ddcb; display:flex; align-items:center; justify-content:center; font:600 16px 'Public Sans',sans-serif")}>{initials(ct.name)}</span>
                <div style={s("min-width:0; flex:1")}>
                  <div style={s("display:flex; align-items:center; gap:10px; flex-wrap:wrap")}>
                    <span style={s("font:600 19px 'Public Sans',sans-serif; color:#2b0d15")}>{ct.name}</span>
                    <span style={s("font:700 13px 'Public Sans',sans-serif; color:#c8102e; background:#fbe9ec; padding:4px 9px; border-radius:6px")}>{ct.groupe}</span>
                    <span style={s(`font:600 11px 'Public Sans',sans-serif; padding:4px 10px; border-radius:999px; background:${sc[0]}; color:${sc[1]}; white-space:nowrap`)}>{status}</span>
                  </div>
                  <div style={s("font:400 13px 'Public Sans',sans-serif; color:#8a6f76; margin-top:3px")}>{ct.phone} · {ct.commune} · parle <span style={s("text-transform:capitalize")}>{ct.lang}</span></div>
                </div>
              </div>

              <div style={s("display:flex; gap:4px; background:#f2e8e0; padding:4px; border-radius:8px; width:fit-content")}>
                <button onClick={() => setC({ mode: 'appel' })} style={s(`border:none; background:${modeCall.bg}; color:${modeCall.fg}; padding:9px 22px; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap`)}>Appel</button>
                <button onClick={() => setC({ mode: 'sms' })} style={s(`border:none; background:${modeSms.bg}; color:${modeSms.fg}; padding:9px 22px; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap`)}>SMS</button>
              </div>
              {c.mode === 'sms' && lineBusy && (
                <div onClick={() => setC({ mode: 'appel' })} style={s("display:flex; align-items:center; gap:10px; background:#e7f2ea; color:#2f6e4b; border-radius:8px; padding:10px 14px; font:600 13px 'Public Sans',sans-serif; cursor:pointer")}>
                  <span style={s("width:8px;height:8px;border-radius:50%;background:#3d8a5f; animation:pulse 1.6s infinite")}></span>
                  Appel en cours avec {first} · {mm(c.secs)}
                  <span style={s("margin-left:auto; text-decoration:underline")}>Revenir à l'appel</span>
                </div>
              )}

              {hasWarn && (
                <div style={s(`background:${warnBg}; color:${warnFg}; border-radius:8px; padding:11px 14px; font:500 13px/1.5 'Public Sans',sans-serif`)}>{ct.warn}</div>
              )}

              {c.mode === 'appel' && (
                <>
                  <div style={s("border:1px solid #f0e4da; border-radius:12px; padding:30px 20px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px; background:#faf4ee")}>
                    {c.phase === 'idle' && (
                      <>
                        <div style={s("font:600 30px 'Newsreader',serif; color:#2b0d15")}>{ct.phone}</div>
                        <div style={s("font:400 13px 'Public Sans',sans-serif; color:#8a6f76")}>Via {ct.operator} · ligne {lineName}</div>
                        <button className="btn-red" onClick={start} style={s("margin-top:6px; background:#c8102e; color:#fff; border:none; padding:14px 34px; border-radius:999px; font:600 15px 'Public Sans',sans-serif; cursor:pointer")}>Appeler {first}</button>
                      </>
                    )}
                    {c.phase === 'ringing' && (
                      <>
                        <div style={s("width:84px; height:84px; border-radius:50%; background:#431420; color:#f8ddcb; display:flex; align-items:center; justify-content:center; font:600 24px 'Public Sans',sans-serif; animation:ring 1.2s infinite")}>{initials(ct.name)}</div>
                        <div style={s("font:600 18px 'Public Sans',sans-serif; color:#2b0d15")}>Appel en cours…</div>
                        <div style={s("font:400 13px 'Public Sans',sans-serif; color:#8a6f76; animation:pulse 1.6s infinite")}>Sonnerie · {ct.phone}</div>
                        <button onClick={hangup} style={s("background:#2b0d15; color:#fff; border:none; padding:12px 30px; border-radius:999px; font:600 14px 'Public Sans',sans-serif; cursor:pointer")}>Annuler</button>
                      </>
                    )}
                    {c.phase === 'live' && (
                      <>
                        <div style={s("display:flex; align-items:center; gap:8px; font:600 12px 'Public Sans',sans-serif; color:#3d8a5f")}><span style={s("width:8px;height:8px;border-radius:50%;background:#3d8a5f; animation:pulse 1.6s infinite")}></span>En communication · {ct.operator}</div>
                        <div style={s("font:600 46px 'Newsreader',serif; color:#2b0d15; font-variant-numeric:tabular-nums")}>{mm(c.secs)}</div>
                        <div className="sp-call-ctrls" style={s("display:flex; gap:10px; flex-wrap:wrap; justify-content:center")}>
                          {[[c.muted, c.muted ? 'Micro coupé' : 'Couper le micro', () => setC({ muted: !c.muted })], [c.speaker, 'Haut-parleur', () => setC({ speaker: !c.speaker })]].map(([on, label, pick]) => {
                            const p = sty(on)
                            return <button key={label} onClick={pick} style={s(`border:1.5px solid ${p.bd}; background:${p.bg}; color:${p.fg}; padding:11px 20px; border-radius:999px; font:600 13px 'Public Sans',sans-serif; cursor:pointer`)}>{label}</button>
                          })}
                          <button onClick={hangup} style={s("border:1.5px solid #c8102e; background:#c8102e; color:#fff; padding:11px 24px; border-radius:999px; font:600 13px 'Public Sans',sans-serif; cursor:pointer")}>Raccrocher</button>
                        </div>
                        <textarea value={c.notes} onChange={(e) => setC({ notes: e.target.value })} placeholder="Notes d'appel (visibles par l'équipe)…" style={s("width:100%; max-width:480px; box-sizing:border-box; min-height:64px; border:1px solid #e4d4c8; border-radius:8px; padding:10px 12px; font:400 13px/1.5 'Public Sans',sans-serif; color:#2b0d15; background:#fff; resize:vertical; outline:none")} />
                      </>
                    )}
                    {c.phase === 'ended' && (
                      <>
                        <div style={s("font:600 18px 'Public Sans',sans-serif; color:#2b0d15")}>Appel terminé · {mm(c.secs)}</div>
                        <div style={s("font:400 13px 'Public Sans',sans-serif; color:#8a6f76")}>Quel est le résultat de l'appel ?</div>
                        <div style={s("display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:8px; width:100%; max-width:520px")}>
                          {OUTCOMES.map((o) => {
                            const p = sty(c.outcome === o.id)
                            return <button key={o.id} onClick={() => setC({ outcome: o.id })} style={s(`border:1.5px solid ${p.bd}; background:${p.bg}; color:${p.fg}; padding:11px 12px; border-radius:8px; font:600 13px 'Public Sans',sans-serif; cursor:pointer; text-align:left`)}>{o.label}</button>
                          })}
                        </div>
                        {c.outcome && (
                          <button onClick={save} style={s("background:#431420; color:#f8ddcb; border:none; padding:12px 30px; border-radius:6px; font:600 14px 'Public Sans',sans-serif; cursor:pointer")}>Enregistrer et passer au suivant</button>
                        )}
                      </>
                    )}
                  </div>
                  <div style={s("border:1px solid #f0e4da; border-radius:10px; padding:16px 18px")}>
                    <div style={s(`${LABEL}; margin-bottom:10px`)}>Script d'appel · <span style={s("text-transform:capitalize")}>{ct.lang}</span></div>
                    <div style={s("display:flex; flex-direction:column; gap:8px; font:400 13.5px/1.5 'Public Sans',sans-serif; color:#5c4048")}>
                      {[
                        `Se présenter : « Sang+, au nom de l’Antenne ANTS de ${ct.ville} ».`,
                        `Annoncer la collecte du samedi 14 septembre, 8h–16h — besoin urgent en ${ct.groupe}.`,
                        'Proposer un créneau, confirmer par SMS.',
                      ].map((line, k) => (
                        <div key={k} style={s("display:flex; gap:10px")}><span style={s("font:700 12px 'Public Sans',sans-serif; color:#c8102e; flex:none; width:16px")}>{k + 1}</span><span>{line}</span></div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {c.mode === 'sms' && (
                <>
                  <div style={s("border:1px solid #f0e4da; border-radius:12px; padding:16px; background:#faf4ee; display:flex; flex-direction:column; gap:8px; min-height:200px; max-height:280px; overflow-y:auto")}>
                    {thread.map((m, k) => {
                      const out = m.dir === 'out'
                      return (
                        <div key={k} style={s(`display:flex; flex-direction:column; align-items:${out ? 'flex-end' : 'flex-start'}; gap:3px`)}>
                          <div style={s(`max-width:80%; background:${out ? '#431420' : '#ffffff'}; color:${out ? '#f8ddcb' : '#2b0d15'}; border-radius:${out ? '12px 12px 3px 12px' : '12px 12px 12px 3px'}; padding:10px 13px; font:400 13px/1.5 'Public Sans',sans-serif; animation:floatin .3s ease`)}>{m.text}</div>
                          <div style={s("font:400 11px 'Public Sans',sans-serif; color:#8a6f76")}>{out ? m.time + ' · ' + m.st : first + ' · ' + m.time}</div>
                        </div>
                      )
                    })}
                    {thread.length === 0 && (
                      <div style={s("margin:auto; font:400 13px 'Public Sans',sans-serif; color:#8a6f76")}>Aucun échange avec ce donneur pour l'instant.</div>
                    )}
                  </div>
                  <div style={s("display:flex; gap:6px; flex-wrap:wrap; align-items:center")}>
                    <span style={s(`${LABEL}; margin-right:4px`)}>Modèles</span>
                    {TPLS.map(([id, label]) => {
                      const p = sty(c.tpl === id)
                      return <button key={id} onClick={() => setC({ tpl: id, draft: null })} style={s(`border:1px solid ${p.bd}; background:${p.bg}; color:${p.fg}; border-radius:999px; padding:6px 12px; font:600 12px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap`)}>{label}</button>
                    })}
                  </div>
                  <textarea value={draft} onChange={(e) => setC({ draft: e.target.value })} style={s("width:100%; box-sizing:border-box; min-height:96px; border:1px solid #e4d4c8; border-radius:8px; padding:12px 14px; font:400 13.5px/1.55 'Public Sans',sans-serif; color:#2b0d15; background:#fff; resize:vertical; outline:none")} />
                  <div style={s("display:flex; align-items:center; gap:12px; flex-wrap:wrap")}>
                    <span style={s("font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>{draft.length} caractères · {Math.max(1, Math.ceil(draft.length / 160))} SMS · via {ct.operator}</span>
                    <button className="btn-red" onClick={send} style={s("margin-left:auto; background:#c8102e; color:#fff; border:none; padding:12px 26px; border-radius:6px; font:600 14px 'Public Sans',sans-serif; cursor:pointer")}>Envoyer à {first}</button>
                  </div>
                </>
              )}
            </div>

            {/* fiche */}
            <div className="sp-call-rail" style={s("border-left:1px solid #f0e4da; background:#faf4ee; padding:22px 20px; display:flex; flex-direction:column; gap:18px; min-width:0")}>
              <div style={s("display:grid; grid-template-columns:1fr 1fr; gap:8px; align-content:start")}>
                <Stat label="Niveau" value={ct.levelName} />
                <Stat label="Dons" value={ct.dons} />
                <Stat label="Dernier don" value={ct.lastDon} />
                <Stat label="Éligible" value={ct.nextDon} />
                <Stat label="Joignable" value={ct.hours} wide />
              </div>
              <div>
                <div style={s(`${LABEL}; margin-bottom:12px`)}>Historique</div>
                <div style={s("display:flex; flex-direction:column; gap:12px")}>
                  {hist.map((e, k) => (
                    <div key={k} style={s("display:flex; gap:10px; animation:floatin .35s ease")}>
                      <span style={s(`flex:none; width:8px; height:8px; border-radius:50%; background:${TONE_DOT[e.tone] || '#b09aa0'}; margin-top:5px`)}></span>
                      <div>
                        <div style={s("font:500 13px/1.4 'Public Sans',sans-serif; color:#2b0d15")}>{e.t}</div>
                        <div style={s("font:400 11.5px 'Public Sans',sans-serif; color:#8a6f76")}>{e.m}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
