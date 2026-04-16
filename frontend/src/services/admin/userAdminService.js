import axiosClient from '../../utils/axiosClient.js'

export function listAllUsers() {
  return axiosClient.get('/admin/users')
}

export function updateUserRole(userId, role) {
  return axiosClient.put(`/admin/users/${userId}/role`, { role })
}

