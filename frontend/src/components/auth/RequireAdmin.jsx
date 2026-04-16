import { Navigate } from 'react-router-dom'
import { resolveStoredToken } from '../../utils/axiosClient.js'

export default function RequireAdmin({ children }) {
  const token = resolveStoredToken()
  const role = sessionStorage.getItem('cybershield_role')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

