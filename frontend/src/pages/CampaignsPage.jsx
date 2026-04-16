import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react'
import PageShell from '../components/layout/PageShell.jsx'
import * as scenarioService from '../services/scenarioService.js'
import * as authService from '../services/authService.js'
import { TOKEN_KEY, clearAuthStorage, resolveStoredToken } from '../utils/axiosClient.js'

function difficultyBadge(level) {
  if ((level || '').toLowerCase() === 'easy') {
    return 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30'
  }
  if ((level || '').toLowerCase() === 'medium') {
    return 'bg-amber-500/20 text-amber-200 ring-amber-400/30'
  }
  return 'bg-red-500/20 text-red-200 ring-red-400/30'
}

function normalizeDifficulty(value) {
  const v = String(value || '').trim().toLowerCase()
  if (!v) return 'unknown'
  if (v.includes('easy')) return 'easy'
  if (v.includes('medium')) return 'medium'
  if (v.includes('hard')) return 'hard'
  if (v.includes('extreme')) return 'extreme'
  return v
}

function difficultyStars(level) {
  const d = normalizeDifficulty(level)
  if (d === 'easy') return 1
  if (d === 'medium') return 3
  if (d === 'hard') return 4
  if (d === 'extreme') return 5
  return 2
}

function isScenarioCompleted(item) {
  // Backend entity doesn't include completion; keep this tolerant for future DTO upgrades.
  return Boolean(item?.isCompleted || item?.completed || item?.status === 'COMPLETED')
}

function isUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
}

function isTutorialScenario(item) {
  const v = item?.tutorialMode ?? item?.tutorial_mode
  return v === 1 || v === '1'
}

export default function CampaignsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [scenarios, setScenarios] = useState([])
  const [query, setQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        setIsLoading(true)
        setError('')
        const { data } = await scenarioService.getScenarios()
        if (!alive) return
        setScenarios(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!alive) return
        setError(
          err?.response?.status === 403
            ? 'Bạn cần đăng nhập để xem danh sách chiến dịch.'
            : err?.response?.data?.message ||
                err?.message ||
                'Không thể tải danh sách chiến dịch.',
        )
      } finally {
        if (alive) setIsLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const hasToken = !!sessionStorage.getItem(TOKEN_KEY)
  const handleLogout = useCallback(async () => {
    try {
      if (resolveStoredToken()) {
        await authService.logout()
      }
    } catch {
      // Server logout can fail on expired token; still clear client auth state.
    } finally {
      clearAuthStorage()
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const tutorialScenarios = useMemo(
    () => (Array.isArray(scenarios) ? scenarios : []).filter(isTutorialScenario),
    [scenarios],
  )

  const filteredScenarios = useMemo(() => {
    const q = query.trim().toLowerCase()
    const df = difficultyFilter
    return tutorialScenarios.filter((s) => {
      const hay = [
        s?.title,
        s?.category,
        s?.difficulty,
        s?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesQuery = !q || hay.includes(q)

      const d = normalizeDifficulty(s?.difficulty)
      const matchesDifficulty =
        df === 'all' ||
        (df === 'easy' && d === 'easy') ||
        (df === 'medium' && d === 'medium') ||
        (df === 'hard' && d === 'hard') ||
        (df === 'extreme' && (d === 'extreme' || d === 'hard'))

      return matchesQuery && matchesDifficulty
    })
  }, [difficultyFilter, query, tutorialScenarios])

  const totalCount = tutorialScenarios.length
  const completedCount = useMemo(
    () => tutorialScenarios.filter((s) => isScenarioCompleted(s)).length,
    [tutorialScenarios],
  )
  const overallPct = useMemo(() => {
    if (!totalCount) return 0
    return Math.round((completedCount / totalCount) * 100)
  }, [completedCount, totalCount])

  return (
    <PageShell
      headerVariant={hasToken ? 'user' : 'guest'}
      onLogout={hasToken ? handleLogout : undefined}
    >
      <main className="flex-grow bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col flex-grow bg-[#0B1120]">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-md shadow-[0_0_55px_rgba(0,0,0,0.35)] sm:p-5">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative rounded-2xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <label className="sr-only" htmlFor="campaign-search">
                    Tìm kiếm chiến dịch
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="campaign-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Truy tìm chiến dịch..."
                      className="w-full rounded-2xl border border-cyan-400/15 bg-slate-900/30 py-2.5 pl-10 pr-3 text-sm text-white outline-none ring-1 ring-white/5 transition focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'easy', label: 'Dễ (Mass Phishing)' },
                    { id: 'medium', label: 'Trung bình' },
                    { id: 'hard', label: 'Khó (Spear Phishing)' },
                    { id: 'extreme', label: 'Cực khó (BEC)' },
                  ].map((opt) => {
                    const active = difficultyFilter === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDifficultyFilter(opt.id)}
                        className={[
                          'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                          'ring-1',
                          active
                            ? 'bg-gradient-to-r from-cyan-600/90 to-violet-600/80 text-white ring-cyan-400/25 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                            : 'bg-slate-900/50 text-slate-200 ring-white/10 hover:bg-slate-800/70 hover:text-cyan-200',
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>

                <div className="min-w-[240px]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-violet-200/90" aria-hidden />
                      Tiến độ tổng
                    </span>
                    <span className="font-mono text-slate-200">{overallPct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800/80">
                    <div
                      className="h-2 bg-gradient-to-r from-cyan-400 to-violet-500"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {completedCount}/{totalCount} chiến dịch hoàn thành
                  </p>
                </div>
              </div>
            </div>
          </section>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden />
              <span>{error}</span>
            </div>
            {!hasToken ? (
              <Link
                to="/login"
                className="mt-3 inline-flex rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Đăng nhập ngay
              </Link>
            ) : null}
          </div>
        ) : null}

        <section className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="h-64 animate-pulse rounded-3xl border border-white/10 bg-slate-900/60"
                />
              ))}
            </div>
          ) : null}
          {isLoading ? (
            <p className="mt-3 text-sm text-slate-400">Đang tải dữ liệu...</p>
          ) : null}

          {!isLoading && scenarios.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
              Chưa có dữ liệu chiến dịch trong hệ thống.
            </div>
          ) : null}

          {!isLoading && scenarios.length > 0 && tutorialScenarios.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
              Không có chiến dịch tutorial (tutorialMode = 1) nào khả dụng.
            </div>
          ) : null}

          {!isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredScenarios.map((item) => {
                const valid = isUuid(item?.id)
                const completed = isScenarioCompleted(item)
                const stars = difficultyStars(item?.difficulty)
                return (
                  <article
                    key={item?.id || item?.title}
                    className={[
                      'group relative overflow-hidden rounded-3xl border bg-slate-950/40 p-5 backdrop-blur-md transition',
                      'border-white/10 hover:border-cyan-400/30 hover:bg-slate-900/70',
                      'hover:shadow-[0_0_34px_rgba(34,211,238,0.18)]',
                    ].join(' ')}
                  >
                    {completed ? (
                      <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        COMPLETED
                      </span>
                    ) : null}

                    <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      <img
                        src={
                          item?.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
                        }
                        alt={item?.title || 'Campaign thumbnail'}
                        className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/10" />
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-extrabold text-white group-hover:text-cyan-100">
                        {item?.title || 'Chiến dịch chưa đặt tên'}
                      </h3>
                      <Target className="h-4 w-4 shrink-0 text-violet-300/80" aria-hidden />
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                      {item?.category || 'Unknown'}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-300">
                      {item?.description || 'Mô phỏng huấn luyện an ninh thông tin theo tình huống.'}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                            difficultyBadge(item?.difficulty),
                          ].join(' ')}
                        >
                          {item?.difficulty || 'Easy'}
                        </span>
                        <div className="flex items-center gap-0.5" aria-label={`Độ khó: ${stars}/5`}>
                          {Array.from({ length: 5 }).map((_, i) => {
                            const on = i < stars
                            return (
                              <span
                                key={`star-${i}`}
                                className={[
                                  'h-2.5 w-2.5 rotate-45 rounded-[3px] border',
                                  on
                                    ? 'border-cyan-300/70 bg-cyan-400/25 shadow-[0_0_10px_rgba(34,211,238,0.18)]'
                                    : 'border-white/10 bg-slate-800/60',
                                ].join(' ')}
                              />
                            )
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!valid}
                        onClick={() => navigate(`/campaign/${item.id}/sessions`)}
                        className={[
                          'inline-flex items-center gap-1 rounded-2xl px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition',
                          'bg-gradient-to-r from-cyan-600/90 to-violet-600/80 shadow-[0_0_18px_rgba(34,211,238,0.16)]',
                          'hover:from-cyan-500 hover:to-violet-500 active:scale-[0.98]',
                          'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
                        ].join(' ')}
                      >
                        {completed ? 'Ôn tập lại' : 'Bắt đầu huấn luyện'}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : null}

          {!isLoading &&
          tutorialScenarios.length > 0 &&
          filteredScenarios.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
              Không tìm thấy chiến dịch phù hợp với bộ lọc/từ khóa hiện tại.
            </div>
          ) : null}
        </section>
        </div>
      </main>
    </PageShell>
  )
}

