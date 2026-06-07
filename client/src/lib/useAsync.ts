import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** Runs `fn` on mount and whenever `deps` change; exposes a `reload()`. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps)

  const reload = useCallback(() => {
    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))
    run()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((e: Error) => active && setState({ data: null, loading: false, error: e.message }))
    return () => {
      active = false
    }
  }, [run])

  useEffect(() => reload(), [reload])

  return { ...state, reload }
}
