import axiosClient from '../utils/axiosClient.js'

export function getTopByExp() {
  return axiosClient.get('/leaderboard/exp')
}

