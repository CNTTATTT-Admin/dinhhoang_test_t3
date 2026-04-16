import axiosClient from '../../utils/axiosClient.js'

export function listAllTrainingSessions() {
  return axiosClient.get('/admin/training-sessions')
}

