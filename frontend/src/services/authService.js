import axiosClient from '../utils/axiosClient.js'

/**
 * Backend Spring Boot: /api/auth/login, /api/auth/register
 * Dev: Vite proxy map /auth/* -> /api/auth/* (xem vite.config.js)
 */
export function login(data) {
  return axiosClient.post('/auth/login', data)
}

export function register(data) {
  return axiosClient.post('/auth/register', data)
}

export function logout() {
  return axiosClient.post('/auth/logout')
}
