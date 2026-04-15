import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import SettingsTab from '../components/dashboard/SettingsTab.jsx'
import UserProfileCard from '../components/dashboard/UserProfileCard.jsx'
import UserStats from '../components/dashboard/UserStats.jsx'
import { TOKEN_KEY } from '../utils/axiosClient.js'
import * as badgeService from '../services/badgeService.js'
import * as scenarioService from '../services/scenarioService.js'
import * as userService from '../services/userService.js'
import {
  getCurrentBadgeForExp,
  getExpProgressToNextRank,
  getNextBadgeForExp,
  sortBadgesByRequiredExp,
} from '../utils/badgeRank.js'

function getErrorMessage(err) {
  const data = err?.response?.data
  if (!data) return err?.message || 'Có lỗi xảy ra!'
  if (typeof data === 'string') return data
  if (typeof data?.message === 'string') return data.message
  return 'Có lỗi xảy ra!'
}

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 4000)
    return () => window.clearTimeout(t)
  }, [onClose])

  const style =
    type === 'success'
      ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100'
      : 'border-red-400/30 bg-red-500/15 text-red-100'

  return (
    <div
      className={[
        'fixed right-4 top-20 z-[100] w-[min(92vw,420px)] rounded-2xl border px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur',
        style,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xs text-slate-200/80 hover:bg-white/5"
          aria-label="Đóng thông báo"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}

function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/90 p-5 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-2 py-1 text-sm text-slate-200/80 hover:bg-white/5 hover:text-cyan-200"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function ModeCard({
  tone = 'cyan',
  title,
  subtitle,
  description,
  icon,
  buttonLabel,
  onClick,
  disabled,
  badge,
}) {
  const toneMap = {
    cyan: {
      ring: 'ring-cyan-400/30',
      border: 'border-cyan-400/30',
      glow: 'shadow-[0_0_35px_rgba(34,211,238,0.15)]',
      button:
        'bg-gradient-to-r from-cyan-600 to-violet-600 shadow-[0_0_22px_rgba(34,211,238,0.20)] hover:brightness-110',
      iconBg: 'bg-cyan-500/15 text-cyan-200 ring-cyan-400/25',
    },
    pvp: {
      ring: 'ring-fuchsia-400/25',
      border: 'border-fuchsia-400/25',
      glow: 'shadow-[0_0_35px_rgba(236,72,153,0.14)]',
      button:
        'bg-gradient-to-r from-rose-600 to-fuchsia-600 shadow-[0_0_22px_rgba(236,72,153,0.18)] hover:brightness-110',
      iconBg: 'bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/25',
    },
  }

  const t = toneMap[tone] ?? toneMap.cyan

  return (
    <div
      className={[
        'group relative overflow-hidden rounded-3xl border bg-white/5 p-6 backdrop-blur-md transition',
        'ring-1',
        t.border,
        t.ring,
        t.glow,
        'hover:bg-white/7',
      ].join(' ')}
    >
      <div
        className={[
          'pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl',
          tone === 'pvp' ? 'bg-fuchsia-500/15' : 'bg-cyan-500/15',
        ].join(' ')}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold tracking-wider text-slate-300">
              {subtitle}
            </p>
            {badge ? (
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                {badge}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-lg font-extrabold text-white sm:text-xl">
            {title}
          </h3>
        </div>

        <div
          className={[
            'shrink-0 rounded-2xl p-3 ring-1',
            t.iconBg,
          ].join(' ')}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-slate-200/90">
        {description}
      </p>

      <div className="relative mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={[
            'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition',
            t.button,
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:brightness-100',
          ].join(' ')}
        >
          {buttonLabel}
        </button>

        {disabled && badge ? (
          <span className="text-xs font-semibold text-slate-300/80">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function GameModesPanel({ onStartEndless, isDisabled, completedCampaigns, totalCampaigns }) {
  const readyToUnlockModes = totalCampaigns > 0 && completedCampaigns >= totalCampaigns
  const lockLabel = `Cần hoàn thành ${totalCampaigns}/${totalCampaigns} chiến dịch (hiện tại ${completedCampaigns}/${totalCampaigns})`
  const shouldLockModes = isDisabled || !readyToUnlockModes

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ModeCard
        tone="cyan"
        subtitle="SINGLE PLAYER"
        title="CHƠI ĐƠN (ENDLESS MODE)"
        description="Thử thách giới hạn phản xạ. Emails sẽ gửi đến liên tục với tốc độ tăng dần. Đừng để bị lừa!"
        buttonLabel="Vào Sinh Tồn"
        onClick={onStartEndless}
        disabled={shouldLockModes}
        badge={shouldLockModes ? lockLabel : 'Đã mở khóa'}
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7.5C4 6.11929 5.11929 5 6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V16.5C20 17.8807 18.8807 19 17.5 19H6.5C5.11929 19 4 17.8807 4 16.5V7.5Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M5.5 7.25L11.15 11.45C11.6504 11.8217 12.3496 11.8217 12.85 11.45L18.5 7.25"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M12 19V21"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M9 21H15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        }
      />

      <ModeCard
        tone="pvp"
        subtitle="PVP"
        title="ĐẤU TRƯỜNG PVP (1 VS 1)"
        description="So tài cùng người chơi khác. Ai nhận diện Phishing nhanh và chính xác hơn sẽ giành chiến thắng."
        buttonLabel="Tìm Đối Thủ"
        onClick={() => {}}
        disabled={shouldLockModes}
        badge={shouldLockModes ? lockLabel : 'Đã mở khóa'}
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 7.5L16.5 16.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M16.5 7.5L7.5 16.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M6 9.5L4.5 8C4 7.5 4 6.7 4.5 6.2L6.2 4.5C6.7 4 7.5 4 8 4.5L9.5 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M18 14.5L19.5 16C20 16.5 20 17.3 19.5 17.8L17.8 19.5C17.3 20 16.5 20 16 19.5L14.5 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
    </div>
  )
}

export default function UserDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('playModes')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [badges, setBadges] = useState([])
  const [campaignProgress, setCampaignProgress] = useState({ completed: 0, total: 5 })
  const [fetchError, setFetchError] = useState('')

  const [toast, setToast] = useState(null)
  const notify = useCallback((type, message) => {
    setToast({ id: Date.now(), type, message })
  }, [])

  const navigate = useNavigate()
  const userId = useMemo(() => sessionStorage.getItem('userId'), [])

  const handleMissingUserId = useCallback(() => {
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem(TOKEN_KEY)
    onLogout?.()
    navigate('/login', { replace: true })
  }, [navigate, onLogout])

  useEffect(() => {
    let alive = true

    const loadProfile = async () => {
      if (!userId) {
        handleMissingUserId()
        return
      }

      try {
        setIsLoadingProfile(true)
        setFetchError('')

        const [profileRes, badgesRes, scenariosRes, analyticsRes] = await Promise.all([
          userService.getUserProfile(userId),
          badgeService.getBadges().catch(() => ({ data: [] })),
          scenarioService.getScenarios().catch(() => ({ data: [] })),
          userService.getUserAnalytics(userId).catch(() => ({ data: null })),
        ])
        if (!alive) return
        setUserProfile(profileRes.data)
        const list = badgesRes?.data
        setBadges(Array.isArray(list) ? list : [])
        const scenarios = Array.isArray(scenariosRes?.data) ? scenariosRes.data : []
        const completed = scenarios.filter((s) => Boolean(s?.isCompleted)).length
        setAnalytics(analyticsRes?.data ?? null)
        setCampaignProgress({
          completed,
          total: scenarios.length || 5,
        })
      } catch (err) {
        if (!alive) return
        const msg = getErrorMessage(err)
        setFetchError(msg)
        setUserProfile(null)
        setAnalytics(null)
        setBadges([])
        setCampaignProgress({ completed: 0, total: 5 })
      } finally {
        if (alive) setIsLoadingProfile(false)
      }
    }

    loadProfile()
    return () => {
      alive = false
    }
  }, [handleMissingUserId, userId])

  const updateAvatarBase = useCallback(
    async (avatarUrl) => {
      if (!userId) throw new Error('Missing userId')

      const { data } = await userService.updateAvatar(userId, avatarUrl)
      setUserProfile(data)
      notify('success', 'Cập nhật avatar thành công!')
      return data
    },
    [notify, userId],
  )

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [avatarModalUrl, setAvatarModalUrl] = useState('')
  const [isSavingAvatarModal, setIsSavingAvatarModal] = useState(false)

  const openAvatarModal = useCallback(() => {
    setAvatarModalUrl('')
    setIsAvatarModalOpen(true)
  }, [])

  const handleSubmitAvatarModal = useCallback(async () => {
    if (!avatarModalUrl.trim()) {
      notify('error', 'Vui lòng dán URL avatar!')
      return
    }
    setIsSavingAvatarModal(true)
    try {
      await updateAvatarBase(avatarModalUrl.trim())
      setIsAvatarModalOpen(false)
    } catch (err) {
      notify('error', getErrorMessage(err))
    } finally {
      setIsSavingAvatarModal(false)
    }
  }, [avatarModalUrl, notify, updateAvatarBase])

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const handleChangePassword = useCallback(
    async (oldPassword, newPassword) => {
      if (!userId) return
      setIsChangingPassword(true)
      try {
        await userService.changePassword(userId, oldPassword, newPassword)
        notify('success', 'Đổi mật khẩu thành công!')
      } catch (err) {
        notify('error', getErrorMessage(err))
        throw err
      } finally {
        setIsChangingPassword(false)
      }
    },
    [notify, userId],
  )

  const [isUpdatingAvatarUrl, setIsUpdatingAvatarUrl] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const handleUpdateAvatarUrl = useCallback(
    async (avatarUrl) => {
      setIsUpdatingAvatarUrl(true)
      try {
        await updateAvatarBase(avatarUrl)
      } catch (err) {
        notify('error', getErrorMessage(err))
        throw err
      } finally {
        setIsUpdatingAvatarUrl(false)
      }
    },
    [notify, updateAvatarBase],
  )

  const isDisabled = useMemo(() => isLoadingProfile || !userId, [isLoadingProfile, userId])

  const sortedBadges = useMemo(() => sortBadgesByRequiredExp(badges), [badges])

  const rankInfo = useMemo(() => {
    const totalExp = userProfile?.totalExp ?? 0
    const currentBadge = getCurrentBadgeForExp(sortedBadges, totalExp)
    const nextBadge = getNextBadgeForExp(sortedBadges, totalExp)
    const rankProgress = getExpProgressToNextRank(sortedBadges, totalExp)
    return { currentBadge, nextBadge, rankProgress, totalExp }
  }, [sortedBadges, userProfile?.totalExp])

  const handleStartEndless = useCallback(() => {
    navigate('/train/survival-inbox')
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 flex flex-col">
      <Header variant="user" onLogout={onLogout} />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <UserProfileCard
              userProfile={userProfile}
              isLoading={isLoadingProfile}
              onOpenEdit={openAvatarModal}
              currentBadge={rankInfo.currentBadge}
              nextBadge={rankInfo.nextBadge}
              rankProgress={rankInfo.rankProgress}
              sortedBadges={sortedBadges}
              campaignProgress={campaignProgress}
              showStats={false}
            />

            {fetchError ? (
              <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
                {fetchError}
              </div>
            ) : null}
          </div>

          <section className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('playModes')}
                    className={[
                      'rounded-xl px-3 py-2 text-sm font-semibold transition',
                      activeTab === 'playModes'
                        ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                        : 'bg-slate-900/30 text-slate-200 hover:bg-white/5',
                    ].join(' ')}
                    disabled={isDisabled}
                  >
                    Chế độ chơi
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fiveStats')}
                    className={[
                      'rounded-xl px-3 py-2 text-sm font-semibold transition',
                      activeTab === 'fiveStats'
                        ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                        : 'bg-slate-900/30 text-slate-200 hover:bg-white/5',
                    ].join(' ')}
                    disabled={isDisabled}
                  >
                    Ngũ đại thông số
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-100"
                  disabled={isDisabled}
                >
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </button>
              </div>
            </div>

            {isLoadingProfile ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-5 w-36 animate-pulse rounded bg-white/5" />
                  <div className="h-5 w-10 animate-pulse rounded bg-white/5" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                  <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                  <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                </div>
              </div>
            ) : null}

            {!isLoadingProfile && activeTab === 'playModes' ? (
              <GameModesPanel
                onStartEndless={handleStartEndless}
                isDisabled={isDisabled}
                completedCampaigns={campaignProgress.completed}
                totalCampaigns={campaignProgress.total}
              />
            ) : null}

            {!isLoadingProfile && activeTab === 'fiveStats' ? (
              <UserStats
                trapClicks={userProfile?.trapClicks}
                correctReports={userProfile?.correctReports}
                avgResponseTime={userProfile?.avgResponseTime}
                totalExp={userProfile?.totalExp}
                level={userProfile?.level}
                completedCampaigns={campaignProgress.completed}
                totalCampaigns={campaignProgress.total}
                analytics={analytics}
              />
            ) : null}
          </section>
        </div>
      </main>

      <Footer />

      <Modal
        open={isAvatarModalOpen}
        title="Cập nhật Avatar"
        onClose={() => {
          if (isSavingAvatarModal) return
          setIsAvatarModalOpen(false)
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Dán URL ảnh mới (ví dụ từ Imgur). Hệ thống sẽ cập nhật ngay sau khi lưu.
          </p>
          <input
            type="text"
            value={avatarModalUrl}
            onChange={(e) => setAvatarModalUrl(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/30"
            placeholder="https://..."
            disabled={isSavingAvatarModal}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(false)}
              disabled={isSavingAvatarModal}
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/30 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmitAvatarModal}
              disabled={isSavingAvatarModal}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.18)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingAvatarModal ? 'Đang lưu...' : 'Lưu avatar'}
            </button>
          </div>
        </div>
      </Modal>

      {toast ? (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          key={toast.id}
        />
      ) : null}

      <Modal
        open={isSettingsOpen}
        title="Cai dat tai khoan"
        onClose={() => {
          if (isChangingPassword || isUpdatingAvatarUrl) return
          setIsSettingsOpen(false)
        }}
      >
        <SettingsTab
          disabled={isDisabled}
          isChangingPassword={isChangingPassword}
          isUpdatingAvatarUrl={isUpdatingAvatarUrl}
          onChangePassword={handleChangePassword}
          onUpdateAvatarUrl={handleUpdateAvatarUrl}
          notify={notify}
        />
      </Modal>
    </div>
  )
}
