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
  const [regionName, setRegionName] = useState('Cotonou')
  const [langSel, setLangSel] = useState('fon')

  const region = REGIONS.find((r) => r.name === regionName) || REGIONS[0]
  const lang = region.langs.includes(langSel) ? langSel : region.langs[0]
  const message = msg(lang, region.name)

  const pickCity = (name) => {
    const r = REGIONS.find((x) => x.name === name)
    setRegionName(r.name)
    setLangSel(r.langs[0])
    setStep('config')
  }

  return (
    <div id="campagne" className="sp-campagne" style={s("background:#431420; padding:80px 56px; box-sizing:border-box")}>
      <div className="sp-campagne-grid" style={s("max-width:1400px; margin:0 auto; display:grid; grid-template-columns:1fr 1.15fr; gap:56px; align-items:center")}>
        <div>
          <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#e08a96; margin-bottom:16px")}>Fonctionnalité phare</div>
          <h2 style={s("font:600 40px/1.15 'Newsreader',serif; color:#f8ddcb; margin:0 0 18px; text-wrap:pretty")}>Assistance Campagne : une collecte régionale en trois gestes</h2>
          <p style={s("font:400 15.5px/1.7 'Public Sans',sans-serif; color:#d9b8a8; margin:0 0 28px; text-wrap:pretty")}>Choisissez la région et la langue. Sang+ envoie le SMS aux donneurs recensés — et vous suivez les réponses en temps réel.</p>
          <div style={s("display:grid; gap:14px; font:400 14.5px/1.5 'Public Sans',sans-serif; color:#f8ddcb")}>
            <div style={s("display:flex; gap:12px")}><span style={s("font:600 15px 'Newsreader',serif; color:#e08a96")}>1.</span>Choisissez la ville de collecte sur la carte du pays</div>
            <div style={s("display:flex; gap:12px")}><span style={s("font:600 15px 'Newsreader',serif; color:#e08a96")}>2.</span>Choisissez la langue du SMS</div>
            <div style={s("display:flex; gap:12px")}><span style={s("font:600 15px 'Newsreader',serif; color:#e08a96")}>3.</span>Sang+ envoie les SMS et recense les réponses</div>
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
                </div>
                <div style={s("position:relative; width:100%; aspect-ratio:4/3; border-radius:10px; overflow:hidden; border:1px solid #e4d4c8; background:#f7efe8")}>
                  <img src="/assets/carte-benin.png" alt="Carte du Bénin" style={s("position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block")} />
                  <MapPin leftPct={55} topPct={52} label="Parakou · 1 260 donneurs" reverse onClick={() => pickCity('Parakou')} />
                  <MapPin leftPct={48} topPct={74} label="Abomey · 1 120 donneurs" reverse onClick={() => pickCity('Abomey')} />
                  <MapPin leftPct={50} topPct={86} label="Cotonou · 3 410 donneurs" reverse onClick={() => pickCity('Cotonou')} />
                  <MapPin leftPct={53.5} topPct={83} label="Porto-Novo · 1 980 donneurs" onClick={() => pickCity('Porto-Novo')} />
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

                <div style={s("background:#f7efe8; border:1px solid #e4d4c8; border-radius:10px; padding:14px 16px")}>
                  <div style={s("font:500 11px 'Public Sans',sans-serif; color:#8a6f76; margin-bottom:8px")}>Aperçu SMS · <span style={s("text-transform:capitalize")}>{lang}</span></div>
                  <div style={s("background:#431420; color:#f8ddcb; border-radius:12px 12px 12px 3px; padding:12px 14px; font:400 13.5px/1.55 'Public Sans',sans-serif; max-width:46ch")}>{message}</div>
                </div>

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
