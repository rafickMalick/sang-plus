import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api.js'

// Charge une ressource de l'API ; `poll` (ms) la rafraîchit en continu pour suivre les envois simulés.
export function useLoad(path, { poll } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const alive = useRef(true)
  const reload = useCallback(() => {
    if (!path) return Promise.resolve()
    return api.get(path)
      .then((data) => alive.current && setState({ data, error: null, loading: false }))
      .catch((error) => alive.current && setState((s) => ({ ...s, error, loading: false })))
  }, [path])
  useEffect(() => {
    alive.current = true
    setState((s) => ({ ...s, loading: true }))
    reload()
    const t = poll ? setInterval(reload, poll) : null
    return () => { alive.current = false; if (t) clearInterval(t) }
  }, [reload, poll])
  return { ...state, reload }
}
