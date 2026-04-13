import { Medal, TrendingUp } from 'lucide-react'

const rows = [
  { rank: 1, name: 'cyber_ninja', score: 12400, trend: '+120' },
  { rank: 2, name: 'shield_ops', score: 11820, trend: '+85' },
  { rank: 3, name: 'phish_hunter', score: 11205, trend: '+42' },
  { rank: 4, name: 'blue_team_vn', score: 10480, trend: '+10' },
  { rank: 5, name: 'you', score: 8420, trend: '+210', highlight: true },
]

export default function LeaderboardSection() {
  return (
    <section className="mb-16">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(192,132,252,0.2)]">
            Bảng xếp hạng
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Top học viên theo điểm kinh nghiệm (dữ liệu demo).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <TrendingUp className="h-4 w-4 text-violet-400/80" />
          Cập nhật theo tuần
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 ring-1 ring-white/5">
        <div className="grid grid-cols-12 gap-2 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
          <div className="col-span-2 sm:col-span-1">#</div>
          <div className="col-span-6 sm:col-span-7">Học viên</div>
          <div className="col-span-4 text-right sm:col-span-4">Điểm</div>
        </div>
        <ul>
          {rows.map((row) => (
            <li
              key={row.rank}
              className={[
                'grid grid-cols-12 items-center gap-2 border-b border-white/5 px-4 py-3 text-sm sm:px-6',
                row.highlight
                  ? 'bg-cyan-500/10 ring-1 ring-inset ring-cyan-400/20'
                  : 'hover:bg-white/[0.03]',
              ].join(' ')}
            >
              <div className="col-span-2 flex items-center gap-1 sm:col-span-1">
                {row.rank <= 3 ? (
                  <Medal
                    className={[
                      'h-4 w-4',
                      row.rank === 1 && 'text-amber-400',
                      row.rank === 2 && 'text-slate-300',
                      row.rank === 3 && 'text-amber-700',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                ) : null}
                <span className="font-mono text-slate-400">{row.rank}</span>
              </div>
              <div
                className={[
                  'col-span-6 truncate font-medium sm:col-span-7',
                  row.highlight ? 'text-cyan-200' : 'text-slate-200',
                ].join(' ')}
              >
                {row.name}
              </div>
              <div className="col-span-4 text-right sm:col-span-4">
                <span className="font-semibold tabular-nums text-white">
                  {row.score.toLocaleString('vi-VN')}
                </span>
                <span className="ml-2 text-xs text-emerald-400/90">{row.trend}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
