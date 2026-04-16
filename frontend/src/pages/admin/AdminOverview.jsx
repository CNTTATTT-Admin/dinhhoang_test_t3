import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import * as scenarioAdminService from '../../services/admin/scenarioAdminService.js'
import * as trainingSessionAdminService from '../../services/admin/trainingSessionAdminService.js'
import * as sessionDetailAdminService from '../../services/admin/sessionDetailAdminService.js'
import * as userAdminService from '../../services/admin/userAdminService.js'

function groupCount(items, keyFn) {
  const out = new Map()
  for (const it of items) {
    const key = keyFn(it)
    out.set(key, (out.get(key) || 0) + 1)
  }
  return Array.from(out.entries()).map(([key, count]) => ({ key, count }))
}

export default function AdminOverview() {
  const [scenarios, setScenarios] = useState([])
  const [sessions, setSessions] = useState([])
  const [details, setDetails] = useState([])
  const [users, setUsers] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAll() {
    setIsLoading(true)
    setError('')
    try {
      const [scRes, sRes, dRes, uRes] = await Promise.all([
        scenarioAdminService.getAllScenarios(),
        trainingSessionAdminService.listAllTrainingSessions(),
        sessionDetailAdminService.listAllSessionDetails(),
        userAdminService.listAllUsers(),
      ])
      setScenarios(Array.isArray(scRes?.data) ? scRes.data : [])
      setSessions(Array.isArray(sRes?.data) ? sRes.data : [])
      setDetails(Array.isArray(dRes?.data) ? dRes.data : [])
      setUsers(Array.isArray(uRes?.data) ? uRes.data : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải overview')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const overview = useMemo(() => {
    const totalUsers = users.length
    const adminUsers = users.filter((u) => u.role === 'ROLE_ADMIN').length
    const totalScenarios = scenarios.length
    const totalSessions = sessions.length

    const statusCounts = groupCount(sessions, (s) =>
      String(s?.status || 'UNKNOWN').toUpperCase(),
    ).sort((a, b) => b.count - a.count)

    const sessionsByScenario = groupCount(sessions, (s) => s?.scenarioId || 'UNKNOWN')
      .map((row) => {
        const sc = scenarios.find((x) => x.id === row.key)
        return { scenarioId: row.key, title: sc?.title || row.key, count: row.count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    const correctRate = (() => {
      if (!details.length) return null
      const correct = details.filter((d) => Boolean(d?.isCorrect)).length
      return Math.round((correct / details.length) * 100)
    })()

    const avgResponseTime = (() => {
      const times = details
        .map((d) => Number(d?.responseTime))
        .filter((n) => Number.isFinite(n) && n > 0)
      if (!times.length) return null
      const sum = times.reduce((a, b) => a + b, 0)
      return Math.round((sum / times.length) * 100) / 100
    })()

    return {
      totalUsers,
      adminUsers,
      totalScenarios,
      totalSessions,
      statusCounts,
      sessionsByScenario,
      correctRate,
      avgResponseTime,
    }
  }, [users, scenarios, sessions, details])

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Tổng quan</h1>
          <p className="mt-2 text-sm text-slate-300">
            Thống kê tổng hợp từ các endpoint admin (client-side aggregate).
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {isLoading ? <div className="text-slate-300 mb-4">Đang tải...</div> : null}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="text-xs text-slate-400">Users</div>
            <div className="mt-1 text-2xl font-extrabold">{overview.totalUsers}</div>
            <div className="mt-1 text-xs text-slate-400">Admin: {overview.adminUsers}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="text-xs text-slate-400">Scenarios</div>
            <div className="mt-1 text-2xl font-extrabold">{overview.totalScenarios}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="text-xs text-slate-400">Training Sessions</div>
            <div className="mt-1 text-2xl font-extrabold">{overview.totalSessions}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="text-xs text-slate-400">Correct Rate</div>
            <div className="mt-1 text-2xl font-extrabold">
              {overview.correctRate == null ? '—' : `${overview.correctRate}%`}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Avg time: {overview.avgResponseTime == null ? '—' : `${overview.avgResponseTime}s`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">Sessions by Status</h2>
              <button
                type="button"
                onClick={loadAll}
                className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-200 hover:text-cyan-200"
              >
                Tải lại
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {overview.statusCounts.map((row) => (
                <div key={row.key} className="flex items-center justify-between text-sm">
                  <div className="text-slate-200">{row.key}</div>
                  <div className="text-slate-400">{row.count}</div>
                </div>
              ))}
              {!overview.statusCounts.length ? (
                <div className="text-sm text-slate-400">Chưa có dữ liệu.</div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">Top Scenarios (by sessions)</h2>
              <div className="text-xs text-slate-400">Top 8</div>
            </div>
            <div className="flex flex-col gap-2">
              {overview.sessionsByScenario.map((row) => (
                <div key={row.scenarioId} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1 text-slate-200 truncate">{row.title}</div>
                  <div className="text-slate-400">{row.count}</div>
                </div>
              ))}
              {!overview.sessionsByScenario.length ? (
                <div className="text-sm text-slate-400">Chưa có dữ liệu.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

