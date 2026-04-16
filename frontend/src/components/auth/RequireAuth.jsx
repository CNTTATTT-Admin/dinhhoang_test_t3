import { Navigate } from 'react-router-dom'
import { resolveStoredToken } from '../../utils/axiosClient.js'

export default function RequireAuth({ children }) {
  const token = resolveStoredToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

