import axiosClient, { resolveStoredToken } from '../utils/axiosClient.js'

function authHeaders() {
  const token = resolveStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const CACHE_TTL_MS = 30_000
const sessionsCacheByScenario = new Map()
const sessionsInFlightByScenario = new Map()
const playContextCacheByStep = new Map()
const playContextInFlightByStep = new Map()
const inboxCacheByStep = new Map()
const inboxInFlightByStep = new Map()

function isFresh(ts) {
  return Date.now() - ts < CACHE_TTL_MS
}

export function clearSessionServiceCache() {
  sessionsCacheByScenario.clear()
  sessionsInFlightByScenario.clear()
  playContextCacheByStep.clear()
  playContextInFlightByStep.clear()
  inboxCacheByStep.clear()
  inboxInFlightByStep.clear()
}

/**
 * API user-facing:
 * GET /api/scenarios/{scenarioId}/sessions
 */
export function fetchSessionsByScenario(scenarioId, options = {}) {
  const { forceRefresh = false, signal } = options
  const key = String(scenarioId || '')
  const cached = sessionsCacheByScenario.get(key)
  if (!forceRefresh && cached && isFresh(cached.ts)) {
    return Promise.resolve({ data: cached.data })
  }
  if (!forceRefresh && sessionsInFlightByScenario.has(key)) {
    return sessionsInFlightByScenario.get(key)
  }
  const req = axiosClient
    .get(`/scenarios/${scenarioId}/sessions`, {
      headers: authHeaders(),
      signal,
    })
    .then((res) => {
      sessionsCacheByScenario.set(key, { ts: Date.now(), data: Array.isArray(res?.data) ? res.data : [] })
      return res
    })
    .finally(() => {
      if (sessionsInFlightByScenario.get(key) === req) {
        sessionsInFlightByScenario.delete(key)
      }
    })
  sessionsInFlightByScenario.set(key, req)
  return req
}

/**
 * GET /api/gameplay/steps/{stepId}/play-context
 */
export function fetchPlayContext(stepId, options = {}) {
  const { forceRefresh = false, signal } = options
  const key = String(stepId || '')
  const cached = playContextCacheByStep.get(key)
  if (!forceRefresh && cached && isFresh(cached.ts)) {
    return Promise.resolve({ data: cached.data })
  }
  if (!forceRefresh && playContextInFlightByStep.has(key)) {
    return playContextInFlightByStep.get(key)
  }
  const req = axiosClient
    .get(`/gameplay/steps/${stepId}/play-context`, {
      headers: authHeaders(),
      signal,
    })
    .then((res) => {
      playContextCacheByStep.set(key, { ts: Date.now(), data: res?.data ?? null })
      return res
    })
    .finally(() => {
      if (playContextInFlightByStep.get(key) === req) {
        playContextInFlightByStep.delete(key)
      }
    })
  playContextInFlightByStep.set(key, req)
  return req
}

/**
 * GET /api/gameplay/steps/{stepId}/inbox-emails
 */
export function fetchInboxEmailsForStep(stepId, options = {}) {
  const { forceRefresh = false, signal } = options
  const key = String(stepId || '')
  const cached = inboxCacheByStep.get(key)
  if (!forceRefresh && cached && isFresh(cached.ts)) {
    return Promise.resolve({ data: cached.data })
  }
  if (!forceRefresh && inboxInFlightByStep.has(key)) {
    return inboxInFlightByStep.get(key)
  }
  const req = axiosClient
    .get(`/gameplay/steps/${stepId}/inbox-emails`, {
      headers: authHeaders(),
      signal,
    })
    .then((res) => {
      inboxCacheByStep.set(key, { ts: Date.now(), data: Array.isArray(res?.data) ? res.data : [] })
      return res
    })
    .finally(() => {
      if (inboxInFlightByStep.get(key) === req) {
        inboxInFlightByStep.delete(key)
      }
    })
  inboxInFlightByStep.set(key, req)
  return req
}

/**
 * POST /api/gameplay/steps/{stepId}/submit
 */
export function submitGameplayStep(stepId, payload) {
  return axiosClient
    .post(`/gameplay/steps/${stepId}/submit`, payload, {
      headers: authHeaders(),
    })
    .then((res) => {
      // Progress/completion can change after submit.
      clearSessionServiceCache()
      return res
    })
}

// Alias cho naming cũ/mới để tránh vỡ code khi refactor.
export const getSessionsByScenario = fetchSessionsByScenario
export const submitGameplaySession = submitGameplayStep

