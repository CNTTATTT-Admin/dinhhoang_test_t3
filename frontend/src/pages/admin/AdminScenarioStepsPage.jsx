import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import * as scenarioAdminService from '../../services/admin/scenarioAdminService.js'
import * as scenarioStepAdminService from '../../services/admin/scenarioStepAdminService.js'

const STEP_TYPE_OPTIONS = [
  'MAIL_STANDARD',
  'MAIL_FILE',
  'MAIL_WEB',
  'MAIL_OTP',
  'ZALO',
  'MIXED_INBOX',
  'WEB_PAGE',
  'OTP',
]

function jsonStringify(value) {
  return JSON.stringify(value, null, 2)
}

function stepContentTemplate(stepType) {
  const t = String(stepType || '').toUpperCase()
  if (t === 'MAIL_STANDARD') {
    return jsonStringify({ scenarioType: 'MAIL_STANDARD', title: 'Bài tập: ...', threatLevel: 1 })
  }
  if (t === 'MAIL_FILE') {
    return jsonStringify({ scenarioType: 'MAIL_FILE', title: 'Bài tập: ...', threatLevel: 2 })
  }
  if (t === 'MAIL_WEB') {
    return jsonStringify({
      scenarioType: 'MAIL_WEB',
      title: 'Bài tập: ...',
      traps: {
        browser: {
          enabled: true,
          webType: 'MICROSOFT',
          title: 'Xác thực bảo mật tài khoản',
          displayUrl: 'https://login.microsoftonline.com',
          actualUrl: 'https://login.microsoftonline.com',
          formType: 'CREDENTIAL',
          emailTraps: [
            {
              sortOrder: 1,
              webType: 'GITHUB',
              title: 'GitHub Login',
              displayUrl: 'https://github.com/login',
              actualUrl: 'https://githulb.com/login',
            },
          ],
        },
      },
      threatLevel: 3,
      webTypePlaybook: [
        { webType: 'FACEBOOK', displayUrl: 'https://facebook.com/login' },
        { webType: 'GOOGLE', displayUrl: 'https://accounts.google.com/signin' },
        { webType: 'MICROSOFT', displayUrl: 'https://login.microsoftonline.com' },
        { webType: 'GITHUB', displayUrl: 'https://github.com/login' },
        { webType: 'FINANCE', displayUrl: 'https://ebanking.vietcombank.com.vn' },
      ],
    })
  }
  if (t === 'MAIL_OTP') {
    return jsonStringify({
      scenarioType: 'MAIL_OTP',
      title: 'Bài tập: ...',
      message: 'Mô tả yêu cầu OTP...',
      threatLevel: 4,
    })
  }
  if (t === 'ZALO') {
    return jsonStringify({
      scenarioType: 'MAIL_ZALO',
      title: 'Bài tập: ...',
      sender: 'Điều phối nội bộ',
      messages: [
        {
          sender: 'Điều phối nội bộ',
          text: 'Đối chiếu thông tin Email, Zalo và DOC trước khi xác nhận.',
        },
      ],
      zaloVerifyRequired: false,
      zaloAutoReply: 'Dạ em đã xác nhận theo quy trình nội bộ.',
      caseMap: [
        {
          sortOrder: 1,
          caseId: 'CASE_1',
          zaloVerifyRequired: true,
          zaloAutoReply: 'Dạ em đã kiểm tra và xác nhận theo đúng quy trình.',
          messages: [{ sender: 'Sếp Quang', text: 'Anh đã gửi báo cáo PDF...' }],
        },
      ],
      policyRules: [
        'IT: Không bao giờ hỏi OTP trên Zalo.',
        'Sếp: Không yêu cầu chuyển tiền qua chat khẩn.',
      ],
      policySections: [
        { employee: 'IT Đức', email: 'it.support@cybershield.biz', rules: ['Không hỏi OTP.'] },
      ],
      threatLevel: 5,
    })
  }
  if (t === 'MIXED_INBOX') {
    return jsonStringify({
      scenarioType: 'MIXED_INBOX',
      title: 'Inbox hỗn hợp',
      threatLevel: 5,
      sender: 'Điều phối nội bộ',
      messages: [{ sender: 'Điều phối nội bộ', text: 'Luôn đối chiếu policy.' }],
      zaloVerifyRequired: false,
      zaloAutoReply: 'Dạ em đã kiểm tra theo đúng quy trình.',
      caseMap: [],
      policyRules: [],
      policySections: [],
    })
  }
  return jsonStringify({ title: '...', threatLevel: 1 })
}

function toInt(value) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : undefined
}

export default function AdminScenarioStepsPage() {
  const [scenarios, setScenarios] = useState([])
  const [steps, setSteps] = useState([])
  const [selectedScenarioId, setSelectedScenarioId] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    scenarioId: null,
    stepOrder: 1,
    stepType: 'MAIL_STANDARD',
    content: '',
    triggerFailure: 'REPORT',
    triggerSuccess: 'VERIFIED',
    aiFeedback: '',
  })

  const filteredSteps = useMemo(() => {
    return steps.filter((s) => s.scenarioId === selectedScenarioId)
  }, [steps, selectedScenarioId])

  async function loadAll() {
    setIsLoading(true)
    setError('')
    try {
      const [scRes, stRes] = await Promise.all([
        scenarioAdminService.getAllScenarios(),
        scenarioStepAdminService.getAllScenarioSteps(),
      ])
      setScenarios(Array.isArray(scRes?.data) ? scRes.data : [])
      setSteps(Array.isArray(stRes?.data) ? stRes.data : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (!selectedScenarioId && scenarios.length > 0) {
      const first = scenarios[0]?.id
      setSelectedScenarioId(first)
      setForm((v) => ({ ...v, scenarioId: first }))
    }
  }, [scenarios, selectedScenarioId])

  function startEdit(step) {
    setEditingId(step.id)
    setSelectedScenarioId(step.scenarioId)
    setForm({
      scenarioId: step.scenarioId,
      stepOrder: step.stepOrder,
      stepType: step.stepType || 'MAIL_STANDARD',
      content: step.content || '',
      triggerFailure: step.triggerFailure || '',
      triggerSuccess: step.triggerSuccess || '',
      aiFeedback: step.aiFeedback || '',
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm({
      scenarioId: selectedScenarioId,
      stepOrder: 1,
      stepType: 'MAIL_STANDARD',
      content: '',
      triggerFailure: 'REPORT',
      triggerSuccess: 'VERIFIED',
      aiFeedback: '',
    })
  }

  const canSubmit = useMemo(() => {
    return (
      form.scenarioId &&
      form.stepOrder !== null &&
      String(form.stepOrder).toString().trim() !== '' &&
      form.stepType.trim() &&
      form.content !== null
    )
  }, [form])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    const payload = {
      scenarioId: form.scenarioId,
      stepOrder: toInt(form.stepOrder),
      stepType: form.stepType,
      content: form.content,
      triggerFailure: form.triggerFailure || null,
      triggerSuccess: form.triggerSuccess || null,
      aiFeedback: form.aiFeedback || null,
    }

    try {
      if (editingId) {
        await scenarioStepAdminService.updateScenarioStep(editingId, payload)
      } else {
        await scenarioStepAdminService.createScenarioStep(payload)
      }
      await loadAll()
      resetForm()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu ScenarioStep')
    }
  }

  async function onDelete(stepId) {
    const ok = window.confirm('Xóa ScenarioStep này?')
    if (!ok) return
    try {
      await scenarioStepAdminService.deleteScenarioStep(stepId)
      await loadAll()
      if (editingId === stepId) resetForm()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa ScenarioStep')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#f1f5f9' }}>
            Quản lý Scenario Steps
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            CRUD `ScenarioStep` (bước trong campaign) và `content` JSON string.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {isLoading ? <div className="text-slate-300 mb-4">Đang tải...</div> : null}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-300">
            Lọc theo Scenario
            <select
              className="ml-2 rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
              value={selectedScenarioId || ''}
              onChange={(e) => {
                const v = e.target.value
                setSelectedScenarioId(v || null)
                setForm((prev) => ({ ...prev, scenarioId: v || null }))
                setEditingId(null)
              }}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:text-cyan-200"
          >
            Tạo mới
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">Các bước</h2>
              <div className="text-xs text-slate-400">{filteredSteps.length} item</div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="text-left py-2">Order</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Content (preview)</th>
                    <th className="text-right py-2">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {filteredSteps.map((st) => (
                    <tr key={st.id} className="border-t border-white/5 align-top">
                      <td className="py-2 pr-3">{st.stepOrder}</td>
                      <td className="py-2 pr-3">{st.stepType}</td>
                      <td className="py-2 pr-3 max-w-[420px]">
                        <pre className="whitespace-pre-wrap break-words text-xs text-slate-300">
                          {(st.content || '').slice(0, 80)}
                          {(st.content || '').length > 80 ? '...' : ''}
                        </pre>
                      </td>
                      <td className="py-2 pl-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-xs hover:text-cyan-200"
                            onClick={() => startEdit(st)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-400/25 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                            onClick={() => onDelete(st.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredSteps.length ? (
                    <tr>
                      <td className="py-4 text-slate-400" colSpan={4}>
                        Chưa có step cho scenario này.
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
              {editingId ? 'Cập nhật ScenarioStep' : 'Tạo ScenarioStep'}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs text-slate-300">
                  ScenarioId
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.scenarioId || ''}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, scenarioId: e.target.value }))
                    }
                    placeholder="UUID"
                  />
                </label>

                <label className="text-xs text-slate-300">
                  Step Order
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.stepOrder}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, stepOrder: e.target.value }))
                    }
                  />
                </label>
              </div>

              <label className="text-xs text-slate-300">
                Step Type
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.stepType}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, stepType: e.target.value }))
                  }
                >
                  {STEP_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:text-cyan-200"
                  onClick={() =>
                    setForm((v) => ({
                      ...v,
                      content: stepContentTemplate(v.stepType),
                    }))
                  }
                >
                  Chèn template content
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:text-cyan-200"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(form.content || '{}')
                      setForm((v) => ({ ...v, content: jsonStringify(parsed) }))
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Format JSON
                </button>
              </div>

              <label className="text-xs text-slate-300">
                Trigger Failure
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.triggerFailure}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, triggerFailure: e.target.value }))
                  }
                />
              </label>

              <label className="text-xs text-slate-300">
                Trigger Success
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.triggerSuccess}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, triggerSuccess: e.target.value }))
                  }
                />
              </label>

              <label className="text-xs text-slate-300">
                Content (JSON string)
                <textarea
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/30 min-h-[160px] font-mono"
                  value={form.content}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, content: e.target.value }))
                  }
                />
              </label>

              <label className="text-xs text-slate-300">
                Ai Feedback
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.aiFeedback}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, aiFeedback: e.target.value }))
                  }
                />
              </label>

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


