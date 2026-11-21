import { createSelector } from '@reduxjs/toolkit'
import { applyFilters, getAllTags } from '../../filters'
import type { RootState } from '../../store'
import type { Filters, Status } from '../../types'

// Simple selectors
export const selectAllPosts = (state: RootState) => state.posts.items
export const selectPostsError = (state: RootState) => state.posts.error
export const selectPostsInvalidatedAt = (state: RootState) => state.posts.invalidatedAt

// Status for the UI. If we already have posts, a background reload or a failed reload
// still shows the old list instead of a loading/error message.
export const selectPostsStatus = (state: RootState): Status => {
  const { status, fetchedAt } = state.posts
  if (fetchedAt !== null) return 'success'
  if (status === 'failed') return 'error'
  return 'loading'
}

// Memoized selector 1: all tags, sorted. Recalculated only when the posts change.
export const selectAllTags = createSelector([selectAllPosts], (posts) => getAllTags(posts))

// Memoized selector 2: posts after search, tag, likes and sorting.
// Recalculated only when the posts or the filters change.
export const selectFilteredPosts = createSelector(
  [selectAllPosts, (_state: RootState, filters: Filters) => filters],
  (posts, filters) => applyFilters(posts, filters),
)

// Memoized selector 3: dashboard statistics for one tag ('' = all tags).
export const selectPostStats = createSelector(
  [selectAllPosts, (_state: RootState, tag: string) => tag],
  (posts, tag) => {
    const selected = tag === '' ? posts : posts.filter((post) => post.tags.includes(tag))

    const totalPosts = selected.length
    const totalLikes = selected.reduce((sum, post) => sum + post.reactions.likes, 0)
    const totalViews = selected.reduce((sum, post) => sum + post.views, 0)
    const averageLikes = totalPosts === 0 ? 0 : Math.round(totalLikes / totalPosts)
    const mostViewed = [...selected].sort((a, b) => b.views - a.views)[0]

    // how many posts have each tag
    const tagCounts: Record<string, number> = {}
    for (const post of selected) {
      for (const postTag of post.tags) {
        tagCounts[postTag] = (tagCounts[postTag] ?? 0) + 1
      }
    }
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

    // how many posts have few, some or many likes
    const lowLikes = selected.filter((post) => post.reactions.likes < 100).length
    const mediumLikes = selected.filter(
      (post) => post.reactions.likes >= 100 && post.reactions.likes < 300,
    ).length
    const highLikes = selected.filter((post) => post.reactions.likes >= 300).length

    return { totalPosts, totalLikes, totalViews, averageLikes, mostViewed, topTags, lowLikes, mediumLikes, highLikes }
  },
)
