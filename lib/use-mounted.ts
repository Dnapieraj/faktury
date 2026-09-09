import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Returns `false` during SSR and the first client render, `true` afterwards.
 * Uses `useSyncExternalStore` so it does not trigger the set-state-in-effect lint.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}
