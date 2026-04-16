import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import * as trainingSessionAdminService from '../../services/admin/trainingSessionAdminService.js'
import * as sessionDetailAdminService from '../../services/admin/sessionDetailAdminService.js'

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [details, setDetails] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAll() {
    setIsLoading(true)
    setError('')
    try {
      const [sRes, dRes] = await Promise.all([
        trainingSessionAdminService.listAllTrainingSessions(),
        sessionDetailAdminService.listAllSessionDetails(),
      ])
      const s = Array.isArray(sRes?.data) ? sRes.data : []
      const d = Array.isArray(dRes?.data) ? dRes.data : []
      setSessions(s)
      setDetails(d)
      if (!selectedSessionId && s.length > 0) {
        setSelectedSessionId(s[0].id)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải sessions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const detailsForSelected = useMemo(() => {
    if (!selectedSessionId) return []
    return details.filter((d) => d.sessionId === selectedSessionId)
  }, [details, selectedSessionId])

  const stats = useMemo(() => {
    const totalSessions = sessions.length
    const completed = sessions.filter((s) => String(s?.status || '').toUpperCase() === 'COMPLETED').length
    const failed = sessions.filter((s) => String(s?.status || '').toUpperCase() === 'FAILED').length
    const leaked = sessions.filter((s) => String(s?.status || '').toUpperCase() === 'LEAKED').length
    return { totalSessions, completed, failed, leaked }
  }, [sessions])

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#f1f5f9' }}>
            Thống kê / Lịch sử Sessions
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Xem danh sách `TrainingSession` và chi tiết `SessionDetail` (drilldown theo session).
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
            <div className="text-xs text-slate-400">Total Sessions</div>
            <div className="mt-1 text-2xl font-extrabold">{stats.totalSessions}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="text-xs text-slate-400">Completed</div>
            <div className="mt-1 text-2xl font-extrabold">{stats.completed}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="text-xs text-slate-400">Failed</div>
            <div className="mt-1 text-2xl font-extrabold">{stats.failed}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="text-xs text-slate-400">Leaked</div>
            <div className="mt-1 text-2xl font-extrabold">{stats.leaked}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 overflow-auto">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">Training Sessions</h2>
              <button
                type="button"
                onClick={loadAll}
                className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-200 hover:text-cyan-200"
              >
                Tải lại
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Scenario</th>
                  <th className="text-right py-2">Chọn</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-white/5">
                    <td className="py-2 pr-3">{s.status}</td>
                    <td className="py-2 pr-3">{s.scoreGained}</td>
                    <td className="py-2 pr-3 text-xs text-slate-400">{s.userId}</td>
                    <td className="py-2 pr-3 text-xs text-slate-400">{s.scenarioId}</td>
                    <td className="py-2 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSessionId(s.id)}
                        className="rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-xs hover:text-cyan-200"
                      >
                        {selectedSessionId === s.id ? 'Đang xem' : 'Xem'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!sessions.length ? (
                  <tr>
                    <td className="py-4 text-slate-400" colSpan={5}>
                      Chưa có session.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 overflow-auto">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">Session Details</h2>
              <div className="text-xs text-slate-400">
                {selectedSessionId ? detailsForSelected.length : 0} item
              </div>
            </div>
            {selectedSessionId ? (
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="text-left py-2">Action</th>
                    <th className="text-left py-2">Correct</th>
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Step</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {detailsForSelected.map((d) => (
                    <tr key={d.id} className="border-t border-white/5">
                      <td className="py-2 pr-3">{d.userAction}</td>
                      <td className="py-2 pr-3">{d.isCorrect ? 'true' : 'false'}</td>
                      <td className="py-2 pr-3">{d.responseTime}</td>
                      <td className="py-2 pr-3 text-xs text-slate-400">{d.stepId}</td>
                    </tr>
                  ))}
                  {!detailsForSelected.length ? (
                    <tr>
                      <td className="py-4 text-slate-400" colSpan={4}>
                        Không có detail cho session này.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            ) : (
              <div className="text-sm text-slate-400">Chọn 1 session để xem detail.</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

