import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import * as userAdminService from '../../services/admin/userAdminService.js'

const ROLE_OPTIONS = ['ROLE_USER', 'ROLE_ADMIN']

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [savingUserId, setSavingUserId] = useState(null)

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const res = await userAdminService.listAllUsers()
      setUsers(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      return (
        String(u?.username || '').toLowerCase().includes(q) ||
        String(u?.id || '').toLowerCase().includes(q) ||
        String(u?.role || '').toLowerCase().includes(q)
      )
    })
  }, [users, query])

  async function onChangeRole(userId, nextRole) {
    setSavingUserId(userId)
    setError('')
    try {
      await userAdminService.updateUserRole(userId, nextRole)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể cập nhật role')
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Quản lý Users</h1>
          <p className="mt-2 text-sm text-slate-300">
            Xem danh sách user và đổi role.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            className="w-full sm:w-[360px] rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/30"
            placeholder="Tìm theo username / id / role"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:text-cyan-200"
          >
            Tải lại
          </button>
        </div>

        {isLoading ? <div className="text-slate-300">Đang tải...</div> : null}

        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left py-2">Username</th>
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Level</th>
                <th className="text-left py-2">Total EXP</th>
                <th className="text-left py-2">Id</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="py-2 pr-3 font-medium">{u.username}</td>
                  <td className="py-2 pr-3">
                    <select
                      className="rounded-lg border border-white/10 bg-slate-950/30 px-2 py-1 text-sm text-white outline-none focus:border-cyan-400/30 disabled:opacity-60"
                      value={u.role || 'ROLE_USER'}
                      disabled={savingUserId === u.id}
                      onChange={(e) => onChangeRole(u.id, e.target.value)}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">{u.level}</td>
                  <td className="py-2 pr-3">{u.totalExp}</td>
                  <td className="py-2 pr-3 text-xs text-slate-400">{u.id}</td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td className="py-4 text-slate-400" colSpan={5}>
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

