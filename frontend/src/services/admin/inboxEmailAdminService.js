import axiosClient from '../../utils/axiosClient.js'

export function listByStepId(stepId) {
  return axiosClient.get('/admin/inbox-emails', { params: { stepId } })
}

export function getById(id) {
  return axiosClient.get(`/admin/inbox-emails/${id}`)
}

export function createInboxEmail(stepId, request) {
  return axiosClient.post('/admin/inbox-emails', request, { params: { stepId } })
}

export function updateInboxEmail(id, request) {
  return axiosClient.put(`/admin/inbox-emails/${id}`, request)
}

export function deleteInboxEmail(id) {
  return axiosClient.delete(`/admin/inbox-emails/${id}`)
}

