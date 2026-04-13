import { Clock3, ShieldCheck, Target } from 'lucide-react'

export default function UserStats({
  trapClicks = 0,
  correctReports = 0,
  avgResponseTime = 0,
}) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-red-500/15 p-2 ring-1 ring-red-400/25">
            <Target className="h-4 w-4 text-red-400/90" aria-hidden />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Bẫy
            </p>
            <p className="text-lg font-bold text-white tabular-nums">
              {trapClicks}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-cyan-500/15 p-2 ring-1 ring-cyan-400/25">
            <ShieldCheck className="h-4 w-4 text-cyan-400/90" aria-hidden />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Báo cáo
            </p>
            <p className="text-lg font-bold text-white tabular-nums">
              {correctReports}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-500/15 p-2 ring-1 ring-amber-400/25">
            <Clock3 className="h-4 w-4 text-amber-400/90" aria-hidden />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Phản hồi
            </p>
            <p className="text-lg font-bold text-white tabular-nums">
              {Number(avgResponseTime).toFixed(2)}s
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

