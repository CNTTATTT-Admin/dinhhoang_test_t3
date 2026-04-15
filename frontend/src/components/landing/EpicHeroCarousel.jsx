import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { epicScenarios } from './epicHeroData.js'

const AUTO_MS = 5000

export default function EpicHeroCarousel() {
  const len = epicScenarios.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  /** Tăng khi user chọn tay — reset bộ đếm 5s */
  const [intervalKey, setIntervalKey] = useState(0)

  const goTo = useCallback((index) => {
    setActiveIndex(((index % len) + len) % len)
    setProgressKey((k) => k + 1)
    setIntervalKey((k) => k + 1)
  }, [len])

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % len)
      setProgressKey((k) => k + 1)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [len, intervalKey])

  const active = epicScenarios[activeIndex]

  return (
    <section className="border-b border-white/5 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 md:grid md:grid-cols-4 md:gap-0 md:overflow-hidden md:rounded-2xl md:border md:border-white/10 md:ring-1 md:ring-white/5">
          {/* Main feature — 3/4 */}
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 md:col-span-3 md:min-h-[420px] md:rounded-none md:border-0 lg:min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${active.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/20 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-xl"
                >
                  <span
                    className={[
                      'mb-3 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      active.badge === 'HOT'
                        ? 'bg-orange-500/90 !text-white'
                        : 'bg-cyan-500/90 !text-slate-950',
                    ].join(' ')}
                  >
                    {active.badge}
                  </span>
                  <h2 className="text-2xl font-bold leading-tight !text-white drop-shadow-md sm:text-3xl lg:text-4xl">
                    {active.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed !text-white/95 sm:text-base">
                    {active.description}
                  </p>
                  <button
                    type="button"
                    className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
                  >
                    Tìm hiểu ngay
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Side nav — 1/4 */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/50 md:col-span-1 md:rounded-none md:border-0 md:border-l md:border-white/10">
            <p className="hidden border-b border-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider !text-slate-300 md:block">
              Kịch bản
            </p>
            <ul className="flex max-h-[420px] flex-col gap-0 overflow-y-auto md:max-h-none">
              {epicScenarios.map((s, index) => {
                const isActive = index === activeIndex
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      className={[
                        'flex w-full items-center gap-3 px-3 py-3 text-left transition md:py-2.5',
                        isActive
                          ? 'bg-slate-800/90'
                          : 'hover:bg-slate-800/60',
                      ].join(' ')}
                    >
                      <img
                        src={s.thumb}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded-md object-cover ring-1 ring-white/10"
                      />
                      <span
                        className={[
                          'line-clamp-2 text-xs font-medium leading-snug sm:text-sm',
                          isActive ? '!text-white' : '!text-white/80',
                        ].join(' ')}
                      >
                        {s.title}
                      </span>
                    </button>
                    {isActive ? (
                      <div className="h-0.5 w-full overflow-hidden bg-slate-800">
                        <div
                          key={progressKey}
                          className="hero-progress-fill h-full bg-cyan-400"
                        />
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
