import UserStats from './UserStats.jsx'

/** EXP tối đa hệ thống (rank Thách Đấu) — đồng bộ với tier 75k trong DB. */
const MAX_SYSTEM_EXP = 75_000
/** Cứ 750 EXP lên 1 cấp hiển thị, tối đa Lv.100 */
const EXP_PER_DISPLAY_LEVEL = 750
const MAX_DISPLAY_LEVEL = 100

export default function UserProfileCard({
  userProfile,
  isLoading,
  onOpenEdit,
  currentBadge = null,
  nextBadge = null,
  rankProgress = { pct: 0, expFrom: 0, expTo: null },
  sortedBadges = [],
}) {
  const rawExp = userProfile?.totalExp
  const totalExp = Math.max(0, Number(rawExp) || 0)

  const displayLevel = Math.min(
    MAX_DISPLAY_LEVEL,
    Math.floor(totalExp / EXP_PER_DISPLAY_LEVEL) + 1,
  )

  const expBarPct = Math.min(100, (totalExp / MAX_SYSTEM_EXP) * 100)

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-start gap-5">
        <div className="relative">
          {isLoading ? (
            <div className="h-28 w-28 animate-pulse rounded-full bg-white/5 ring-1 ring-white/10" />
          ) : (
            <>
              <img
                src={userProfile?.avatarUrl || 'https://ui-avatars.com/api/?name=User'}
                alt="Avatar người chơi"
                className="h-28 w-28 rounded-full ring-1 ring-white/10 object-cover"
              />
              <button
                type="button"
                onClick={onOpenEdit}
                className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-200 shadow-[0_0_18px_rgba(0,0,0,0.35)] transition hover:border-cyan-400/30 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                aria-label="Edit avatar"
              >
                Edit
              </button>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <>
              <div className="h-7 w-44 animate-pulse rounded bg-white/5" />
              <div className="mt-4 h-4 w-56 animate-pulse rounded bg-white/5" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/5" />
            </>
          ) : (
            <>
                <h2 className="text-2xl font-bold !text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                      {userProfile?.username}
                </h2>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                  <span className="shrink-0 font-semibold">
                    Lv. {displayLevel}
                  </span>
                  <span className="min-w-0 truncate text-right font-mono text-slate-400">
                    {totalExp.toLocaleString('vi-VN')} /{' '}
                    {MAX_SYSTEM_EXP.toLocaleString('vi-VN')} EXP
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    style={{ width: `${expBarPct}%` }}
                  />
                </div>
              </div>

              {sortedBadges.length > 0 ? (
                <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
                    Huy hiệu Rank
                  </p>
                  <div className="mt-3 flex flex-wrap items-start gap-6">
                    {currentBadge?.iconUrl ? (
                      <img
                        src={currentBadge.iconUrl}
                        alt=""
                        className="h-36 w-36 shrink-0 rounded-2xl border border-amber-400/30 bg-black/20 object-contain p-2 shadow-[0_0_28px_rgba(251,191,36,0.2)] sm:h-40 sm:w-40"
                      />
                    ) : (
                      <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-500 sm:h-40 sm:w-40">
                        —
                      </div>
                    )}
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-bold text-amber-100">
                        {currentBadge?.name ?? 'Chưa có huy hiệu'}
                      </p>
                      {nextBadge ? (
                        <>
                          <p className="mt-1 text-xs text-slate-400">
                            Còn{' '}
                            <span className="font-mono font-semibold text-cyan-300/90">
                              {Math.max(
                                0,
                                (Number(nextBadge.requiredExp) || 0) - totalExp,
                              )}
                            </span>{' '}
                            EXP để lên:{' '}
                            <span className="text-slate-200">{nextBadge.name}</span>
                          </p>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                              style={{ width: `${rankProgress?.pct ?? 0}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="mt-1 text-xs text-emerald-300/90">
                          Bạn đã đạt hạng cao nhất trong hệ thống!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    {sortedBadges.map((b) => {
                      const req = Number(b?.requiredExp) || 0
                      const unlocked = totalExp >= req
                      return (
                        <div
                          key={b.id ?? b.name}
                          className="group relative"
                          title={`${b.name} (${req} EXP)`}
                        >
                          {b.iconUrl ? (
                            <img
                              src={b.iconUrl}
                              alt=""
                              className={[
                                'h-10 w-10 rounded-lg border object-contain p-0.5 transition',
                                unlocked
                                  ? 'border-amber-400/40 opacity-100 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                                  : 'border-white/10 opacity-35 grayscale',
                              ].join(' ')}
                            />
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </>
          )}

          {isLoading ? (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-24 animate-pulse rounded-xl bg-white/5 ring-1 ring-white/10"
                />
              ))}
            </div>
          ) : (
            <UserStats
              trapClicks={userProfile?.trapClicks}
              correctReports={userProfile?.correctReports}
              avgResponseTime={userProfile?.avgResponseTime}
            />
          )}
        </div>
      </div>
    </section>
  )
}

