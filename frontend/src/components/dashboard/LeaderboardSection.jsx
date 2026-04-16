import { useEffect, useState } from 'react'
import { Medal } from 'lucide-react'
import * as leaderboardService from '../../services/leaderboardService.js'

export default function LeaderboardSection() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await leaderboardService.getTopByExp()
        if (!alive) return
        const currentUsername = sessionStorage.getItem('cybershield_username')
        const mapped =
          Array.isArray(data) && data.length
            ? data.map((user, index) => ({
                rank: index + 1,
                name: user.username,
                level: user.level,
                exp: user.totalExp,
                highlight:
                  currentUsername &&
                  typeof currentUsername === 'string' &&
                  currentUsername === user.username,
              }))
            : []
        setRows(mapped)
      } catch (err) {
        if (!alive) return
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Không thể tải bảng xếp hạng.',
        )
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="mb-16">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(192,132,252,0.2)]">
            Bảng xếp hạng
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Top 10 học viên theo kinh nghiệm (EXP).
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 ring-1 ring-white/5">
        <div className="grid grid-cols-12 gap-2 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
          <div className="col-span-2 sm:col-span-1">#</div>
          <div className="col-span-4 sm:col-span-5">Học viên</div>
          <div className="col-span-3 text-right sm:col-span-3">Lv</div>
          <div className="col-span-3 text-right sm:col-span-3">EXP</div>
        </div>
        {loading ? (
          <div className="px-4 py-4 text-sm text-slate-300 sm:px-6">
            Đang tải bảng xếp hạng...
          </div>
        ) : error ? (
          <div className="px-4 py-4 text-sm text-red-300 sm:px-6">{error}</div>
        ) : (
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
                    'col-span-4 truncate font-medium sm:col-span-5',
                    row.highlight ? 'text-cyan-200' : 'text-slate-200',
                  ].join(' ')}
                >
                  {row.name}
                </div>
                <div className="col-span-3 text-right sm:col-span-3">
                  <span className="font-semibold tabular-nums text-slate-100">
                    {row.level}
                  </span>
                </div>
                <div className="col-span-3 text-right sm:col-span-3">
                  <span className="font-semibold tabular-nums text-white">
                    {Number(row.exp || 0).toLocaleString('vi-VN')}
                  </span>
                </div>
              </li>
            ))}
            {!rows.length ? (
              <li className="px-4 py-4 text-sm text-slate-400 sm:px-6">
                Chưa có dữ liệu leaderboard.
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </section>
  )
}
