import { Award, Target } from 'lucide-react'

const fallbackMissions = [
  {
    id: null,
    title: 'Chưa có chiến dịch khả dụng',
    category: 'System',
    difficulty: 'Easy',
  },
]

function isUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
}

function difficultyBadge(level) {
  if (level === 'Easy') return 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30'
  if (level === 'Medium') return 'bg-amber-500/20 text-amber-200 ring-amber-400/30'
  return 'bg-red-500/20 text-red-200 ring-red-400/30'
}

export default function MissionsTab({
  scenarios = [],
  onStartTraining,
  disabled = false,
}) {
  const missions =
    scenarios.length > 0
      ? scenarios.map((s) => ({
          id: isUuid(s?.id) ? s.id : null,
          title: s.title,
          category: s.category,
          difficulty: s.difficulty,
        }))
      : fallbackMissions

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Nhiệm vụ</h3>
            <p className="mt-1 text-sm text-slate-300">
              Chọn kịch bản để bắt đầu mô phỏng huấn luyện.
            </p>
          </div>
          <Target className="h-5 w-5 text-violet-300/80" aria-hidden />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {missions.map((m) => (
          <article
            key={m.id}
            className="group rounded-2xl border border-white/10 bg-slate-900/30 p-5 transition hover:border-cyan-400/25 hover:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-base font-semibold text-slate-100 group-hover:text-cyan-100">
                {m.title}
              </h4>
              <Award className="h-5 w-5 shrink-0 text-violet-400/70" aria-hidden />
            </div>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              {m.category}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span
                className={[
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                  difficultyBadge(m.difficulty),
                ].join(' ')}
              >
                {m.difficulty}
              </span>

              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-cyan-600/90 to-violet-600/80 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(34,211,238,0.22)] transition hover:from-cyan-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled || !m.id}
                onClick={() => onStartTraining?.(m.id)}
              >
                Bắt đầu huấn luyện
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

