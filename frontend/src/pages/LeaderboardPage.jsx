import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell.jsx'
import LeaderboardSection from '../components/dashboard/LeaderboardSection.jsx'
import * as authService from '../services/authService.js'
import {
  clearAuthStorage,
  resolveStoredToken,
} from '../utils/axiosClient.js'

export default function LeaderboardPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = resolveStoredToken()
    if (!token) navigate('/login', { replace: true })
  }, [navigate])

  const handleLogout = useCallback(async () => {
    try {
      if (resolveStoredToken()) {
        await authService.logout()
      }
    } catch {
      // ignore server logout errors; still clear client state
    } finally {
      clearAuthStorage()
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <PageShell headerVariant="user" onLogout={handleLogout}>
      <div className="flex-1 bg-[#0B1120] text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <LeaderboardSection />
        </div>
      </div>
    </PageShell>
  )
}

