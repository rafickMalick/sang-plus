// Parse a plain CSS declaration string into a React inline-style object,
// so component markup can keep the exact style strings from the design.
export function s(css) {
  const out = {}
  for (const decl of css.split(';')) {
    const t = decl.trim()
    if (!t) continue
    const i = t.indexOf(':')
    if (i === -1) continue
    const prop = t.slice(0, i).trim()
    const value = t.slice(i + 1).trim()
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    out[key] = value
  }
  return out
}
