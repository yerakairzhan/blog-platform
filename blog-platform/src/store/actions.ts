import { createAction } from '@reduxjs/toolkit'

// "Data may be out of date": sent when the connection comes back or the user presses
// Refresh / Retry connection. The posts and postDetails slices both listen to it, and the
// pages that are open load their data again.
export const dataInvalidated = createAction('data/invalidated')

// Data is "fresh" for 5 minutes: inside this time no new request is sent.
export const STALE_TIME = 5 * 60 * 1000

export function isFresh(fetchedAt: number | null, invalidatedAt: number) {
  return fetchedAt !== null && fetchedAt > invalidatedAt && Date.now() - fetchedAt < STALE_TIME
}
