import axiosClient, { resolveStoredToken } from '../utils/axiosClient.js'

function authHeaders() {
  const token = resolveStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const CACHE_TTL_MS = 30_000
let scenariosCache = { ts: 0, data: null }
let scenariosInFlight = null

const scenarioByIdCache = new Map()
const scenarioByIdInFlight = new Map()

function isFresh(ts) {
  return Date.now() - ts < CACHE_TTL_MS
}

export function clearScenarioCache() {
  scenariosCache = { ts: 0, data: null }
  scenariosInFlight = null
  scenarioByIdCache.clear()
  scenarioByIdInFlight.clear()
}

export function getScenarios(options = {}) {
  const { forceRefresh = false, signal } = options
  if (!forceRefresh && scenariosCache.data && isFresh(scenariosCache.ts)) {
    return Promise.resolve({ data: scenariosCache.data })
  }
  if (!forceRefresh && scenariosInFlight) return scenariosInFlight
  const req = axiosClient
    .get('/scenarios', { headers: authHeaders(), signal })
    .then((res) => {
      scenariosCache = { ts: Date.now(), data: Array.isArray(res?.data) ? res.data : [] }
      return res
    })
    .finally(() => {
      if (scenariosInFlight === req) scenariosInFlight = null
    })
  scenariosInFlight = req
  return req
}

export function getScenarioById(scenarioId, options = {}) {
  const { forceRefresh = false, signal } = options
  const key = String(scenarioId || '')
  const cached = scenarioByIdCache.get(key)
  if (!forceRefresh && cached && isFresh(cached.ts)) {
    return Promise.resolve({ data: cached.data })
  }
  if (!forceRefresh && scenarioByIdInFlight.has(key)) {
    return scenarioByIdInFlight.get(key)
  }
  const req = axiosClient
    .get(`/scenarios/${scenarioId}`, {
      headers: authHeaders(),
      signal,
    })
    .then((res) => {
      scenarioByIdCache.set(key, { ts: Date.now(), data: res?.data ?? null })
      return res
    })
    .finally(() => {
      if (scenarioByIdInFlight.get(key) === req) {
        scenarioByIdInFlight.delete(key)
      }
    })
  scenarioByIdInFlight.set(key, req)
  return req
}

