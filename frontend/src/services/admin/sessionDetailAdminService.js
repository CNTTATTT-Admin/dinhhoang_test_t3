import axiosClient from '../../utils/axiosClient.js'

export function listAllSessionDetails() {
  return axiosClient.get('/admin/session-details')
}

