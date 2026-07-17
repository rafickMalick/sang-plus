import { useState } from 'react'
import { s } from '../style.js'
import { DONORS, msg, initials, ST_COLORS } from '../data.js'

const ROW_COLS = 'display:grid; grid-template-columns:1.6fr .6fr 1.2fr 1fr 1.1fr; gap:0 12px'

function DonorRow({ donor, active, onClick }) {
  const c = ST_COLORS[donor.status]
  return (
    <div
      className="row-donor"
      onClick={onClick}
      style={s(`${ROW_COLS}; align-items:center; padding:12px 14px; border-bottom:1px solid #f7efe8; cursor:pointer; background:${active ? '#faf4ee' : '#ffffff'}; border-left:3px solid ${active ? '#c8102e' : 'transparent'}; min-width:540px; box-sizing:border-box`)}
    >
      <span style={s("display:flex; align-items:center; gap:10px; min-width:0")}>
        <span style={s("flex:none; width:30px;height:30px;border-radius:50%;background:#f2e8e0;color:#431420;display:flex;align-items:center;justify-content:center;font:600 11.5px 'Public Sans',sans-serif")}>{initials(donor.name)}</span>
        <span style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15; overflow:hidden; text-overflow:ellipsis; white-space:nowrap")}>{donor.name}</span>
      </span>
      <span style={s("font:600 12.5px 'Public Sans',sans-serif; color:#c8102e")}>{donor.groupe}</span>
      <span style={s("font:400 13px 'Public Sans',sans-serif; color:#5c4048; overflow:hidden; text-overflow:ellipsis; white-space:nowrap")}>{donor.commune}</span>
      <span style={s("font:400 13px 'Public Sans',sans-serif; color:#5c4048; overflow:hidden; text-overflow:ellipsis; white-space:nowrap")}>{donor.lastDon}</span>
      <span><span style={s(`font:600 11px 'Public Sans',sans-serif; padding:5px 10px; border-radius:999px; background:${c.bg}; color:${c.fg}; white-space:nowrap`)}>{donor.status}</span></span>
    </div>
  )
}

function Fiche({ donor, sent, onSend }) {
  const replied = donor.status === 'A répondu OUI'
  return (
    <>
      <div style={s("display:flex; align-items:center; gap:12px")}>
        <span style={s("width:46px;height:46px;border-radius:50%;background:#431420;color:#f8ddcb;display:flex;align-items:center;justify-content:center;font:600 15px 'Public Sans',sans-serif")}>{initials(donor.name)}</span>
        <div>
          <div style={s("font:600 16px 'Public Sans',sans-serif; color:#2b0d15")}>{donor.name}</div>
          <div style={s("font:400 12.5px 'Public Sans',sans-serif; color:#8a6f76")}>{donor.commune} · {donor.phone}</div>
        </div>
        <span style={s("margin-left:auto; font:700 13px 'Public Sans',sans-serif; color:#c8102e; background:#fbe9ec; padding:6px 11px; border-radius:6px")}>{donor.groupe}</span>
      </div>
      <div style={s("display:grid; grid-template-columns:1fr 1fr; gap:8px")}>
        <div style={s("background:#fff; border:1px solid #f0e4da; border-radius:8px; padding:10px 12px")}>
          <div style={s("font:400 10.5px 'Public Sans',sans-serif; color:#8a6f76")}>Dernier don</div>
          <div style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15")}>{donor.lastDon}</div>
        </div>
        <div style={s("background:#fff; border:1px solid #f0e4da; border-radius:8px; padding:10px 12px")}>
          <div style={s("font:400 10.5px 'Public Sans',sans-serif; color:#8a6f76")}>Langue préférée</div>
          <div style={s("font:600 13.5px 'Public Sans',sans-serif; color:#2b0d15; text-transform:capitalize")}>{donor.lang}</div>
        </div>
      </div>
      <div style={s("background:#fff; border:1px solid #f0e4da; border-radius:10px; padding:14px; flex:1")}>
        <div style={s("font:600 10.5px 'Public Sans',sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#8a6f76; margin-bottom:10px")}>Conversation · <span style={s("text-transform:capitalize")}>{donor.lang}</span></div>
        <div style={s("background:#431420; color:#f8ddcb; border-radius:12px 12px 12px 3px; padding:10px 12px; font:400 12.5px/1.5 'Public Sans',sans-serif; margin-bottom:8px")}>{msg(donor.lang, donor.ville)}</div>
        {replied && (
          <div style={s("display:flex; justify-content:flex-end")}>
            <span style={s("background:#e7f2ea; color:#2f6e4b; border-radius:12px 12px 3px 12px; padding:8px 14px; font:600 12.5px 'Public Sans',sans-serif")}>OUI ✓</span>
          </div>
        )}
        {sent && (
          <div style={s("font:400 11px 'Public Sans',sans-serif; color:#3d8a5f; text-align:right; animation:floatin .4s ease")}>✓ SMS envoyé à l'instant</div>
        )}
      </div>
      <div style={s("display:flex; gap:8px")}>
        <button onClick={onSend} style={s("flex:1; background:#c8102e; color:#fff; border:none; padding:12px 0; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer")}>Envoyer un SMS</button>
        <button style={s("flex:1; background:#fff; color:#431420; border:1.5px solid #431420; padding:12px 0; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer")}>📞 Appeler</button>
      </div>
    </>
  )
}

export default function DonorDashboard() {
  const [selDonor, setSelDonor] = useState(0)
  const [sentIds, setSentIds] = useState({})
  const donor = DONORS[selDonor]

  return (
    <div id="outil" className="sp-outil" style={s("background:#f2e8e0; padding:84px 56px; box-sizing:border-box")}>
      <div style={s("max-width:1400px; margin:0 auto")}>
        <div style={s("text-align:center; margin-bottom:44px")}>
          <div style={s("font:600 12px 'Public Sans',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#c8102e; margin-bottom:14px")}>L'outil au quotidien</div>
          <h2 style={s("font:600 40px/1.15 'Newsreader',serif; color:#2b0d15; margin:0 0 12px")}>Le poste de pilotage de vos donneurs</h2>
          <p style={s("font:400 15.5px/1.6 'Public Sans',sans-serif; color:#5c4048; margin:0 auto; max-width:64ch; text-wrap:pretty")}>Recherchez un donneur, voyez son historique, contactez-le en un clic — dans sa langue. <strong style={s("color:#431420")}>Cliquez sur un donneur</strong> pour voir sa fiche.</p>
        </div>

        <div style={s("background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 30px 80px rgba(43,13,21,.2); border:1px solid #e4d4c8")}>
          <div style={s("display:flex; align-items:center; gap:8px; padding:12px 18px; background:#2b0d15")}>
            <span style={s("width:11px;height:11px;border-radius:50%;background:#e0656f")}></span>
            <span style={s("width:11px;height:11px;border-radius:50%;background:#e8b078")}></span>
            <span style={s("width:11px;height:11px;border-radius:50%;background:#8fbf8a")}></span>
            <div style={s("flex:1; display:flex; justify-content:center")}>
              <span style={s("background:#431420; color:#d9b8a8; font:400 12px 'Public Sans',sans-serif; padding:6px 40px; border-radius:6px")}>app.sang-plus.org/donneurs</span>
            </div>
            <span style={s("display:flex; align-items:center; gap:6px; font:600 11px 'Public Sans',sans-serif; color:#8fbf8a")}><span style={s("width:7px;height:7px;border-radius:50%;background:#8fbf8a; animation:pulse 1.6s infinite")}></span>LIVE</span>
          </div>

          <div className="sp-dash" style={s("display:grid; grid-template-columns:200px minmax(0,1fr) minmax(280px,340px); min-height:520px")}>
            {/* sidebar */}
            <div className="sp-dash-sidebar" style={s("background:#431420; padding:20px 0; display:flex; flex-direction:column; gap:2px")}>
              <img className="sp-dash-sidebar-logo" src="/assets/logo.png" alt="Sang+" style={s("height:30px; border-radius:6px; display:block; margin:0 0 22px 18px; align-self:flex-start")} />
              <div className="sp-dash-nav sp-dash-nav-active" style={s("padding:11px 18px; background:#5a2230; color:#f8ddcb; font:600 13.5px 'Public Sans',sans-serif; border-left:3px solid #c8102e")}>Donneurs</div>
              {['Campagnes', 'Messages', 'Statistiques'].map((it) => (
                <div key={it} className="sp-dash-nav" style={s("padding:11px 18px; color:#c99aa6; font:500 13.5px 'Public Sans',sans-serif; border-left:3px solid transparent; cursor:pointer")}>{it}</div>
              ))}
              <div className="sp-dash-sidebar-foot" style={s("margin-top:auto; padding:14px 18px; font:400 11px 'Public Sans',sans-serif; color:#8a5f6b")}>CNTS Cotonou · admin</div>
            </div>

            {/* table */}
            <div className="sp-table" style={s("padding:22px 26px; border-right:1px solid #f0e4da; min-width:0; overflow:hidden")}>
              <div style={s("display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:10px")}>
                <div style={s("font:600 17px 'Public Sans',sans-serif; color:#2b0d15; white-space:nowrap")}>Donneurs recensés <span style={s("font:400 13px 'Public Sans',sans-serif; color:#8a6f76")}>· 12 400</span></div>
                <div style={s("display:flex; gap:8px")}>
                  <span style={s("border:1px solid #e4d4c8; border-radius:6px; padding:8px 14px; font:400 13px 'Public Sans',sans-serif; color:#8a6f76; background:#faf4ee")}>🔍 Rechercher un donneur…</span>
                  <span style={s("border:1px solid #e4d4c8; border-radius:6px; padding:8px 12px; font:500 13px 'Public Sans',sans-serif; color:#431420; background:#fff; cursor:pointer")}>Filtres ▾</span>
                </div>
              </div>
              <div style={s("overflow-x:auto")}>
                <div style={s(`${ROW_COLS}; padding:9px 14px; font:600 10.5px 'Public Sans',sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#8a6f76; border-bottom:1px solid #f0e4da; min-width:540px; box-sizing:border-box`)}>
                  <span>Nom</span><span>Groupe</span><span>Commune</span><span>Dernier don</span><span>Statut</span>
                </div>
                {DONORS.map((d, i) => (
                  <DonorRow key={d.name} donor={d} active={i === selDonor} onClick={() => setSelDonor(i)} />
                ))}
              </div>
              <div style={s("display:flex; align-items:center; gap:8px; margin-top:14px; font:400 12px 'Public Sans',sans-serif; color:#8a6f76")}>
                <span style={s("width:7px;height:7px;border-radius:50%;background:#3d8a5f; animation:pulse 1.6s infinite")}></span>
                214 réponses « OUI » reçues aujourd'hui · campagne Cotonou en cours
              </div>
            </div>

            {/* fiche */}
            <div className="sp-fiche" style={s("padding:22px 24px; background:#faf4ee; display:flex; flex-direction:column; gap:14px")}>
              <Fiche
                donor={donor}
                sent={!!sentIds[selDonor]}
                onSend={() => setSentIds((prev) => ({ ...prev, [selDonor]: true }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
