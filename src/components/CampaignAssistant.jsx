import { useState } from 'react'
import { s } from '../style.js'
import { REGIONS, msg, pill } from '../data.js'

function MapPin({ leftPct, topPct, label, reverse, onClick }) {
  const [hover, setHover] = useState(false)
  const base = reverse
    ? 'translate(calc(-100% + 7px),-50%)'
    : 'translate(-7px,-50%)'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`,
        transform: hover ? `${base} scale(1.05)` : base,
        transition: 'transform .12s ease',
        flexDirection: reverse ? 'row-reverse' : 'row',
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '7px', padding: 0,
      }}
    >
      <span style={s("position:relative; width:14px; height:14px; flex:none")}>
        <span style={s("position:absolute; inset:-6px; border-radius:50%; background:#c8102e; opacity:.3; animation:pulse 1.6s infinite")}></span>
        <span style={s("position:absolute; inset:1px; border-radius:50%; background:#c8102e; border:2.5px solid #fff; box-sizing:border-box")}></span>
      </span>
      <span style={s("background:#fff; color:#431420; font:600 12px 'Public Sans',sans-serif; padding:5px 10px; border-radius:999px; box-shadow:0 3px 10px rgba(43,13,21,.28); white-space:nowrap")}>{label}</span>
    </button>
  )
}

function Pill({ label, active, onClick, extra }) {
  const p = pill(active)
  return (
    <button
      onClick={onClick}
      style={s(`padding:8px 15px; border-radius:999px; border:1px solid ${p.bd}; background:${p.bg}; color:${p.fg}; font:500 13px 'Public Sans',sans-serif; cursor:pointer${extra ? '; ' + extra : ''}`)}
    >
      {label}
    </button>
  )
}

export default function CampaignAssistant() {
  const [step, setStep] = useState('carte')
  const [country, setCountry] = useState('Bénin')
  const [regionName, setRegionName] = useState('Cotonou')
  const [langSel, setLangSel] = useState('fon')
  const [canal, setCanal] = useState('sms')

  const region = REGIONS.find((r) => r.name === regionName) || REGIONS[0]
  const lang = region.langs.includes(langSel) ? langSel : region.langs[0]
  const message = msg(lang, region.name)

  const pickCity = (name) => {
    const r = REGIONS.find((x) => x.name === name)
    setRegionName(r.name)
    setLangSel(r.langs[0])
    setCountry(r.pays)
    setStep('config')
  }

  const tab = (pays) => {
    const p = pill(country === pays)
    return (
      <button
        onClick={() => setCountry(pays)}
        style={s(`padding:7px 14px; border-radius:999px; border:1px solid ${p.bd}; background:${p.bg}; color:${p.fg}; font:600 12.5px 'Public Sans',sans-serif; cursor:pointer`)}
      >
        {pays}
      </button>
    )
  }

  return (
    <div id="campagne" style={s("background:#431420; padding:80px 56px")}>
      <div style={s("max-width:1400px; margin:0 auto; display:grid; grid-template-columns:1fr 1.15fr; gap:56px; align-items:center")}>
        <div>
          <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#e08a96; margin-bottom:16px")}>Fonctionnalité phare</div>
          <h2 style={s("font:600 40px/1.15 'Newsreader',serif; color:#f8ddcb; margin:0 0 18px; text-wrap:pretty")}>Assistance Campagne : une collecte régionale en trois gestes</h2>
          <p style={s("font:400 15.5px/1.7 'Public Sans',sans-serif; color:#d9b8a8; margin:0 0 28px; text-wrap:pretty")}>Choisissez la région, la langue et le canal. Sang+ contacte automatiquement les donneurs recensés — et vous suivez les réponses en temps réel.</p>
          <div style={s("display:grid; gap:14px; font:400 14.5px/1.5 'Public Sans',sans-serif; color:#f8ddcb")}>
            <div style={s("display:flex; gap:12px")}><span style={s("font:600 15px 'Newsreader',serif; color:#e08a96")}>1.</span>Choisissez la ville de collecte sur la carte du pays</div>
            <div style={s("display:flex; gap:12px")}><span style={s("font:600 15px 'Newsreader',serif; color:#e08a96")}>2.</span>Choisissez la langue et le canal (SMS ou appel vocal)</div>
            <div style={s("display:flex; gap:12px")}><span style={s("font:600 15px 'Newsreader',serif; color:#e08a96")}>3.</span>Sang+ contacte les donneurs et recense les réponses</div>
          </div>
          <div style={s("margin-top:26px; font:400 12.5px 'Public Sans',sans-serif; color:#a97f8b")}>Essayez la démo ci-contre — elle est cliquable.</div>
        </div>

        <div style={s("background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,.35)")}>
          <div style={s("display:flex; align-items:center; gap:8px; padding:12px 16px; background:#f2e8e0; border-bottom:1px solid #e4d4c8")}>
            <span style={s("width:10px;height:10px;border-radius:50%;background:#e0b4ba")}></span>
            <span style={s("width:10px;height:10px;border-radius:50%;background:#e8cdb9")}></span>
            <span style={s("width:10px;height:10px;border-radius:50%;background:#cdd8c4")}></span>
            <span style={s("margin-left:8px; font:500 12px 'Public Sans',sans-serif; color:#8a6f76")}>Sang+ · Assistance Campagne</span>
          </div>
          <div style={s("padding:22px 24px")}>
            {step === 'carte' && (
              <div style={s("animation:slidein .35s ease")}>
                <div style={s("display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px")}>
                  <div style={s("font:600 11px 'Public Sans',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#8a6f76")}>1 · Choisissez la région sur la carte</div>
                  <div style={s("display:flex; gap:6px")}>{tab('Sénégal')}{tab('Bénin')}</div>
                </div>
                <div style={s("position:relative; width:100%; aspect-ratio:4/3; border-radius:10px; overflow:hidden; border:1px solid #e4d4c8; background:#f7efe8")}>
                  {country === 'Sénégal' ? (
                    <>
                      <img src="/assets/carte-senegal.png" alt="Carte du Sénégal" style={s("position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block")} />
                      <MapPin leftPct={19} topPct={45} label="Dakar · 4 820 donneurs" onClick={() => pickCity('Dakar')} />
                      <MapPin leftPct={27} topPct={36} label="Thiès · 1 930 donneurs" onClick={() => pickCity('Thiès')} />
                    </>
                  ) : (
                    <>
                      <img src="/assets/carte-benin.png" alt="Carte du Bénin" style={s("position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block")} />
                      <MapPin leftPct={55} topPct={52} label="Parakou · 1 260 donneurs" reverse onClick={() => pickCity('Parakou')} />
                      <MapPin leftPct={50} topPct={86} label="Cotonou · 3 410 donneurs" reverse onClick={() => pickCity('Cotonou')} />
                    </>
                  )}
                </div>
                <div style={s("margin-top:12px; font:400 12.5px 'Public Sans',sans-serif; color:#8a6f76; text-align:center")}>Cliquez sur une ville pour préparer la campagne →</div>
              </div>
            )}

            {step === 'config' && (
              <div style={s("animation:slidein .35s ease; display:grid; gap:16px")}>
                <div style={s("display:flex; align-items:center; gap:12px")}>
                  <button onClick={() => setStep('carte')} style={s("background:#f7efe8; border:1px solid #e4d4c8; color:#431420; font:600 12.5px 'Public Sans',sans-serif; padding:7px 13px; border-radius:999px; cursor:pointer")}>← Carte</button>
                  <div style={s("font:600 15px 'Public Sans',sans-serif; color:#2b0d15")}>Campagne · {region.name} <span style={s("font:400 12.5px 'Public Sans',sans-serif; color:#8a6f76")}>({region.pays})</span></div>
                </div>

                <div>
                  <div style={s("font:600 11px 'Public Sans',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#8a6f76; margin-bottom:8px")}>2 · Langue du message</div>
                  <div style={s("display:flex; flex-wrap:wrap; gap:8px")}>
                    {region.langs.map((l) => (
                      <Pill key={l} label={l} active={l === lang} onClick={() => setLangSel(l)} extra="text-transform:capitalize" />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={s("font:600 11px 'Public Sans',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#8a6f76; margin-bottom:8px")}>3 · Canal</div>
                  <div style={s("display:flex; gap:8px")}>
                    {[{ id: 'sms', name: 'SMS' }, { id: 'appel', name: 'Appel vocal' }].map((ch) => (
                      <Pill key={ch.id} label={ch.name} active={ch.id === canal} onClick={() => setCanal(ch.id)} />
                    ))}
                  </div>
                </div>

                {canal === 'sms' ? (
                  <div style={s("background:#f7efe8; border:1px solid #e4d4c8; border-radius:10px; padding:14px 16px")}>
                    <div style={s("font:500 11px 'Public Sans',sans-serif; color:#8a6f76; margin-bottom:8px")}>Aperçu SMS · <span style={s("text-transform:capitalize")}>{lang}</span></div>
                    <div style={s("background:#431420; color:#f8ddcb; border-radius:12px 12px 12px 3px; padding:12px 14px; font:400 13.5px/1.55 'Public Sans',sans-serif; max-width:46ch")}>{message}</div>
                  </div>
                ) : (
                  <div style={s("background:#f7efe8; border:1px solid #e4d4c8; border-radius:10px; padding:14px 16px")}>
                    <div style={s("font:500 11px 'Public Sans',sans-serif; color:#8a6f76; margin-bottom:10px")}>Appel vocal · script lu en <span style={s("text-transform:capitalize")}>{lang}</span> (voix locale)</div>
                    <div style={s("display:flex; align-items:center; gap:10px; margin-bottom:10px")}>
                      <span style={s("width:34px; height:34px; border-radius:50%; background:#c8102e; color:#fff; display:flex; align-items:center; justify-content:center; font:600 14px 'Public Sans',sans-serif")}>▶</span>
                      <span style={s("display:flex; align-items:flex-end; gap:3px")}>
                        {[8, 16, 11, 20, 9, 14, 6].map((h, i) => (
                          <span key={i} style={s(`width:4px;height:${h}px;background:#c8102e;border-radius:2px`)}></span>
                        ))}
                      </span>
                      <span style={s("font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>0:22</span>
                    </div>
                    <div style={s("font:italic 400 13px/1.55 'Newsreader',serif; color:#5c4048")}>« {message} »</div>
                  </div>
                )}

                <div style={s("display:flex; align-items:center; justify-content:space-between; gap:14px")}>
                  <div style={s("font:400 13px 'Public Sans',sans-serif; color:#5c4048")}>≈ <strong style={s("color:#431420")}>{region.donneurs.toLocaleString('fr-FR')}</strong> donneurs recensés à {region.name} ({region.pays})</div>
                  <span style={s("background:#c8102e; color:#fff; padding:11px 20px; border-radius:4px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap")}>Lancer la campagne</span>
                </div>
                <div style={s("font:400 10.5px 'Public Sans',sans-serif; color:#b09aa0")}>Messages d'exemple — traductions validées avec des locuteurs natifs avant envoi.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
