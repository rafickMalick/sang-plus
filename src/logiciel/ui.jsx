import { s } from '../style.js'
import { TONE } from './format.js'

export const CARD = 'background:#fff; border:1px solid #f0e4da; border-radius:10px'
export const CAPTION = "font:600 10.5px 'Public Sans',sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#8a6f76"
export const INPUT = "border:1px solid #e4d4c8; border-radius:6px; padding:10px 12px; font:400 13.5px 'Public Sans',sans-serif; color:#2b0d15; background:#faf4ee; outline:none"
export const TITLE = "font:600 16px 'Public Sans',sans-serif; color:#2b0d15"
export const BTN_DARK = "background:#431420; color:#f8ddcb; border:none; padding:11px 18px; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap"
export const BTN_RED = "background:#c8102e; color:#fff; border:none; padding:11px 18px; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap"
export const BTN_LINE = "background:#fff; color:#431420; border:1.5px solid #431420; padding:10px 16px; border-radius:6px; font:600 13px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap"

// Bouton dont les couleurs viennent d'une palette { bg, fg, bd } (voir P dans format.js).
export function Toggle({ p, onClick, css, bw = 1, children, disabled }) {
  return (
    <button disabled={disabled} onClick={onClick} style={s(`border:${bw}px solid ${p.bd}; background:${p.bg}; color:${p.fg}; cursor:${disabled ? 'not-allowed' : 'pointer'}; opacity:${disabled ? 0.45 : 1}; ${css}`)}>
      {children}
    </button>
  )
}

export function Kpi({ label, value, note }) {
  return (
    <div style={s(`${CARD}; padding:16px 18px`)}>
      <div style={s("font:600 12.5px 'Public Sans',sans-serif; color:#5c4048")}>{label}</div>
      <div style={s("font:600 30px 'Newsreader',serif; color:#2b0d15; margin:4px 0 2px")}>{value}</div>
      <div style={s("font:400 11.5px/1.4 'Public Sans',sans-serif; color:#8a6f76")}>{note}</div>
    </div>
  )
}

export function Stepper({ value, onDown, onUp, size = 30, valueCss }) {
  const btn = `width:${size}px; height:${size}px; border:1px solid #e4d4c8; background:#fff; border-radius:6px; cursor:pointer; font:600 ${size > 32 ? 16 : 15}px 'Public Sans',sans-serif; color:#431420`
  return (
    <>
      <button onClick={onDown} style={s(btn)}>−</button>
      <span style={s(valueCss)}>{value}</span>
      <button onClick={onUp} style={s(btn)}>+</button>
    </>
  )
}

export function Avatar({ text, size = 48, font = 15, light }) {
  return (
    <span style={s(`flex:none; width:${size}px; height:${size}px; border-radius:50%; background:${light ? '#f2e8e0' : '#431420'}; color:${light ? '#431420' : '#f8ddcb'}; display:flex; align-items:center; justify-content:center; font:600 ${font}px 'Public Sans',sans-serif`)}>{text}</span>
  )
}

export function GroupBadge({ grp, css = "font:700 14px 'Public Sans',sans-serif; padding:6px 11px" }) {
  return <span style={s(`${css}; color:#c8102e; background:#fbe9ec; border-radius:6px; white-space:nowrap`)}>{grp}</span>
}

export function Pill({ bg, fg, children, css = '' }) {
  return <span style={s(`font:600 11px 'Public Sans',sans-serif; padding:4px 10px; border-radius:999px; background:${bg}; color:${fg}; white-space:nowrap; ${css}`)}>{children}</span>
}

export function Timeline({ items }) {
  return (
    <div style={s("display:flex; flex-direction:column; gap:10px")}>
      {items.map((hs, k) => (
        <div key={k} style={s("display:flex; gap:10px")}>
          <span style={s(`flex:none; width:8px; height:8px; border-radius:50%; background:${TONE[hs.tone] || hs.dot || '#b09aa0'}; margin-top:5px`)}></span>
          <div>
            <div style={s("font:500 13px/1.4 'Public Sans',sans-serif; color:#2b0d15")}>{hs.t}</div>
            <div style={s("font:400 11.5px 'Public Sans',sans-serif; color:#8a6f76")}>{hs.m}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div style={s("display:flex; gap:4px; background:#f2e8e0; padding:4px; border-radius:8px; width:fit-content; max-width:100%; overflow-x:auto")}>
      {tabs.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)} style={s(`border:none; background:${value === id ? '#fff' : 'transparent'}; color:${value === id ? '#2b0d15' : '#8a6f76'}; padding:9px 18px; border-radius:6px; font:600 13.5px 'Public Sans',sans-serif; cursor:pointer; white-space:nowrap`)}>{label}</button>
      ))}
    </div>
  )
}

export function Field({ label, children, css = '' }) {
  return (
    <label style={s(`display:flex; flex-direction:column; gap:6px; font:600 12.5px 'Public Sans',sans-serif; color:#431420; ${css}`)}>
      {label}
      {children}
    </label>
  )
}

export function Empty({ children }) {
  return <div style={s("padding:28px 10px; text-align:center; font:400 13.5px/1.5 'Public Sans',sans-serif; color:#8a6f76")}>{children}</div>
}

// État de chargement / erreur d'un écran.
export function Loading({ error }) {
  if (error) return <div style={s("background:#fbe9ec; color:#7d1a28; border-radius:10px; padding:14px 18px; font:500 13.5px 'Public Sans',sans-serif")}>{error.message}</div>
  return <div style={s("padding:40px; text-align:center; font:400 13.5px 'Public Sans',sans-serif; color:#8a6f76")}>Chargement…</div>
}

export function Table({ cols, minWidth = 700, head, children }) {
  return (
    <div style={s("overflow-x:auto")}>
      <div style={s(`display:grid; grid-template-columns:${cols}; gap:0 12px; padding:9px 12px; ${CAPTION}; border-bottom:1px solid #f0e4da; min-width:${minWidth}px; box-sizing:border-box`)}>
        {head.map((h) => <span key={h}>{h}</span>)}
      </div>
      <div style={s(`min-width:${minWidth}px`)}>{children}</div>
    </div>
  )
}

export function Row({ cols, onClick, active, children }) {
  return (
    <div className={onClick ? 'hover-cream' : undefined} onClick={onClick} style={s(`display:grid; grid-template-columns:${cols}; gap:0 12px; align-items:center; padding:10px 12px; border-bottom:1px solid #f7efe8; ${onClick ? 'cursor:pointer;' : ''} background:${active ? '#fbf3ee' : '#fff'}; box-shadow:inset 3px 0 0 ${active ? '#c8102e' : 'transparent'}; box-sizing:border-box; font:400 13px 'Public Sans',sans-serif; color:#5c4048`)}>
      {children}
    </div>
  )
}

export const ellipsis = "overflow:hidden; text-overflow:ellipsis; white-space:nowrap"
