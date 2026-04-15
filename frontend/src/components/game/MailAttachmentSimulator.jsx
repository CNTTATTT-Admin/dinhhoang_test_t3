import { useEffect, useState } from 'react'
import { Download, FileText, X } from 'lucide-react'

/**
 * Mô phỏng: tải file từ link → mở viewer (Notepad) → người chơi xác nhận đã xem.
 * Dùng khi email có attachmentJson từ API (nội dung file có thể độc dù URL/sender trông ổn).
 */
export function parseMailAttachment(raw) {
  if (!raw || typeof raw !== 'string') return null
  try {
    const j = JSON.parse(raw)
    if (!j || (typeof j.fileName !== 'string' && typeof j.content !== 'string')) return null
    return {
      fileName: j.fileName || 'download.bin',
      mimeLabel: j.mimeLabel || 'File',
      viewerTitle: j.viewerTitle || 'Notepad — mô phỏng',
      content: typeof j.content === 'string' ? j.content : String(j.content ?? ''),
      fileWarnings: Array.isArray(j.fileWarnings) ? j.fileWarnings.filter(Boolean) : [],
    }
  } catch {
    return null
  }
}

export default function MailAttachmentSimulator({ open, spec, onClose, onReviewed, onDownload }) {
  const [phase, setPhase] = useState('choice') // choice | preview

  useEffect(() => {
    if (!open) {
      setPhase('choice')
      return
    }
    setPhase('choice')
  }, [open, spec?.fileName])

  if (!open || !spec) return null

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-600 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 bg-[#1e293b] px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
            <FileText className="h-4 w-4 text-cyan-400" />
            Trình tự mở file (mô phỏng đào tạo)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {phase === 'choice' ? (
          <div className="space-y-0 bg-[#f5f6f8] text-slate-900">
            <div className="border-b border-slate-300 bg-white px-4 py-2 text-xs text-slate-600">
              Downloads &gt; Attachments
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{spec.fileName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{spec.mimeLabel}</p>
                </div>
                <FileText className="h-6 w-6 shrink-0 text-slate-400" />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-300 bg-white px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => setPhase('preview')}
                className="inline-flex items-center justify-center gap-2 rounded border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
              >
                <FileText className="h-4 w-4" />
                Xem trước
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center justify-center gap-2 rounded bg-[#0b57d0] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a4cb8]"
              >
                <Download className="h-4 w-4" />
                Tải xuống
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-700 bg-[#f0f0f0] px-2 py-1.5 text-xs text-slate-800">
              <span className="font-medium">{spec.viewerTitle}</span>
              <span className="text-slate-500"> — {spec.fileName}</span>
            </div>
            <div className="max-h-[45vh] overflow-auto bg-white p-4">
              <pre className="whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed text-slate-900">
                {spec.content}
              </pre>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-700 bg-slate-950/90 px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Đóng (chưa xem kỹ)
              </button>
              <button
                type="button"
                onClick={() => {
                  onReviewed()
                  setPhase('choice')
                }}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
              >
                Đã xem nội dung file — tiếp tục quyết định
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
