import {
  CheckCircle,
  Download,
  File,
  Inbox,
  Link2,
  Mail,
  Menu,
  MoreVertical,
  Search,
  Send,
  Star,
  Trash2,
  User,
} from 'lucide-react'

function InspectionTooltip({ open, value, label }) {
  if (!open || !value) return null
  return (
    <div className="absolute left-0 top-full z-30 mt-2 w-max max-w-[90vw] rounded-lg border border-cyan-400/40 bg-[#081426] px-3 py-2 text-xs text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.15)]">
      {label}: <span className="font-mono">{value}</span>
    </div>
  )
}

export default function GmailWindow({
  queue,
  currentIndex,
  currentEmail,
  scenarioType,
  status,
  hoveredUrl,
  onHoverUrl,
  onSenderToggle,
  senderTooltipOpen,
  canAct,
  canVerifyMail,
  attachmentSpec,
  onFileDownload,
  onLinkClick,
  onVerifyMail,
  mailOtpMode,
  isShaking,
}) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-[#f6f8fc] text-slate-800">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200/90 bg-white px-2 py-2 sm:px-4">
        <button
          type="button"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
            <Mail className="h-6 w-6 text-[#ea4335]" strokeWidth={2.2} />
          </div>
          <span className="hidden text-[22px] font-normal text-[#5f6368] sm:inline">Gmail</span>
        </div>
        <div className="mx-1 min-w-0 flex-1 sm:mx-4">
          <div className="flex items-center gap-2 rounded-full bg-[#eaf1fb] px-4 py-2.5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
            <Search className="h-5 w-5 shrink-0 text-[#5f6368]" />
            <span className="truncate text-sm text-[#5f6368]">Tìm trong thư</span>
          </div>
        </div>
        <button type="button" className="rounded-full p-1 text-slate-600 hover:bg-slate-100" aria-label="Tài khoản">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-[#e8f0fe]">
            <User className="h-5 w-5 text-[#1a73e8]" />
          </span>
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[minmax(220px,260px)_1fr]">
        <aside className="flex min-h-0 flex-col border-r border-slate-200/80 bg-[#f0f4f9]">
          <div className="p-3">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_1px_2px_rgba(60,64,67,0.15)] transition hover:shadow-md"
            >
              <span className="text-xl leading-none text-[#1a73e8]">+</span>
              Soạn thư
            </button>
          </div>
          <nav className="space-y-0.5 px-2 text-[14px]">
            <div className="flex items-center gap-2 rounded-r-full bg-[#d3e3fd] px-3 py-2 font-semibold text-[#0b57d0]">
              <Inbox className="h-5 w-5" />
              Hộp thư đến
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#0b57d0]">
                {queue.length}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-r-full px-3 py-2 text-slate-700 hover:bg-slate-200/60">
              <Star className="h-5 w-5 text-slate-500" />
              Có gắn sao
            </div>
            <div className="flex items-center gap-2 rounded-r-full px-3 py-2 text-slate-700 hover:bg-slate-200/60">
              <Send className="h-5 w-5 text-slate-500" />
              Đã gửi
            </div>
            <div className="flex items-center gap-2 rounded-r-full px-3 py-2 text-slate-700 hover:bg-slate-200/60">
              <Trash2 className="h-5 w-5 text-slate-500" />
              Thùng rác
            </div>
          </nav>
          <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto border-t border-slate-200/80 px-2 py-3">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Thư trong hàng đợi
            </p>
            {queue.map((mail, i) => {
              const active = status === 'PLAYING' && i === currentIndex
              const done = i < currentIndex || status === 'VICTORY'
              return (
                <div
                  key={mail.id}
                  className={[
                    'rounded-xl border px-3 py-2.5 text-xs transition',
                    active
                      ? 'border-[#aecbfa] bg-white shadow-sm'
                      : done
                        ? 'border-transparent bg-slate-200/40 text-slate-500'
                        : 'border-transparent bg-white/60 text-slate-700',
                  ].join(' ')}
                >
                  <p className="truncate font-semibold">{mail.senderName}</p>
                  <p className="truncate text-[11px] text-slate-600">{mail.subject}</p>
                </div>
              )
            })}
          </div>
        </aside>

        <div className="relative flex min-h-0 flex-col bg-white">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2">
            <div className="flex items-center gap-2 text-slate-500">
              <input type="checkbox" className="rounded border-slate-300" readOnly aria-hidden />
              <button type="button" className="rounded p-1.5 hover:bg-slate-100">
                <Trash2 className="h-4 w-4" />
              </button>
              {scenarioType !== 'MAIL_FILE' && scenarioType !== 'MAIL_WEB' ? (
                <button
                  type="button"
                  onClick={onVerifyMail}
                  className="rounded p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                  title="Xác nhận an toàn"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <button type="button" className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div
              className={[
                'mx-auto max-w-[720px] rounded-xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition',
                isShaking ? 'animate-[wiggle_180ms_ease-in-out_1]' : '',
              ].join(' ')}
            >
              <h2 className="text-[22px] font-normal leading-snug text-[#202124]">
                {currentEmail?.subject}
              </h2>
              <div className="mt-4 flex flex-wrap items-start gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-bold text-white">
                  {(currentEmail?.senderName || '?').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="relative flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={onSenderToggle}
                      className="text-left text-[15px] font-semibold text-[#202124] hover:underline"
                    >
                      {currentEmail?.senderName}
                    </button>
                    <span className="text-sm text-[#5f6368]">&lt;{currentEmail?.senderEmail}&gt;</span>
                    <InspectionTooltip
                      open={senderTooltipOpen}
                      value={currentEmail?.senderEmail}
                      label="Địa chỉ gửi"
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#5f6368]">tới tôi</p>
                </div>
              </div>

              <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-[14px] leading-[1.6] text-[#202124]">
                {currentEmail?.body}
              </pre>

              {currentEmail?.linkUrl && currentEmail.linkUrl !== '#' ? (
                <div className="mt-6">
                  <a
                    href={currentEmail.linkUrl}
                    onClick={(e) => {
                      e.preventDefault()
                      onLinkClick(currentEmail.linkUrl)
                    }}
                    onMouseEnter={() => onHoverUrl(currentEmail.linkUrl)}
                    onMouseLeave={() => onHoverUrl('')}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Link2 className="h-4 w-4" />
                    {currentEmail.linkLabel || currentEmail.linkUrl}
                  </a>
                </div>
              ) : null}

              {attachmentSpec ? (
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="mb-3 text-sm font-medium text-slate-500">1 tệp đính kèm</h3>
                  <div
                    onClick={() => onFileDownload(attachmentSpec.fileName)}
                    onMouseEnter={() => onHoverUrl(`Tải xuống tệp: ${attachmentSpec.fileName}`)}
                    onMouseLeave={() => onHoverUrl('')}
                    className="group relative flex w-64 cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    <div
                      className={[
                        'flex h-24 w-full items-center justify-center',
                        attachmentSpec.fileName?.endsWith('.exe') || attachmentSpec.fileName?.endsWith('.js')
                          ? 'bg-red-50 text-red-400'
                          : 'bg-slate-50 text-slate-400',
                      ].join(' ')}
                    >
                      <File className="h-10 w-10 opacity-50" />
                    </div>
                    <div className="flex items-center gap-3 border-t border-slate-100 bg-white p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-100 text-red-600">
                        <span className="text-[10px] font-bold">PDF</span>
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-slate-700 group-hover:text-blue-600">
                          {attachmentSpec.fileName}
                        </span>
                        <span className="text-xs text-slate-500">{attachmentSpec.mimeLabel}</span>
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 rounded bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Download className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-[#f6f8fc] px-4 py-2.5">
            {mailOtpMode ? (
              <p className="rounded-lg border border-cyan-300/40 bg-cyan-50 px-3 py-2 text-sm text-cyan-950">
                Bạn đã xử lý xong hàng đợi email. <strong>Nhập mã OTP</strong> vào ô ở panel phía dưới (mã nằm trong
                email mô phỏng).
              </p>
            ) : (
              <>
                {attachmentSpec && !canVerifyMail && canAct ? (
                  <p className="mb-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Bạn cần <strong>mở và xem nội dung file</strong> (nhấn link có biểu tượng ghim) trước khi chọn Tin
                    tưởng — URL và người gửi có thể trông hợp lệ nhưng file vẫn nguy hiểm.
                  </p>
                ) : null}
                <p className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  Cơ chế Action-Driven: kiểm tra sender, link, file; nếu nghi ngờ hãy dùng nút{' '}
                  <strong>BÁO CÁO PHISHING</strong> trên Taskbar.
                </p>
              </>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-[#f8fafc] px-4 py-2.5 text-[10px] font-mono text-slate-700">
            {hoveredUrl ? `URL: ${hoveredUrl}` : 'Hover link để xem URL đầy đủ'}
          </div>
        </div>
      </div>
    </section>
  )
}
