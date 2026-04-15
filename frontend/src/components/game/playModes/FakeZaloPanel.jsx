import { ArrowLeft, MoreHorizontal, Phone, Search, Send } from 'lucide-react'
import { QuarantineStamp } from './playModeShared.jsx'

/**
 * Parse JSON kịch bản — không bao giờ dump raw JSON ra bubble.
 */
function parseZaloContent(content) {
  if (!content || typeof content !== 'string') {
    return { title: 'Zalo', peerName: 'Người lạ', messages: [] }
  }
  try {
    const j = JSON.parse(content)
    const peerName = j.sender || j.peerName || j.from || 'Liên hệ'
    const title = j.title || j.chatTitle || 'Chat'
    const messages = []

    if (Array.isArray(j.messages)) {
      j.messages.forEach((m, i) => {
        messages.push({
          id: `m-${i}`,
          from: 'them',
          sender: m.sender || m.from || peerName,
          text: String(m.text || m.body || '').trim(),
          time: m.time || m.at,
        })
      })
    }

    const bodyText = String(j.message || j.body || j.text || '').trim()
    if (messages.length === 0) {
      if (bodyText) {
        messages.push({
          id: 'm-0',
          from: 'them',
          sender: peerName,
          text: bodyText,
        })
      } else {
        const lines = [
          j.title ? `📌 ${j.title}` : null,
          `Tin nhắn từ “${peerName}”.`,
          'Kiểm tra danh tính người gửi và nội dung trước khi làm theo yêu cầu (OTP, chuyển khoản, tải file…).',
        ]
        if (j.threatLevel != null) {
          lines.push(`Mức độ rủi ro kịch bản: ${j.threatLevel}/5`)
        }
        messages.push({
          id: 'm-0',
          from: 'them',
          sender: peerName,
          text: lines.filter(Boolean).join('\n\n'),
        })
      }
    }

    return { title, peerName, messages }
  } catch {
    return {
      title: 'Zalo',
      peerName: 'Tin nhắn',
      messages: [{ id: 'm-0', from: 'them', sender: 'Hệ thống', text: content }],
    }
  }
}

export default function FakeZaloPanel({
  content,
  replyText,
  onReplyChange,
  onReport,
  onTrustSend,
  canReport,
  canTrustSend,
}) {
  const parsed = parseZaloContent(content)

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#e8eef5] text-slate-900">
      {/* Header giống app chat */}
      <header className="flex shrink-0 items-center gap-1.5 border-b border-[#d0d9e6] bg-[#0068ff] px-2 py-2 text-white shadow-sm">
        <button
          type="button"
          className="rounded-full p-2 hover:bg-white/10"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="relative">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white ring-2 ring-white/30">
            {parsed.peerName.slice(0, 1).toUpperCase()}
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0068ff] bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold leading-tight">{parsed.peerName}</p>
          <p className="truncate text-[11px] text-white/85">{parsed.title}</p>
        </div>
        <button type="button" className="rounded-full p-1.5 hover:bg-white/10" aria-label="Tìm">
          <Search className="h-4 w-4" />
        </button>
        <button type="button" className="rounded-full p-1.5 hover:bg-white/10" aria-label="Gọi">
          <Phone className="h-4 w-4" />
        </button>
        <button type="button" className="rounded-full p-1.5 hover:bg-white/10" aria-label="Thêm">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      {/* Vùng tin nhắn */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#dbe7f5] px-3 py-4">
        <p className="mb-4 text-center text-[11px] text-slate-500">Mô phỏng đào tạo — không kết nối Zalo thật</p>
        <div className="space-y-3">
          {parsed.messages.map((m, idx) => (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-[88%]">
                <div className="rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                  <p className="text-[13px] font-semibold text-[#0068ff]">{m.sender}</p>
                  <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-slate-800">
                    {m.text}
                  </p>
                </div>
                <p className="mt-1 pl-1 text-[10px] text-slate-500">
                  {m.time || `${9 + idx}:${String((idx * 7) % 60).padStart(2, '0')}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hành động: chỉ báo cáo + nhập tin rồi gửi = tin tưởng */}
      <footer className="shrink-0 border-t border-[#c5d0e0] bg-white px-2.5 py-2 pb-[env(safe-area-inset-bottom)]">
        <div className="mb-2">
          <QuarantineStamp disabled={!canReport} onClick={onReport} />
        </div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Tin tưởng &amp; trả lời (mô phỏng) — nhập nội dung rồi gửi
        </p>
        <div className="flex items-end gap-1.5 rounded-2xl border border-slate-200 bg-[#f4f7fb] px-2 py-1.5">
          <textarea
            rows={2}
            value={replyText}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder="Nhập tin nhắn…"
            className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
            disabled={!canReport}
          />
          <button
            type="button"
            disabled={!canTrustSend}
            onClick={onTrustSend}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0068ff] text-white shadow-md transition hover:bg-[#0058d4] disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Gửi (tin tưởng)"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </section>
  )
}
