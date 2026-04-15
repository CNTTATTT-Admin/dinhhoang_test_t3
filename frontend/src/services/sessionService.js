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
 * GET /api/gameplay/steps/{stepId}/play-context
 */
export function fetchPlayContext(stepId) {
  return axiosClient.get(`/gameplay/steps/${stepId}/play-context`, {
    headers: authHeaders(),
  })
}

/**
 * GET /api/gameplay/steps/{stepId}/inbox-emails
 */
export function fetchInboxEmailsForStep(stepId) {
  return axiosClient.get(`/gameplay/steps/${stepId}/inbox-emails`, {
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

