import axiosClient, { resolveStoredToken } from '../utils/axiosClient.js'

function authHeaders() {
  const token = resolveStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getScenarios() {
  return axiosClient.get('/scenarios', { headers: authHeaders() })
}

export function getScenarioById(scenarioId) {
  return axiosClient.get(`/scenarios/${scenarioId}`, {
    headers: authHeaders(),
  })
}

