import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lock, ShieldAlert, Sparkles } from 'lucide-react'
import * as scenarioService from '../services/scenarioService.js'
import * as sessionService from '../services/sessionService.js'
import * as authService from '../services/authService.js'
import PageShell from '../components/layout/PageShell.jsx'
import { clearAuthStorage, resolveStoredToken } from '../utils/axiosClient.js'

function isUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
}

function getSessionState(item) {
  if (item?.isCompleted) return 'completed'
  if (item?.isLocked) return 'locked'
  return 'ready'
}

function stepTypeMeta(stepType) {
  const u = (stepType || 'MAIL').toString().toUpperCase()
  if (u === 'WEB_PAGE') {
    return { label: 'Web', className: 'bg-blue-500/15 text-blue-200 ring-blue-400/25' }
  }
  if (u === 'OTP') {
    return { label: 'OTP', className: 'bg-amber-500/15 text-amber-200 ring-amber-400/25' }
  }
  if (u === 'ZALO') {
    return { label: 'Zalo', className: 'bg-sky-500/15 text-sky-200 ring-sky-400/25' }
  }
  if (u === 'MAIL_OTP') {
    return { label: 'Mail + OTP', className: 'bg-violet-500/15 text-violet-200 ring-violet-400/25' }
  }
  return { label: 'Mail', className: 'bg-slate-500/15 text-slate-200 ring-slate-400/25' }
}

function threatDots(level) {
  const value = Math.max(1, Math.min(5, Number(level) || 1))
  return Array.from({ length: 5 }, (_, i) => i < value)
}

export default function SessionSelector() {
  const { scenarioId } = useParams()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [scenario, setScenario] = useState(null)
  const [sessions, setSessions] = useState([])
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

  useEffect(() => {
    let alive = true

    const load = async () => {
      if (!scenarioId || !isUuid(scenarioId)) {
        setError('Scenario ID không hợp lệ. Hãy vào lại từ Dashboard để lấy UUID thật.')
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        setError('')
        const [scenarioRes, sessionsRes] = await Promise.all([
          scenarioService.getScenarioById(scenarioId),
          sessionService.fetchSessionsByScenario(scenarioId),
        ])
        if (!alive) return
        setScenario(scenarioRes.data)
        setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : [])
      } catch (err) {
        if (!alive) return
        setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách nhiệm vụ.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [scenarioId])

  const campaignTitle = useMemo(
    () => scenario?.title || 'Chiến dịch: Sơ hở từ hòm thư',
    [scenario?.title],
  )
  const completedCount = useMemo(
    () => sessions.filter((s) => Boolean(s?.isCompleted)).length,
    [sessions],
  )
  const progressPct = useMemo(() => {
    if (!sessions.length) return 0
    return Math.round((completedCount / sessions.length) * 100)
  }, [completedCount, sessions.length])

  return (
    <PageShell headerVariant="user" onLogout={handleLogout}>
      <div className="flex-1 flex flex-col w-full bg-[#0B1120] text-white">
        <main className="mx-auto flex w-full max-w-6xl flex-grow flex-col bg-[#0B1120] px-6 py-8 md:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Quay lại Chiến dịch
          </Link>
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200 ring-1 ring-violet-400/30">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
            Session Selector
          </p>
        </div>

        <section className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm shadow-[0_0_32px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold !text-white tracking-tight drop-shadow-lg">
                {campaignTitle}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Chọn nhiệm vụ để bắt đầu. Hoàn thành tuần tự để mở khóa các bài tiếp theo.
              </p>

              <div className="mt-8">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>{completedCount}/{sessions.length || 0} Nhiệm vụ hoàn thành</span>
                  <span className="font-mono text-cyan-400 drop-shadow-md">{progressPct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full border border-slate-700/50 bg-[#0B1120]">
                  <div
                    className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md">
          {isLoading ? (
            <div className="space-y-3">
              {['skeleton-1', 'skeleton-2', 'skeleton-3'].map((key) => (
                <div
                  key={key}
                  className="h-28 animate-pulse rounded-2xl border border-white/10 bg-slate-900/60"
                />
              ))}
            </div>
          ) : null}

          {!isLoading && sessions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
              Chưa có nhiệm vụ trong chiến dịch này.
            </div>
          ) : null}

          {!isLoading && sessions.length > 0 ? (
            <div className="relative mt-2 pl-2">
              <div className="space-y-5">
                {sessions.map((item, idx) => {
                  const state = getSessionState(item)
                  const isCompleted = state === 'completed'
                  const isLocked = state === 'locked'
                  const isReady = state === 'ready'
                  const isLast = idx === sessions.length - 1
                  const typeBadge = stepTypeMeta(item.stepType)
                  return (
                    <div key={item.sessionId} className="relative pl-10">
                      {!isLast ? (
                        <div className="absolute left-[18px] top-[44px] h-[calc(100%+12px)] w-0.5 bg-gradient-to-b from-cyan-400/40 via-cyan-300/20 to-slate-700/30" />
                      ) : null}

                      <div
                        className={[
                          'absolute left-0 top-7 z-10 flex h-9 w-9 items-center justify-center rounded-full border text-xs shadow-[0_0_14px_rgba(0,0,0,0.35)]',
                          isCompleted &&
                            'border-emerald-300/60 bg-emerald-500/20 text-emerald-200',
                          isReady &&
                            'border-cyan-300/70 bg-cyan-500/20 text-cyan-100 ring-4 ring-cyan-400/20 animate-pulse',
                          isLocked && 'border-slate-500/60 bg-slate-700/40 text-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-hidden
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>

                      <article
                        className={[
                          'rounded-2xl border bg-slate-900/55 p-5 transition',
                          isCompleted &&
                            'border-emerald-400/25 shadow-[0_0_22px_rgba(16,185,129,0.12)]',
                          isReady &&
                            'scale-[1.01] border-cyan-400/40 shadow-[0_0_28px_rgba(34,211,238,0.16)]',
                          isLocked && 'border-white/10 opacity-60 grayscale-[0.18]',
                          !isLocked && 'hover:-translate-y-0.5',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Level {item.stepOrder ?? item.orderNumber ?? '-'}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <h3 className="min-w-0 break-words text-base font-bold text-white">
                                {item.lessonTitle}
                              </h3>
                              <span
                                className={[
                                  'inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1',
                                  typeBadge.className,
                                ].join(' ')}
                              >
                                {typeBadge.label}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-1.5">
                              {threatDots(item.threatLevel).map((on, idx) => (
                                <span
                                  key={`${item.sessionId}-${idx}`}
                                  className={[
                                    'h-2.5 w-2.5 rounded-full border',
                                    on
                                      ? 'border-amber-300/70 bg-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                                      : 'border-slate-600 bg-slate-700/60',
                                  ].join(' ')}
                                />
                              ))}
                              <span className="ml-1 text-xs text-slate-400">
                                Threat {Number(item.threatLevel) || 1}/5
                              </span>
                            </div>

                            <p className="mt-3 text-sm italic text-slate-300/90">
                              {item.objective || 'Mục tiêu nhiệm vụ sẽ hiển thị tại đây.'}
                            </p>
                          </div>

                          <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:min-w-[140px] sm:items-end">
                            <span
                              className={[
                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                                isCompleted &&
                                  'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30',
                                isReady &&
                                  'bg-cyan-500/20 text-cyan-200 ring-cyan-400/30',
                                isLocked &&
                                  'bg-slate-500/20 text-slate-300 ring-slate-400/30',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Đã hoàn thành
                                </>
                              ) : isLocked ? (
                                <>
                                  <Lock className="h-3.5 w-3.5" />
                                  Đã khóa
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  Sẵn sàng
                                </>
                              )}
                            </span>

                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() =>
                                navigate(`/play/${item.sessionId}`, {
                                  state: {
                                    scenarioId: scenario?.id || scenarioId,
                                    campaignTitle: scenario?.title || 'Chiến dịch huấn luyện',
                                    lesson: item,
                                  },
                                })
                              }
                              className={[
                                'rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
                                isLocked
                                  ? 'bg-slate-700/70 text-slate-300'
                                  : isReady
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.22)] hover:brightness-110 active:scale-[0.98]'
                                    : 'bg-emerald-600/80 text-white hover:bg-emerald-500',
                              ].join(' ')}
                            >
                              {isCompleted ? 'Ôn tập lại' : 'Bắt đầu'}
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </section>
        </main>
      </div>
    </PageShell>
  )
}

