import { useEffect, useState } from 'react'

export default function DebriefOverlayPanel({
  report,
  finalScore,
  timeTakenSeconds,
  onBackCampaign,
  onRetry,
}) {
  const [animatedExp, setAnimatedExp] = useState(0)
  const passed = Boolean(report?.isPassed)
  const messages = report?.feedbackMessages || []

  useEffect(() => {
    const targetExp = Math.max(0, Number(report?.earnedExp) || 0)
    if (!targetExp) {
      setAnimatedExp(0)
      return
    }
    let current = 0
    const step = Math.max(1, Math.ceil(targetExp / 24))
    const timer = window.setInterval(() => {
      current += step
      if (current >= targetExp) {
        setAnimatedExp(targetExp)
        window.clearInterval(timer)
      } else {
        setAnimatedExp(current)
      }
    }, 25)
    return () => window.clearInterval(timer)
  }, [report?.earnedExp])

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-2xl border border-slate-700 bg-slate-900 text-slate-100">
      <div className="border-b border-slate-700/80 px-5 py-4">
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-300/80">
          SYSTEM REPORT - DEBRIEFING
        </p>
        <h2
          className={[
            'mt-2 text-2xl font-black tracking-wide',
            passed ? 'text-emerald-300' : 'text-red-300',
          ].join(' ')}
        >
          {passed ? 'MISSION COMPLETED' : 'MISSION FAILED'}
        </h2>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Thời gian hoàn thành</p>
          <p className="mt-1 font-mono text-lg text-cyan-200">{timeTakenSeconds}s</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Điểm số đạt được</p>
          <p className="mt-1 font-mono text-lg text-violet-200">{finalScore}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">EXP Nhận được</p>
          <p className="mt-1 font-mono text-lg text-emerald-300">+{animatedExp}</p>
        </div>
      </div>

      <div className="mx-5 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Báo cáo chi tiết
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {messages.map((msg, idx) => {
            const lower = String(msg).toLowerCase()
            const isSystemError = lower.includes('lỗi kết nối') || lower.includes('hệ thống')
            const colorCls = lower.includes('false negative')
              ? 'text-red-300'
              : lower.includes('false positive')
                ? 'text-amber-300'
                : isSystemError
                  ? 'text-orange-400'
                  : 'text-slate-200'
            const prefix = lower.includes('false negative')
              ? '[CẢNH BÁO]'
              : lower.includes('false positive')
                ? '[NHẦM LẪN]'
                : isSystemError
                  ? '[LỖI KẾT NỐI]'
                  : '[GHI CHÚ]'
            return (
              <li key={`${idx}-${msg}`} className={colorCls}>
                <span className="font-bold">{prefix}</span> {msg}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-auto flex flex-wrap gap-3 border-t border-slate-700/80 p-5">
        <button
          type="button"
          onClick={onBackCampaign}
          className="rounded-xl border border-cyan-400/40 bg-cyan-950/40 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-900/50"
        >
          QUAY LẠI CHIẾN DỊCH
        </button>
        {!passed ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-900/50"
          >
            CHƠI LẠI
          </button>
        ) : null}
      </div>
    </section>
  )
}
