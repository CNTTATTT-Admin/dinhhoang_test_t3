import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  HardDrive,
  Link2,
  Mail,
  Maximize2,
  Menu,
  Minimize2,
  Network,
  Monitor,
  Search,
  Send,
  ShieldAlert,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react'
import * as scenarioService from '../../services/scenarioService.js'
import * as sessionService from '../../services/sessionService.js'
import { resolveStoredToken } from '../../utils/axiosClient.js'

const SCORE_CORRECT = 120
const SCORE_FALSE_REPORT = 60

function playStampTone(isDanger) {
  try {
    const ctx = new window.AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = isDanger ? 175 : 420
    gain.gain.value = 0.09
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.09)
  } catch {
    // best-effort audio feedback
  }
}

function InspectionTooltip({ open, value, label }) {
  if (!open || !value) return null
  return (
    <div className="absolute left-0 top-full z-30 mt-2 w-max max-w-[90vw] rounded-lg border border-cyan-400/40 bg-[#081426] px-3 py-2 text-xs text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.15)]">
      {label}: <span className="font-mono">{value}</span>
    </div>
  )
}

function ActionStamp({ type, disabled, onClick }) {
  const danger = type === 'quarantine'
  const label = danger ? 'QUARANTINE / BÁO CÁO PHISHING' : 'VERIFIED / TIN TƯỞNG'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'group relative flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-black uppercase tracking-wide transition',
        danger
          ? 'border-red-500/80 bg-red-950/60 text-red-100 hover:bg-red-900/70 hover:shadow-[0_0_28px_rgba(239,68,68,0.28)]'
          : 'border-cyan-400/80 bg-cyan-950/55 text-cyan-100 hover:bg-cyan-900/70 hover:shadow-[0_0_28px_rgba(34,211,238,0.25)]',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/70 disabled:text-slate-400',
      ].join(' ')}
    >
      {danger ? (
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[repeating-linear-gradient(-45deg,rgba(239,68,68,0.12),rgba(239,68,68,0.12)_8px,transparent_8px,transparent_16px)] opacity-0 transition group-hover:opacity-100" />
      ) : null}
      <span className="relative">{label}</span>
    </button>
  )
}

function DesktopEnvironment({ children }) {
  return (
    <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#1e3a8a_0%,#0b1220_35%,#050b14_70%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px]" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(2,6,23,0)_0px,rgba(2,6,23,0)_2px,rgba(7,15,30,0.35)_3px)] opacity-35" />

      <div className="absolute left-4 top-5 z-[2] space-y-4 text-xs text-slate-200/90">
        <div className="flex w-20 flex-col items-center gap-1 rounded-lg bg-slate-900/20 p-2 text-center">
          <HardDrive className="h-6 w-6 text-cyan-200" />
          <span>My Computer</span>
        </div>
        <div className="flex w-20 flex-col items-center gap-1 rounded-lg bg-slate-900/20 p-2 text-center">
          <Trash2 className="h-6 w-6 text-slate-200" />
          <span>Recycle Bin</span>
        </div>
        <div className="flex w-20 flex-col items-center gap-1 rounded-lg bg-slate-900/20 p-2 text-center">
          <Network className="h-6 w-6 text-violet-200" />
          <span>CyberShield Network</span>
        </div>
      </div>

      {children}
      <Taskbar />
    </div>
  )
}

function Taskbar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-[5] h-12 border-t border-slate-700/60 bg-slate-900/80 px-3 backdrop-blur">
      <div className="flex h-full items-center gap-2 text-slate-200">
        <button className="rounded-md bg-slate-800/80 p-1.5 hover:bg-slate-700/90">
          <Menu className="h-4 w-4" />
        </button>
        <button className="rounded-md p-1.5 hover:bg-slate-700/70">
          <Monitor className="h-4 w-4 text-cyan-300" />
        </button>
        <button className="rounded-md p-1.5 hover:bg-slate-700/70">
          <HardDrive className="h-4 w-4 text-amber-300" />
        </button>
        <button className="rounded-md bg-cyan-500/20 p-1.5 ring-1 ring-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
          <Mail className="h-4 w-4 text-cyan-200" />
        </button>
        <div className="ml-auto text-[11px] font-mono text-slate-300">SECURE DESKTOP MODE</div>
      </div>
    </div>
  )
}

function AppWindow({ children }) {
  return (
    <div className="w-full max-w-7xl h-[85vh] z-10 flex flex-col overflow-hidden rounded-lg border border-slate-600 shadow-2xl">
      <div className="h-10 bg-slate-800 px-4 flex items-center justify-between border-b border-slate-700">
        <p className="truncate text-xs font-medium text-slate-200">
          Inbox - hr.department@company.com - Google Chrome
        </p>
        <div className="flex items-center gap-1.5 text-slate-300">
          <button className="rounded p-1 hover:bg-slate-700/80" aria-label="Minimize">
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button className="rounded p-1 hover:bg-slate-700/80" aria-label="Maximize">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button className="rounded p-1 hover:bg-red-600/70" aria-label="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

function DebriefWindow({
  report,
  finalScore,
  timeTakenSeconds,
  scenarioRouteId,
  onRetry,
  animatedExp,
}) {
  const passed = Boolean(report?.isPassed)
  const messages = report?.feedbackMessages || []
  return (
    <section className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="border-b border-slate-700/80 px-5 py-4">
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-300/80">
          SYSTEM REPORT - DEBRIEFING
        </p>
        <h2
          className={[
            'mt-2 text-2xl font-black tracking-wide',
            passed ? 'text-emerald-300' : 'text-red-300',
          ].join(' ')}
        >
          {passed ? 'MISSION COMPLETED' : 'MISSION FAILED'}
        </h2>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Thời gian hoàn thành</p>
          <p className="mt-1 font-mono text-lg text-cyan-200">{timeTakenSeconds}s</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Điểm số đạt được</p>
          <p className="mt-1 font-mono text-lg text-violet-200">{finalScore}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">EXP Nhận được</p>
          <p className="mt-1 font-mono text-lg text-emerald-300">+{animatedExp}</p>
        </div>
      </div>

      <div className="mx-5 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Báo cáo chi tiết
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {messages.map((msg, idx) => {
            const lower = String(msg).toLowerCase()
            const colorCls = lower.includes('false negative')
              ? 'text-red-300'
              : lower.includes('false positive')
                ? 'text-amber-300'
                : 'text-slate-200'
            const prefix = lower.includes('false negative')
              ? '[CẢNH BÁO]'
              : lower.includes('false positive')
                ? '[NHẦM LẪN]'
                : '[GHI CHÚ]'
            return (
              <li key={`${idx}-${msg}`} className={colorCls}>
                <span className="font-bold">{prefix}</span> {msg}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-auto flex flex-wrap gap-3 border-t border-slate-700/80 p-5">
        <Link
          to={scenarioRouteId ? `/campaign/${scenarioRouteId}/sessions` : '/campaigns'}
          className="rounded-xl border border-cyan-400/40 bg-cyan-950/40 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-900/50"
        >
          QUAY LẠI CHIẾN DỊCH
        </Link>
        {!passed ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-900/50"
          >
            CHƠI LẠI
          </button>
        ) : null}
      </div>
    </section>
  )
}

function buildQueueBySession(lesson, campaignTitle) {
  const threat = Math.max(1, Math.min(5, Number(lesson?.threatLevel) || 1))
  const lessonTitle = lesson?.lessonTitle || 'Bài học mô phỏng'
  const objective = lesson?.objective || 'Kiểm tra người gửi, ngữ cảnh và đường link.'
  const topic = lessonTitle.replace(/^Bài\s*\d+:\s*/i, '')

  const safe = {
    id: `${lesson?.sessionId}-safe`,
    senderName: 'HR Department',
    senderEmail: 'hr@cybershield-academy.internal',
    subject: `Thông báo nội bộ: ${topic}`,
    body: `Xin chào,\n\nNội dung hôm nay: ${objective}\n\nVui lòng theo dõi lịch học trên cổng nội bộ.`,
    linkLabel: 'Mở cổng đào tạo nội bộ',
    linkUrl: 'https://intranet.cybershield-academy.internal/training',
    isPhishing: false,
    redFlags: [],
  }

  const phishing = {
    id: `${lesson?.sessionId}-phish`,
    senderName: 'HR Department',
    senderEmail: `hr-admin@freemail-xyz.com`,
    subject: `Gấp: Cập nhật hồ sơ nhân sự cho ${campaignTitle}`,
    body: `Kính gửi nhân viên,\n\nBạn cần xác minh hồ sơ trong vòng 10 phút để tránh khóa tài khoản.\n\nBấm vào nút dưới để hoàn tất ngay.`,
    linkLabel: 'Đổi mật khẩu',
    linkUrl: `http://phishing-site.net/login?t=${threat}&sid=${lesson?.sessionId}`,
    isPhishing: true,
    redFlags: [
      'Tên hiển thị giống nội bộ nhưng domain người gửi là freemail.',
      'Yêu cầu hành động gấp để tạo áp lực tâm lý.',
      'Link đích là HTTP và domain ngoài hệ thống.',
    ],
  }

  const safe2 = {
    id: `${lesson?.sessionId}-safe2`,
    senderName: 'IT Helpdesk',
    senderEmail: 'helpdesk@cybershield-academy.internal',
    subject: `Checklist bảo mật - ${topic}`,
    body: `Mẹo nhanh: luôn hover link trước khi click.\nKhông chia sẻ OTP, mật khẩu qua email/chat.`,
    linkLabel: 'Xem Security Handbook',
    linkUrl: 'https://intranet.cybershield-academy.internal/handbook',
    isPhishing: false,
    redFlags: [],
  }

  return threat >= 3 ? [safe, phishing, safe2] : [safe, safe2, phishing]
}

function GmailUI({
  queue,
  currentIndex,
  currentEmail,
  status,
  hoveredUrl,
  onHoverUrl,
  onSenderToggle,
  senderTooltipOpen,
  onReport,
  onVerify,
  canAct,
  isShaking,
}) {
  return (
    <section className="flex h-full flex-col bg-white text-slate-800">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <Mail className="h-5 w-5 text-red-500" />
        <span className="text-sm font-semibold text-slate-700">Gmail</span>
        <div className="mx-2 flex-1">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-500">
            <Search className="h-4 w-4" />
            <span className="text-xs">Search mail</span>
          </div>
        </div>
        <User className="h-7 w-7 rounded-full bg-slate-200 p-1 text-slate-600" />
      </div>

      <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-50 p-3">
          <button className="mb-3 rounded-2xl bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-700">
            Compose
          </button>
          <div className="space-y-1 text-sm">
            <div className="rounded-lg bg-cyan-100 px-3 py-2 font-semibold text-cyan-700">
              Inbox ({queue.length})
            </div>
            <div className="rounded-lg px-3 py-2 text-slate-600 inline-flex items-center gap-2">
              <Star className="h-4 w-4" /> Starred
            </div>
            <div className="rounded-lg px-3 py-2 text-slate-600 inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> Snoozed
            </div>
            <div className="rounded-lg px-3 py-2 text-slate-600 inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> Sent
            </div>
            <div className="rounded-lg px-3 py-2 text-slate-600 inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> Drafts
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
            {queue.map((mail, i) => {
              const active = status === 'PLAYING' && i === currentIndex
              const done = i < currentIndex || status === 'VICTORY'
              return (
                <div
                  key={mail.id}
                  className={[
                    'rounded-xl border px-2.5 py-2 text-xs transition',
                    active
                      ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                      : done
                        ? 'border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-700',
                  ].join(' ')}
                >
                  <p className="truncate font-semibold">{mail.senderName}</p>
                  <p className="truncate text-[11px] opacity-85">{mail.subject}</p>
                </div>
              )
            })}
          </div>
        </aside>

        <div className="relative flex min-h-0 flex-col bg-white p-4 pb-0">
          <div
            className={[
              'rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition min-h-0 flex-1 overflow-auto',
              isShaking ? 'animate-[wiggle_180ms_ease-in-out_1]' : '',
            ].join(' ')}
          >
            <h2 className="text-xl font-bold">{currentEmail?.subject}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <div className="relative">
                <button
                  type="button"
                  onClick={onSenderToggle}
                  className="rounded-md border border-slate-300 bg-white/70 px-2 py-1 font-semibold hover:bg-white"
                >
                  {currentEmail?.senderName}
                </button>
                <InspectionTooltip
                  open={senderTooltipOpen}
                  value={currentEmail?.senderEmail}
                  label="Sender thật"
                />
              </div>
            </div>

            <pre className="mt-4 whitespace-pre-wrap break-words border-t border-slate-300 pt-4 text-sm leading-relaxed">
              {currentEmail?.body}
            </pre>

            {currentEmail?.linkUrl ? (
              <a
                href={currentEmail.linkUrl}
                onClick={(e) => e.preventDefault()}
                onMouseEnter={() => onHoverUrl(currentEmail.linkUrl)}
                onMouseLeave={() => onHoverUrl('')}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 underline"
              >
                <Link2 className="h-4 w-4" />
                {currentEmail.linkLabel}
              </a>
            ) : null}
          </div>

          <div className="mt-4 rounded-t-xl border border-slate-300 bg-slate-100 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Decision Panel
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionStamp type="quarantine" disabled={!canAct} onClick={onReport} />
              <ActionStamp type="verified" disabled={!canAct} onClick={onVerify} />
            </div>
          </div>

          <div className="mt-auto border-x border-t border-slate-300 bg-slate-100 px-4 py-1.5 text-xs font-mono text-slate-600">
            {hoveredUrl ? `URL Inspection: ${hoveredUrl}` : 'URL Inspection: Hover link để soi URL thật'}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function SurvivalInbox() {
  const { sessionId: stepId } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [campaignTitle, setCampaignTitle] = useState('Chiến dịch huấn luyện')
  const [scenarioRouteId, setScenarioRouteId] = useState('')
  const [lesson, setLesson] = useState(null)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [status, setStatus] = useState('PLAYING')
  const [senderTooltipOpen, setSenderTooltipOpen] = useState(false)
  const [hoveredUrl, setHoveredUrl] = useState('')
  const [gameOverEmail, setGameOverEmail] = useState(null)
  const [isShaking, setIsShaking] = useState(false)
  const [decisionHistory, setDecisionHistory] = useState([])
  const [startedAtMs, setStartedAtMs] = useState(() => Date.now())
  const [isFinished, setIsFinished] = useState(false)
  const [isSubmittingResult, setIsSubmittingResult] = useState(false)
  const [debrief, setDebrief] = useState(null)
  const [animatedExp, setAnimatedExp] = useState(0)

  const currentEmail = queue[index] ?? null
  // Ưu tiên số email đã xử lý thực tế để khi debrief hiển thị đúng 100%.
  const completedCount = Math.min(Math.max(index, decisionHistory.length), queue.length)
  const progressPct = queue.length ? Math.round((completedCount / queue.length) * 100) : 0
  const threatLevel = lesson?.threatLevel ?? 1
  const canAct = status === 'PLAYING' && !!currentEmail

  const loadBySessionId = useCallback(async () => {
    if (!stepId) {
      setError('Thiếu stepId trên URL.')
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      setError('')
      setSenderTooltipOpen(false)
      setHoveredUrl('')
      const { data: scenarios } = await scenarioService.getScenarios()
      let foundScenario = null
      let foundLesson = null

      for (const scenario of Array.isArray(scenarios) ? scenarios : []) {
        const { data: lessons } = await sessionService.fetchSessionsByScenario(scenario.id)
        const matched = Array.isArray(lessons)
          ? lessons.find((x) => String(x.sessionId) === String(stepId))
          : null
        if (matched) {
          foundScenario = scenario
          foundLesson = matched
          break
        }
      }
      if (!foundLesson) throw new Error('Không tìm thấy session hợp lệ cho màn chơi.')

      setCampaignTitle(foundScenario?.title || 'Chiến dịch huấn luyện')
      setScenarioRouteId(foundScenario?.id ? String(foundScenario.id) : '')
      setLesson(foundLesson)
      setQueue(buildQueueBySession(foundLesson, foundScenario?.title || 'CyberShield'))
      setIndex(0)
      setScore(0)
      scoreRef.current = 0
      setStatus('PLAYING')
      setGameOverEmail(null)
      setDecisionHistory([])
      setStartedAtMs(Date.now())
      setIsFinished(false)
      setIsSubmittingResult(false)
      setDebrief(null)
      setAnimatedExp(0)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể nạp dữ liệu màn chơi.')
      setScenarioRouteId('')
      setQueue([])
      setLesson(null)
    } finally {
      setIsLoading(false)
    }
  }, [stepId])

  useEffect(() => {
    loadBySessionId()
  }, [loadBySessionId])

  useEffect(() => {
    if (!isFinished || !stepId || debrief || isSubmittingResult) return

    const submitResult = async () => {
      try {
        setIsSubmittingResult(true)
        const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startedAtMs) / 1000))
        const payload = {
          finalScore: scoreRef.current,
          timeTakenSeconds,
          emailDecisions: decisionHistory.map((decision) => ({
            emailId: decision.emailId,
            isPhishing: decision.isPhishing,
            userAction: decision.userAction,
          })),
        }
        // eslint-disable-next-line no-console
        console.log('Token sent:', resolveStoredToken())
        const { data } = await sessionService.submitGameplayStep(stepId, payload)
        setDebrief({
          ...data,
          timeTakenSeconds,
          finalScore: scoreRef.current,
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err?.response?.data || err)
        setDebrief({
          earnedExp: 0,
          totalExp: 0,
          isPassed: false,
          feedbackMessages: [
            err?.response?.data?.message ||
              err?.message ||
              'Không thể gửi báo cáo mission lên hệ thống.',
          ],
          timeTakenSeconds: Math.max(1, Math.round((Date.now() - startedAtMs) / 1000)),
          finalScore: scoreRef.current,
        })
      } finally {
        setIsSubmittingResult(false)
      }
    }
    submitResult()
  }, [debrief, decisionHistory, isFinished, isSubmittingResult, score, startedAtMs, stepId])

  useEffect(() => {
    if (!debrief) return
    const targetExp = Math.max(0, Number(debrief.earnedExp) || 0)
    if (!targetExp) {
      setAnimatedExp(0)
      return
    }
    let current = 0
    const step = Math.max(1, Math.ceil(targetExp / 24))
    const timer = window.setInterval(() => {
      current += step
      if (current >= targetExp) {
        setAnimatedExp(targetExp)
        window.clearInterval(timer)
      } else {
        setAnimatedExp(current)
      }
    }, 25)
    return () => window.clearInterval(timer)
  }, [debrief])

  const handleDecision = useCallback(
    (isReport) => {
      if (!canAct) return
      setSenderTooltipOpen(false)
      setHoveredUrl('')
      setIsShaking(true)
      playStampTone(isReport)

      window.setTimeout(() => {
        const decision = {
          emailId: Number(currentEmail?.id) || index + 1,
          isPhishing: Boolean(currentEmail?.isPhishing),
          userAction: isReport ? 'QUARANTINE' : 'VERIFIED',
        }
        setDecisionHistory((prev) => [...prev, decision])

        const trustPhishing = !isReport && currentEmail?.isPhishing
        if (trustPhishing) {
          setStatus('GAME_OVER')
          setGameOverEmail(currentEmail)
          setIsFinished(true)
          setIsShaking(false)
          return
        }

        const correct = (isReport && currentEmail?.isPhishing) || (!isReport && !currentEmail?.isPhishing)
        const nextScore = scoreRef.current + (correct ? SCORE_CORRECT : -SCORE_FALSE_REPORT)
        scoreRef.current = nextScore
        setScore(nextScore)

        const nextIndex = index + 1
        if (nextIndex >= queue.length) {
          setStatus(nextScore < 0 ? 'GAME_OVER' : 'VICTORY')
          if (nextScore < 0) {
            setGameOverEmail(null)
          }
          setIsFinished(true)
        } else {
          setIndex(nextIndex)
        }
        setIsShaking(false)
      }, 170)
    },
    [canAct, currentEmail, index, queue.length],
  )

  const statusCls = useMemo(() => {
    if (status === 'GAME_OVER') return 'text-red-300'
    if (status === 'VICTORY') return 'text-emerald-300'
    return 'text-cyan-300'
  }, [status])

  return (
    <div className="min-h-screen flex flex-col bg-[#050B14] text-slate-100">
      <header className="relative z-10 h-16 border-b border-slate-700/60 bg-slate-900 text-white">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
          <Link
            to={scenarioRouteId ? `/campaign/${scenarioRouteId}/sessions` : '/campaigns'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800/70 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400/35 hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Chiến dịch
          </Link>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/50 text-cyan-200">
            <Network className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-cyan-300">CyberShield Academy</p>
          <p className="min-w-0 truncate text-sm font-semibold text-white">{campaignTitle}</p>

          <div className="ml-auto flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/45 px-2 py-1">
              {completedCount}/{queue.length || 0} Nhiệm vụ | {progressPct}%
            </span>
            <span className="rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-1">
              THREAT LEVEL {threatLevel}
            </span>
            <span className="rounded-md border border-violet-500/30 bg-violet-950/35 px-2 py-1">
              SCORE {score}
            </span>
            <span className={['rounded-md px-2 py-1 font-semibold', statusCls].join(' ')}>{status}</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-0 sm:px-6">
        <section className="hidden rounded-2xl border border-slate-700/60 bg-[#0b1424]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/50 text-cyan-200">
              <Network className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cyan-300">CyberShield Academy</p>
              <p className="truncate text-sm font-semibold text-white">{campaignTitle}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/45 px-2 py-1">
              {completedCount}/{queue.length || 0} Nhiệm vụ hoàn thành | {progressPct}%
            </span>
            <span className="rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-1">
              THREAT LEVEL {threatLevel}
            </span>
            <span className="rounded-md border border-violet-500/30 bg-violet-950/35 px-2 py-1">
              SCORE {score}
            </span>
            <span className={['rounded-md px-2 py-1 font-semibold', statusCls].join(' ')}>{status}</span>
          </div>
        </section>
      </main>

      <DesktopEnvironment>
        {error ? (
          <div className="absolute left-10 right-10 top-3 z-[9] rounded-xl border border-red-400/25 bg-red-950/40 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="absolute inset-0 z-10 flex items-center justify-center px-3 pb-16 pt-4 sm:px-6">
          <AppWindow>
            {isLoading ? (
              <div className="h-full animate-pulse bg-slate-900/60" />
            ) : debrief ? (
              <DebriefWindow
                report={debrief}
                finalScore={debrief.finalScore ?? score}
                timeTakenSeconds={debrief.timeTakenSeconds ?? Math.max(1, Math.round((Date.now() - startedAtMs) / 1000))}
                scenarioRouteId={scenarioRouteId}
                onRetry={loadBySessionId}
                animatedExp={animatedExp}
              />
            ) : isFinished ? (
              <section className="flex h-full flex-col items-center justify-center bg-slate-900 text-slate-100">
                <p className="font-mono text-xs uppercase tracking-widest text-cyan-300/80">
                  SYSTEM REPORT - DEBRIEFING
                </p>
                <p className="mt-2 text-lg font-semibold text-cyan-200">Đang tổng hợp kết quả mission...</p>
              </section>
            ) : (
              <GmailUI
                queue={queue}
                currentIndex={index}
                currentEmail={currentEmail}
                status={status}
                hoveredUrl={hoveredUrl}
                onHoverUrl={setHoveredUrl}
                onSenderToggle={() => setSenderTooltipOpen((v) => !v)}
                senderTooltipOpen={senderTooltipOpen}
                onReport={() => handleDecision(true)}
                onVerify={() => handleDecision(false)}
                canAct={canAct}
                isShaking={isShaking}
              />
            )}
          </AppWindow>
        </div>
      </DesktopEnvironment>

      {status === 'GAME_OVER' && gameOverEmail && !debrief && !isFinished ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-red-500/40 bg-[#150e17] p-5 shadow-[0_0_45px_rgba(239,68,68,0.3)]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-xl font-black text-red-300">TEACHABLE MOMENT</h3>
                <p className="mt-1 text-sm text-slate-200">
                  Bạn đã chọn <span className="font-semibold text-red-300">VERIFIED</span> cho một email phishing.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-950/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-200">Hậu kiểm email</p>
              <p className="mt-1 text-sm font-semibold text-white">{gameOverEmail.subject}</p>
              <p className="mt-1 text-xs text-slate-300">
                Sender thật: <span className="font-mono text-red-200">{gameOverEmail.senderEmail}</span>
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Link thật: <span className="font-mono text-red-200">{gameOverEmail.linkUrl}</span>
              </p>
            </div>

            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-slate-200">
              {(gameOverEmail.redFlags || []).map((flag, i) => (
                <li key={`${i}-${flag}`}>{flag}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={loadBySessionId}
              className="mt-5 w-full rounded-xl border border-red-400/45 bg-red-950/60 py-2.5 font-bold text-red-100 hover:bg-red-900/70"
            >
              Chơi lại
            </button>
          </div>
        </div>
      ) : null}

      {status === 'VICTORY' && !debrief && !isFinished ? (
        <div className="fixed bottom-5 right-5 z-20 rounded-xl border border-emerald-400/40 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.2)]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Ca trực hoàn tất - Không bị lừa.
          </div>
        </div>
      ) : null}

      {isSubmittingResult ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="rounded-xl border border-cyan-400/30 bg-slate-950/85 px-5 py-3 text-sm font-mono text-cyan-200">
            Uploading mission report...
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes wiggle {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
