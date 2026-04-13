import { useCallback, useState } from 'react'
import GuestLanding from './GuestLanding.jsx'
import UserDashboard from './UserDashboard.jsx'
import { TOKEN_KEY, clearAuthStorage, resolveStoredToken } from '../utils/axiosClient.js'
import * as authService from '../services/authService.js'

export default function Dashboard() {
  const [hasToken, setHasToken] = useState(
    () => !!resolveStoredToken(),
  )

  const handleLogout = useCallback(async () => {
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        await authService.logout()
      }
    } catch (_error) {
      // Khi token hết hạn/không hợp lệ, vẫn dọn local state để thoát phiên.
    } finally {
      clearAuthStorage()
    }
    setHasToken(false)
  }, [])

  if (hasToken) {
    return <UserDashboard onLogout={handleLogout} />
  }

  return <GuestLanding />
}
