import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import * as scenarioAdminService from '../../services/admin/scenarioAdminService.js'

const CATEGORY_OPTIONS = [
  'MAIL_STANDARD',
  'MAIL_FILE',
  'MAIL_WEB',
  'MAIL_OTP',
  'MAIL_ZALO',
  'MIXED_INBOX',
  'SOLO_MIXED',
]
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard']

function toInt(value) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : undefined
}

export default function AdminScenariosPage() {
  const [scenarios, setScenarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    category: 'MAIL_STANDARD',
    difficulty: 'Easy',
    thumbnailUrl: '',
    description: '',
    rewardExp: 0,
    tutorialMode: 0,
  })

  const canSubmit = useMemo(() => {
    return (
      form.title.trim() &&
      form.category.trim() &&
      form.difficulty.trim()
    )
  }, [form])

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const res = await scenarioAdminService.getAllScenarios()
      setScenarios(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải scenarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(s) {
    setEditingId(s.id)
    setForm({
      title: s.title || '',
      category: s.category || 'MAIL_STANDARD',
      difficulty: s.difficulty || 'Easy',
      thumbnailUrl: s.thumbnailUrl || '',
      description: s.description || '',
      rewardExp: s.rewardExp ?? 0,
      tutorialMode: s.tutorialMode ?? 0,
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm({
      title: '',
      category: 'MAIL_STANDARD',
      difficulty: 'Easy',
      thumbnailUrl: '',
      description: '',
      rewardExp: 0,
      tutorialMode: 0,
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    const payload = {
      title: form.title,
      category: form.category,
      difficulty: form.difficulty,
      thumbnailUrl: form.thumbnailUrl || null,
      description: form.description || null,
      rewardExp: toInt(form.rewardExp),
      tutorialMode: toInt(form.tutorialMode),
    }

    try {
      if (editingId) {
        await scenarioAdminService.updateScenario(editingId, payload)
      } else {
        await scenarioAdminService.createScenario(payload)
      }
      await load()
      resetForm()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu Scenario')
    }
  }

  async function onDelete(id) {
    const ok = window.confirm('Xóa Scenario này? Các step/inbox liên quan có thể bị ảnh hưởng.')
    if (!ok) return
    try {
      await scenarioAdminService.deleteScenario(id)
      await load()
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa Scenario')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Quản lý Scenarios</h1>
          <p className="mt-2 text-sm text-slate-300">
            CRUD Scenario (campaign) cho luồng chơi.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="text-slate-300">Đang tải...</div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-semibold text-white">Danh sách</h2>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-200 hover:text-cyan-200"
              >
                Tạo mới
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="text-left py-2">Title</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Diff</th>
                    <th className="text-left py-2">Exp</th>
                    <th className="text-left py-2">Tutorial</th>
                    <th className="text-right py-2">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {scenarios.map((s) => (
                    <tr key={s.id} className="border-t border-white/5">
                      <td className="py-2 pr-3">{s.title}</td>
                      <td className="py-2 pr-3">{s.category}</td>
                      <td className="py-2 pr-3">{s.difficulty}</td>
                      <td className="py-2 pr-3">{s.rewardExp}</td>
                      <td className="py-2 pr-3">{s.tutorialMode}</td>
                      <td className="py-2 pl-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-xs hover:text-cyan-200"
                            onClick={() => startEdit(s)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-400/25 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                            onClick={() => onDelete(s.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!scenarios.length ? (
                    <tr>
                      <td className="py-4 text-slate-400" colSpan={6}>
                        Chưa có dữ liệu.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-white/5 bg-slate-900/40 p-4"
          >
            <h2 className="text-base font-semibold text-white mb-3">
              {editingId ? 'Cập nhật Scenario' : 'Tạo Scenario'}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <label className="text-xs text-slate-300">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/30"
                  value={form.title}
                  onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                  placeholder="vd: Chiến dịch 1..."
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs text-slate-300">
                  Category
                  <select
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.category}
                    onChange={(e) => setForm((v) => ({ ...v, category: e.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-slate-300">
                  Difficulty
                  <select
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.difficulty}
                    onChange={(e) => setForm((v) => ({ ...v, difficulty: e.target.value }))}
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="text-xs text-slate-300">
                Thumbnail URL
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/30"
                  value={form.thumbnailUrl}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, thumbnailUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>

              <label className="text-xs text-slate-300">
                Description
                <textarea
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/30 min-h-[90px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, description: e.target.value }))
                  }
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs text-slate-300">
                  Reward EXP
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.rewardExp}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, rewardExp: e.target.value }))
                    }
                  />
                </label>

                <label className="text-xs text-slate-300">
                  Tutorial Mode (0/1)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.tutorialMode}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, tutorialMode: e.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 hover:text-cyan-200"
                  >
                    Hủy
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400/40 transition hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-60"
                >
                  {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}

