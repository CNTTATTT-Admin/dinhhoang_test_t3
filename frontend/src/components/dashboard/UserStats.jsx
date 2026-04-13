import { useState } from 'react'
import { Activity, Gauge, ShieldCheck, Sparkles, Target } from 'lucide-react'

export default function UserStats({
  trapClicks = 0,
  correctReports = 0,
  avgResponseTime = 0,
  totalExp = 0,
  completedCampaigns = 0,
  totalCampaigns = 5,
  analytics = null,
}) {
  const [showRawModal, setShowRawModal] = useState(false)
  const safeTrapClicks = Math.max(0, Number(trapClicks) || 0)
  const safeReports = Math.max(0, Number(correctReports) || 0)
  const safeResponse = Math.max(0, Number(avgResponseTime) || 0)
  const safeExp = Math.max(0, Number(totalExp) || 0)

  const safeCompletedCampaigns = Math.max(0, Number(completedCampaigns) || 0)
  const safeTotalCampaigns = Math.max(1, Number(totalCampaigns) || 5)

  const reportAccuracy = safeReports + safeTrapClicks > 0
    ? Math.round((safeReports / (safeReports + safeTrapClicks)) * 100)
    : 50

  const detectionRate = Number(analytics?.detectionRate)
  const falsePositiveRate = Number(analytics?.falsePositiveRate)
  const medianResponseTime = Number(analytics?.medianResponseTime)
  const leakPreventionRate = Number(analytics?.leakPreventionRate)
  const cleanSessionRate = Number(analytics?.cleanSessionRate)
  const phishingEvents = Number(analytics?.phishingEvents)
  const safeEvents = Number(analytics?.safeEvents)
  const totalSessionsCount = Number(analytics?.totalSessions)
  const leakEvents = Number(analytics?.leakEvents)
  const eventCount = Math.max(
    0,
    (Number.isFinite(phishingEvents) ? phishingEvents : 0) +
      (Number.isFinite(safeEvents) ? safeEvents : 0),
  )
  const sessionCount = Math.max(0, Number.isFinite(totalSessionsCount) ? totalSessionsCount : 0)
  const eventConfidence = Math.min(1, eventCount / 20)
  const sessionConfidence = Math.min(1, sessionCount / 6)
  const blendTowardNeutral = (value, confidence, neutral = 50) => {
    const clamped = Math.max(0, Math.min(100, Number(value) || neutral))
    return Math.round(clamped * confidence + neutral * (1 - confidence))
  }

  const detectionScore = Number.isFinite(detectionRate)
    ? blendTowardNeutral(detectionRate, eventConfidence, 50)
    : Math.max(35, Math.min(100, Math.round((safeExp / 75000) * 100)))
  const fpControl = Number.isFinite(falsePositiveRate)
    ? blendTowardNeutral(100 - falsePositiveRate, eventConfidence, 50)
    : Math.max(35, Math.round((safeCompletedCampaigns / safeTotalCampaigns) * 100))
  const medianResponseScore = Number.isFinite(medianResponseTime)
    ? blendTowardNeutral(100 - medianResponseTime * 18, eventConfidence, 55)
    : Math.max(35, Math.min(100, Math.round(100 - safeResponse * 18)))
  const leakPreventionScore = Number.isFinite(leakPreventionRate)
    ? blendTowardNeutral(leakPreventionRate, eventConfidence, 50)
    : Math.max(35, Math.min(100, Math.round(100 - safeTrapClicks * 10)))
  const cleanSessionScore = Number.isFinite(cleanSessionRate)
    ? blendTowardNeutral(cleanSessionRate, sessionConfidence, 50)
    : Math.max(35, reportAccuracy)

  const stats = [
    { key: 'detection', label: 'Detection Rate', value: detectionScore, icon: Sparkles, color: 'text-violet-300' },
    { key: 'fpControl', label: 'FP Control', value: fpControl, icon: Target, color: 'text-cyan-300' },
    { key: 'medianTime', label: 'Median Response', value: medianResponseScore, icon: Gauge, color: 'text-amber-300' },
    { key: 'leakPrevention', label: 'Leak Prevention', value: leakPreventionScore, icon: ShieldCheck, color: 'text-emerald-300' },
    { key: 'cleanSession', label: 'Clean Session', value: cleanSessionScore, icon: Activity, color: 'text-rose-300' },
  ]

  const center = 110
  const radius = 90
  const rings = [20, 40, 60, 80, 100]
  const angleStep = (Math.PI * 2) / stats.length
  const startAngle = -Math.PI / 2

  const pointAt = (valuePct, idx) => {
    const angle = startAngle + idx * angleStep
    const r = (Math.max(0, Math.min(100, valuePct)) / 100) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const polygonPoints = stats
    .map((s, idx) => {
      const p = pointAt(s.value, idx)
      return `${p.x},${p.y}`
    })
    .join(' ')

  const rankFromValue = (v) => {
    if (v >= 90) return 'S'
    if (v >= 75) return 'A'
    if (v >= 60) return 'B'
    if (v >= 55) return 'C'
    return 'D'
  }

  const radarBoxSize = 280
  const cardDistance = 66
  const cardSize = { w: 132, h: 84 }
  const cornerCards = stats.map((stat, idx) => {
    const angle = startAngle + idx * angleStep
    const vertex = pointAt(100, idx)
    const dx = Math.cos(angle)
    const dy = Math.sin(angle)
    const cx = vertex.x + dx * cardDistance
    const cy = vertex.y + dy * cardDistance
    const left = ((cx / 220) * radarBoxSize) - cardSize.w / 2
    const top = ((cy / 220) * radarBoxSize) - cardSize.h / 2
    return {
      key: stat.key,
      stat,
      left,
      top,
    }
  })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <div>
        <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setShowRawModal(true)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-100"
            >
              Xem dữ liệu gốc
            </button>
        </div>

        <div className="relative mx-auto hidden h-[420px] w-full max-w-[720px] md:block">
          <div className="absolute left-1/2 top-[46%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2">
            <svg viewBox="0 0 220 220" className="h-full w-full">
              {rings.map((ring) => {
                const points = stats
                  .map((_, idx) => {
                    const p = pointAt(ring, idx)
                    return `${p.x},${p.y}`
                  })
                  .join(' ')
                return (
                  <polygon
                    key={`ring-${ring}`}
                    points={points}
                    fill="none"
                    stroke="rgba(148,163,184,0.25)"
                    strokeWidth="1"
                  />
                )
              })}

              {stats.map((_, idx) => {
                const p = pointAt(100, idx)
                return (
                  <line
                    key={`axis-${idx}`}
                    x1={center}
                    y1={center}
                    x2={p.x}
                    y2={p.y}
                    stroke="rgba(148,163,184,0.2)"
                    strokeWidth="1"
                  />
                )
              })}

              <polygon
                points={polygonPoints}
                fill="rgba(34,211,238,0.28)"
                stroke="rgba(56,189,248,0.95)"
                strokeWidth="2"
              />

              {stats.map((s, idx) => {
                const p = pointAt(s.value, idx)
                return (
                  <circle
                    key={`dot-${s.key}`}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="rgba(125,211,252,0.95)"
                    stroke="rgba(6,182,212,1)"
                    strokeWidth="1"
                  />
                )
              })}
            </svg>

            {cornerCards.map(({ key, top, left, stat }) => (
              <div
                key={key}
                className="absolute w-[132px] rounded-xl border border-white/10 bg-slate-950/80 px-2.5 py-2 shadow-[0_10px_25px_rgba(0,0,0,0.25)] backdrop-blur"
                style={{ top: `${top}px`, left: `${left}px` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5">
                    {stat?.icon ? <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} aria-hidden /> : null}
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-300">
                      {stat?.label}
                    </p>
                  </div>
                  <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-100">
                    {rankFromValue(stat?.value ?? 0)}
                  </span>
                </div>
                <div className="mt-1 flex items-end justify-end gap-1">
                  <span className="text-base font-black leading-none tabular-nums text-white">{stat?.value ?? 0}</span>
                  <span className="text-[11px] text-slate-400">/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 md:hidden">
          {stats.map((s) => (
            <div key={s.key} className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5">
                  <s.icon className={`h-3.5 w-3.5 ${s.color}`} aria-hidden />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">{s.label}</p>
                </div>
                <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-100">
                  {rankFromValue(s.value)}
                </span>
              </div>
              <p className="mt-1 text-right text-lg font-black tabular-nums text-white">{s.value}<span className="text-xs text-slate-400">/100</span></p>
            </div>
          ))}
        </div>
      </div>

      {showRawModal ? (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/65 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowRawModal(false)
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-[0_0_35px_rgba(0,0,0,0.35)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-200">Dữ liệu gốc</p>
              <button
                type="button"
                onClick={() => setShowRawModal(false)}
                className="rounded-lg px-2 py-1 text-sm text-slate-300 hover:bg-white/5"
              >
                Đóng
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-slate-300">
              <span>Báo cáo đúng:</span><span className="font-semibold text-cyan-200">{safeReports}</span>
              <span>Bẫy đã dính:</span><span className="font-semibold text-rose-200">{safeTrapClicks}</span>
              <span>Tốc độ TB:</span><span className="font-semibold text-amber-200">{safeResponse.toFixed(2)}s</span>
              <span>Detection Rate:</span><span className="font-semibold text-cyan-200">{Number.isFinite(detectionRate) ? `${detectionRate.toFixed(2)}%` : '--'}</span>
              <span>False Positive Rate:</span><span className="font-semibold text-rose-200">{Number.isFinite(falsePositiveRate) ? `${falsePositiveRate.toFixed(2)}%` : '--'}</span>
              <span>Median Response Time:</span><span className="font-semibold text-amber-200">{Number.isFinite(medianResponseTime) ? `${medianResponseTime.toFixed(2)}s` : '--'}</span>
              <span>Leak Prevention:</span><span className="font-semibold text-violet-200">{Number.isFinite(leakPreventionRate) ? `${leakPreventionRate.toFixed(2)}%` : '--'}</span>
              <span>Clean Session Rate:</span><span className="font-semibold text-emerald-200">{Number.isFinite(cleanSessionRate) ? `${cleanSessionRate.toFixed(2)}%` : '--'}</span>
              <span>Phishing events:</span><span className="font-semibold text-slate-100">{Number.isFinite(phishingEvents) ? phishingEvents : '--'}</span>
              <span>Safe events:</span><span className="font-semibold text-slate-100">{Number.isFinite(safeEvents) ? safeEvents : '--'}</span>
              <span>Total sessions:</span><span className="font-semibold text-slate-100">{Number.isFinite(totalSessionsCount) ? totalSessionsCount : '--'}</span>
              <span>Leak events:</span><span className="font-semibold text-slate-100">{Number.isFinite(leakEvents) ? leakEvents : '--'}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

