import axiosClient, { resolveStoredToken } from '../utils/axiosClient.js'

function authHeaders() {
  const token = resolveStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * API user-facing:
 * GET /api/scenarios/{scenarioId}/sessions
 */
export function fetchSessionsByScenario(scenarioId) {
  return axiosClient.get(`/scenarios/${scenarioId}/sessions`, {
    headers: authHeaders(),
  })
}

/**
 * POST /api/gameplay/steps/{stepId}/submit
 */
export function submitGameplayStep(stepId, payload) {
  return axiosClient.post(`/gameplay/steps/${stepId}/submit`, payload, {
    headers: authHeaders(),
  })
}

// Alias cho naming cũ/mới để tránh vỡ code khi refactor.
export const getSessionsByScenario = fetchSessionsByScenario
export const submitGameplaySession = submitGameplayStep

