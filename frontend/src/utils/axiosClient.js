import axios from 'axios'

const TOKEN_KEY = 'token'
const TOKEN_KEYS = [TOKEN_KEY, 'jwt', 'accessToken']

function resolveStoredToken() {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key)
    if (value && value.trim()) {
      return value
    }
  }
  return null
}

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('jwt')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('cybershield_username')
  localStorage.removeItem('cybershield_role')
}

const axiosClient = axios.create({
  // Align with Spring Boot @RequestMapping("/api")
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = resolveStoredToken()
    if (token) {
      const value = `Bearer ${token}`
      // Axios 1.x dùng AxiosHeaders: gán trực tiếp .Authorization đôi khi không gửi lên được
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', value)
      } else {
        config.headers = { ...config.headers, Authorization: value }
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthStorage()
    }
    return Promise.reject(error)
  },
)

export default axiosClient
export { TOKEN_KEY, clearAuthStorage, resolveStoredToken }
