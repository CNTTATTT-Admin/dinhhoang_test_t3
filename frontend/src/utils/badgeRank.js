/**
 * @param {Array<{ id?: number, name?: string, iconUrl?: string, requiredExp?: number }>} badges
 */
export function sortBadgesByRequiredExp(badges) {
  if (!Array.isArray(badges) || badges.length === 0) return []
  return [...badges].sort(
    (a, b) => (Number(a?.requiredExp) || 0) - (Number(b?.requiredExp) || 0),
  )
}

/**
 * Huy hiệu hiện tại: mức cao nhất mà totalExp >= requiredExp.
 */
export function getCurrentBadgeForExp(sortedBadges, totalExp) {
  const exp = Number(totalExp) || 0
  if (!sortedBadges?.length) return null
  let current = null
  for (const b of sortedBadges) {
    const req = Number(b?.requiredExp) || 0
    if (exp >= req) current = b
    else break
  }
  return current
}

/**
 * Huy hiệu kế tiếp (chưa đạt): requiredExp đầu tiên > totalExp.
 */
export function getNextBadgeForExp(sortedBadges, totalExp) {
  const exp = Number(totalExp) || 0
  if (!sortedBadges?.length) return null
  return sortedBadges.find((b) => exp < (Number(b?.requiredExp) || 0)) ?? null
}

/**
 * % tiến độ EXP trong khoảng [current.requiredExp, next.requiredExp).
 */
export function getExpProgressToNextRank(sortedBadges, totalExp) {
  const exp = Number(totalExp) || 0
  const current = getCurrentBadgeForExp(sortedBadges, exp)
  const next = getNextBadgeForExp(sortedBadges, exp)
  if (!next) return { pct: 100, expFrom: current?.requiredExp ?? 0, expTo: null }
  const from = Number(current?.requiredExp) || 0
  const to = Number(next?.requiredExp) || 0
  if (to <= from) return { pct: 0, expFrom: from, expTo: to }
  const pct = Math.max(0, Math.min(100, ((exp - from) / (to - from)) * 100))
  return { pct, expFrom: from, expTo: to }
}
