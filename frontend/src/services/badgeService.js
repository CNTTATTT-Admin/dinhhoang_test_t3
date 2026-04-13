import axiosClient, { resolveStoredToken } from '../utils/axiosClient.js'

/**
 * Backend: GET /api/badges — danh sách huy hiệu (USER/ADMIN).
 * Luôn gửi Bearer token (JWT stateless); interceptor axiosClient cũng chèn header.
 */
export function getBadges() {
  const token = resolveStoredToken()
  return axiosClient.get('/badges', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
