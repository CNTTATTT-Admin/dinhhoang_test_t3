import { Award, Target } from 'lucide-react'

const missions = [
  {
    name: 'Tài khoản ngân hàng giả mạo',
    category: 'Phishing',
    difficulty: 'Easy',
  },
  {
    name: 'SMS OTP đánh cắp thiết bị',
    category: 'Smishing',
    difficulty: 'Medium',
  },
  {
    name: 'Chiến dịch đa kênh tổ chức',
    category: 'SocialEng',
    difficulty: 'Hard',
  },
  {
    name: 'Email HR giả mạo nội bộ',
    category: 'Phishing',
    difficulty: 'Medium',
  },
  {
    name: 'Trang đăng nhập Microsoft giả',
    category: 'Phishing',
    difficulty: 'Easy',
  },
  {
    name: 'Payload mạo danh bản cập nhật',
    category: 'Malware',
    difficulty: 'Hard',
  },
]

function difficultyBadge(level) {
  if (level === 'Easy')
    return 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/30'
  if (level === 'Medium')
    return 'bg-amber-500/20 text-amber-200 ring-amber-400/30'
  return 'bg-red-500/20 text-red-200 ring-red-400/30'
}

export default function MissionsSection() {
  return (
    <section>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(192,132,252,0.2)]">
            Nhiệm vụ mới nhất
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Chọn kịch bản để bắt đầu mô phỏng tấn công.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Target className="h-4 w-4 text-violet-400/80" />
          Cập nhật hôm nay
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {missions.map((m) => (
          <article
            key={m.name}
            className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.08)] transition hover:border-cyan-400/25 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-slate-100 group-hover:text-cyan-100">
                {m.name}
              </h3>
              <Award className="h-5 w-5 shrink-0 text-violet-400/70" aria-hidden />
            </div>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              {m.category}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
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
                className="rounded-lg bg-gradient-to-r from-cyan-600/90 to-violet-600/80 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(34,211,238,0.25)] transition hover:from-cyan-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              >
                Bắt đầu
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
