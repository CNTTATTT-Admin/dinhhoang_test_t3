import axiosClient from '../../utils/axiosClient.js'

export function getAllScenarios() {
  return axiosClient.get('/admin/scenarios')
}

export function createScenario(request) {
  return axiosClient.post('/admin/scenarios', request)
}

export function updateScenario(id, request) {
  return axiosClient.put(`/admin/scenarios/${id}`, request)
}

export function deleteScenario(id) {
  return axiosClient.delete(`/admin/scenarios/${id}`)
}

