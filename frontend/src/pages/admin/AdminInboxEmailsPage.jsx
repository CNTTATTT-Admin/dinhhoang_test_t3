import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import * as scenarioStepAdminService from '../../services/admin/scenarioStepAdminService.js'
import * as inboxEmailAdminService from '../../services/admin/inboxEmailAdminService.js'

const EMAIL_TYPE_OPTIONS = [
  'MAIL_STANDARD',
  'MAIL_FILE',
  'MAIL_WEB',
  'MAIL_OTP',
  'MAIL_ZALO',
]

function attachmentTemplate() {
  return JSON.stringify(
    {
      fileName: 'invoice.pdf',
      mimeLabel: 'PDF',
      viewerTitle: 'Preview',
      content: 'Nội dung xem trước...',
      fileWarnings: ['File có macro/nguồn lạ', 'Yêu cầu bật quyền truy cập bất thường'],
    },
    null,
    2,
  )
}

function emailBodyTemplate(emailType) {
  const t = String(emailType || '').toUpperCase()
  if (t === 'MAIL_OTP') {
    return 'Vui lòng nhập mã OTP được gửi trong email/ứng dụng...'
  }
  if (t === 'MAIL_WEB') {
    return 'Bạn cần xác minh tài khoản tại đường dẫn bên dưới...'
  }
  return 'Nội dung email mô phỏng...'
}

function toBool(value) {
  return value === true || value === 'true'
}

function parseRedFlags(text) {
  if (!text) return []
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function AdminInboxEmailsPage() {
  const [scenarioSteps, setScenarioSteps] = useState([])
  const [selectedStepId, setSelectedStepId] = useState(null)
  const [emails, setEmails] = useState([])

  const [editingEmailId, setEditingEmailId] = useState(null)

  const [form, setForm] = useState({
    emailType: 'MAIL_STANDARD',
    slotTag: '',
    senderEmail: '',
    senderName: '',
    subject: '',
    body: '',
    linkUrl: '',
    linkLabel: '',
    isPhishing: false,
    redFlagsText: '',
    attachmentJson: '',
    sortOrder: null,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const selectedStep = useMemo(() => {
    return scenarioSteps.find((s) => s.id === selectedStepId) || null
  }, [scenarioSteps, selectedStepId])

  function resetFormForCreate() {
    setEditingEmailId(null)
    setForm({
      emailType: selectedStep?.stepType || 'MAIL_STANDARD',
      slotTag: '',
      senderEmail: '',
      senderName: '',
      subject: '',
      body: '',
      linkUrl: '',
      linkLabel: '',
      isPhishing: false,
      redFlagsText: '',
      attachmentJson: '',
      sortOrder: null,
    })
  }

  async function loadSteps() {
    const res = await scenarioStepAdminService.getAllScenarioSteps()
    const list = Array.isArray(res?.data) ? res.data : []
    setScenarioSteps(list)
    if (!selectedStepId && list.length > 0) {
      setSelectedStepId(list[0].id)
    }
  }

  async function loadEmails(stepId) {
    if (!stepId) return
    const res = await inboxEmailAdminService.listByStepId(stepId)
    setEmails(Array.isArray(res?.data) ? res.data : [])
  }

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError('')

    ;(async () => {
      try {
        await loadSteps()
      } catch (err) {
        if (!alive) return
        setError(err?.response?.data?.message || err?.message || 'Không thể tải scenario steps')
      } finally {
        if (alive) setIsLoading(false)
      }
    })()

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedStepId) return
    loadEmails(selectedStepId).catch((err) => {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải inbox emails')
    })
  }, [selectedStepId])

  useEffect(() => {
    // khi đổi stepId thì reset form tạo mới
    if (selectedStepId) {
      resetFormForCreate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStepId])

  const canSubmit = useMemo(() => {
    return (
      form.senderEmail.trim() &&
      form.subject.trim() &&
      form.body.trim() &&
      form.emailType.trim()
    )
  }, [form])

  function startEdit(email) {
    setEditingEmailId(email.id)
    setForm({
      emailType: email.emailType || 'MAIL_STANDARD',
      slotTag: email.slotTag || '',
      senderEmail: email.senderEmail || '',
      senderName: email.senderName || '',
      subject: email.subject || '',
      body: email.body || '',
      linkUrl: email.linkUrl || '',
      linkLabel: email.linkLabel || '',
      isPhishing: toBool(email.isPhishing),
      redFlagsText: (email.redFlags || []).join(', '),
      attachmentJson: email.attachmentJson || '',
      sortOrder: email.sortOrder ?? null,
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      const payload = {
        emailType: form.emailType,
        slotTag: form.slotTag || null,
        senderEmail: form.senderEmail,
        senderName: form.senderName || null,
        subject: form.subject,
        body: form.body,
        linkUrl: form.linkUrl || null,
        linkLabel: form.linkLabel || null,
        isPhishing: !!form.isPhishing,
        redFlags: parseRedFlags(form.redFlagsText),
        attachmentJson: form.attachmentJson || null,
        sortOrder: form.sortOrder === '' ? null : form.sortOrder,
      }

      if (editingEmailId) {
        await inboxEmailAdminService.updateInboxEmail(editingEmailId, payload)
      } else {
        await inboxEmailAdminService.createInboxEmail(selectedStepId, payload)
      }
      await loadEmails(selectedStepId)
      resetFormForCreate()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu VirtualInboxEmail')
    }
  }

  async function onDelete(id) {
    const ok = window.confirm('Xóa inbox email này?')
    if (!ok) return
    try {
      await inboxEmailAdminService.deleteInboxEmail(id)
      await loadEmails(selectedStepId)
      if (editingEmailId === id) resetFormForCreate()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa inbox email')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#f1f5f9' }}>
            Quản lý Inbox Emails
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            CRUD `VirtualInboxEmail` theo `stepId`.
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
            Chọn Scenario Step
            <select
              className="ml-2 rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
              value={selectedStepId || ''}
              onChange={(e) => {
                const v = e.target.value
                setSelectedStepId(v || null)
              }}
            >
              {scenarioSteps.map((st) => (
                <option key={st.id} value={st.id}>
                  #{st.stepOrder} {st.stepType} ({st.id})
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={resetFormForCreate}
            className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:text-cyan-200"
          >
            Tạo mới
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">Inbox queue</h2>
              <div className="text-xs text-slate-400">{emails.length} item</div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="text-left py-2">#</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Subject</th>
                    <th className="text-right py-2">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {emails.map((em) => (
                    <tr key={em.id} className="border-t border-white/5">
                      <td className="py-2 pr-3">{em.sortOrder}</td>
                      <td className="py-2 pr-3">{em.emailType}</td>
                      <td className="py-2 pr-3">
                        <div className="font-medium">{em.subject}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[240px]">
                          {em.senderEmail} {em.isPhishing ? '(phishing)' : '(legit)'}
                        </div>
                      </td>
                      <td className="py-2 pl-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-xs hover:text-cyan-200"
                            onClick={() => startEdit(em)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-400/25 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                            onClick={() => onDelete(em.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!emails.length ? (
                    <tr>
                      <td className="py-4 text-slate-400" colSpan={4}>
                        Chưa có email trong queue cho step này.
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
              {editingEmailId ? 'Cập nhật Inbox Email' : 'Tạo Inbox Email'}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <label className="text-xs text-slate-300">
                Email Type
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.emailType}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      emailType: e.target.value,
                      body: v.body || emailBodyTemplate(e.target.value),
                    }))
                  }
                >
                  {EMAIL_TYPE_OPTIONS.map((t) => (
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
                      body: v.body || emailBodyTemplate(v.emailType),
                    }))
                  }
                >
                  Chèn template body
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:text-cyan-200"
                  onClick={() =>
                    setForm((v) => ({
                      ...v,
                      attachmentJson: v.attachmentJson || attachmentTemplate(),
                      emailType: 'MAIL_FILE',
                    }))
                  }
                >
                  Chèn template attachment (MAIL_FILE)
                </button>
              </div>

              <label className="text-xs text-slate-300">
                Slot Tag (shuffle)
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.slotTag}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, slotTag: e.target.value }))
                  }
                />
              </label>

              <label className="text-xs text-slate-300">
                Sender Email
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.senderEmail}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, senderEmail: e.target.value }))
                  }
                  placeholder="example@company.com"
                />
              </label>

              <label className="text-xs text-slate-300">
                Sender Name
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.senderName}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, senderName: e.target.value }))
                  }
                />
              </label>

              <label className="text-xs text-slate-300">
                Subject
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, subject: e.target.value }))
                  }
                />
              </label>

              <label className="text-xs text-slate-300">
                Body
                <textarea
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/30 min-h-[120px] font-mono"
                  value={form.body}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, body: e.target.value }))
                  }
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs text-slate-300">
                  Link URL
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.linkUrl}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, linkUrl: e.target.value }))
                    }
                  />
                </label>

                <label className="text-xs text-slate-300">
                  Link Label
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.linkLabel}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, linkLabel: e.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs text-slate-300 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.isPhishing}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, isPhishing: e.target.checked }))
                    }
                  />
                  isPhishing
                </label>

                <label className="text-xs text-slate-300">
                  Sort Order (tuỳ chọn)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                    value={form.sortOrder ?? ''}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, sortOrder: e.target.value }))
                    }
                    placeholder="auto"
                  />
                </label>
              </div>

              <label className="text-xs text-slate-300">
                Red Flags (phân tách bằng dấu `,`)
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/30"
                  value={form.redFlagsText}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, redFlagsText: e.target.value }))
                  }
                  placeholder="vd: Typosquatting, urgent transfer..."
                />
              </label>

              <label className="text-xs text-slate-300">
                Attachment JSON (MAIL_FILE)
                <textarea
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/30 min-h-[100px] font-mono"
                  value={form.attachmentJson}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, attachmentJson: e.target.value }))
                  }
                  placeholder='{"filename":"...","preview":"..."}'
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                {editingEmailId ? (
                  <button
                    type="button"
                    onClick={resetFormForCreate}
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
                  {editingEmailId ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}


