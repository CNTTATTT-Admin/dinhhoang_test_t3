import axiosClient from '../utils/axiosClient.js'

/**
 * Backend Swagger:
 * - GET  /users/{id}/profile
 * - PUT  /users/{id}/profile        { avatarUrl }
 * - PUT  /users/{id}/password       { oldPassword, newPassword }
 */
export function getUserProfile(id) {
  return axiosClient.get(`/users/${id}/profile`)
}

export function updateAvatar(id, avatarUrl) {
  return axiosClient.put(`/users/${id}/profile`, { avatarUrl })
}

export function changePassword(id, oldPassword, newPassword) {
  return axiosClient.put(`/users/${id}/password`, { oldPassword, newPassword })
}

export function getUserAnalytics(id) {
  return axiosClient.get(`/users/${id}/analytics`)
}

