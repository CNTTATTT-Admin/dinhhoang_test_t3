import axiosClient from '../../utils/axiosClient.js'

export function getAllScenarioSteps() {
  return axiosClient.get('/admin/scenario-steps')
}

export function createScenarioStep(request) {
  return axiosClient.post('/admin/scenario-steps', request)
}

export function updateScenarioStep(id, request) {
  return axiosClient.put(`/admin/scenario-steps/${id}`, request)
}

export function deleteScenarioStep(id) {
  return axiosClient.delete(`/admin/scenario-steps/${id}`)
}

