import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { jwtDecode } from 'jwt-decode'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react'
import * as authService from '../services/authService.js'
import { TOKEN_KEY } from '../utils/axiosClient.js'

function Spinner({ className = '' }) {
  return (
    <svg
      className={`h-4 w-4 animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        d="M22 12c0-5.523-4.477-10-10-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function parseApiError(error) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
    if (data && typeof data.error === 'string') {
      return data.error
    }
    if (error.response?.status === 401) {
      return 'Sai tên đăng nhập hoặc mật khẩu!'
    }
  }
  if (error && typeof error.message === 'string') {
    return error.message
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.'
}

function AuthField({
  label,
  icon: Icon,
  error,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  right,
  autoComplete,
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200/90">{label}</label>
      </div>

      <div
        className={[
          'flex items-center gap-2 rounded-xl border bg-white/5 px-3 py-2 transition',
          'focus-within:border-cyan-400/90 focus-within:ring-2 focus-within:ring-cyan-300/25',
          'focus-within:shadow-[0_0_20px_rgba(34,211,238,0.45)]',
          error
            ? 'border-red-400/60 focus-within:border-red-400/80 focus-within:ring-red-400/20 focus-within:shadow-[0_0_18px_rgba(248,113,113,0.25)]'
            : 'border-white/10',
        ].join(' ')}
      >
        <Icon className="h-4 w-4 text-cyan-200/70" />
        <input
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
        />
        {right}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      ) : null}
    </div>
  )
}

function looksLikeUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')

  const [formError, setFormError] = useState('')

  const [login, setLogin] = useState({ username: '', password: '' })
  const [register, setRegister] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errors, setErrors] = useState({})

  const emailRegex = useMemo(() => /^\S+@\S+\.\S+$/, [])

  useEffect(() => {
    setErrors({})
    setFormError('')
  }, [mode])

  const cardGlow =
    mode === 'login'
      ? 'ring-1 ring-cyan-300/25 shadow-[0_0_0_1px_rgba(34,211,238,0.20),0_0_58px_rgba(34,211,238,0.18)]'
      : 'ring-1 ring-purple-300/25 shadow-[0_0_0_1px_rgba(192,132,252,0.20),0_0_58px_rgba(192,132,252,0.18)]'

  const validateLogin = () => {
    const next = {}
    if (!login.username.trim()) next.username = 'Vui lòng nhập Username!'
    if (!login.password.trim()) next.password = 'Vui lòng nhập Password!'
    return next
  }

  const validateRegister = () => {
    const next = {}

    if (!register.username.trim()) next.username = 'Vui lòng nhập Username!'

    if (!register.email.trim()) next.email = 'Vui lòng nhập Email!'
    else if (!emailRegex.test(register.email.trim())) next.email = 'Email không đúng định dạng!'

    if (!register.password.trim()) next.password = 'Vui lòng nhập Password!'
    if (!register.confirmPassword.trim()) next.confirmPassword = 'Vui lòng nhập Confirm Password!'

    if (
      register.password &&
      register.confirmPassword &&
      register.password !== register.confirmPassword
    ) {
      next.confirmPassword = 'Confirm Password không khớp!'
    }

    return next
  }

  const persistAuth = (data) => {
    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token)
    }
    if (data?.username) {
      localStorage.setItem('cybershield_username', data.username)
    }
    if (data?.role) {
      localStorage.setItem('cybershield_role', data.role)
    }

    // Try to persist userId (UUID) for endpoints under `/api/users/{id}/...`
    // 1) Prefer response payload
    let candidateUserId =
      data?.id ||
      data?.userId ||
      data?.user?.id ||
      data?.userId?.id ||
      data?.user?.userId

    // 2) If not in response, try decode token for custom claims
    if (!looksLikeUuid(candidateUserId) && data?.token) {
      try {
        const decoded = jwtDecode(data.token)
        candidateUserId =
          decoded?.id ||
          decoded?.userId ||
          decoded?.user?.id ||
          decoded?.sub // sometimes sub might be UUID depending on backend
      } catch (e) {
        // ignore token decode errors; will fallback to missing userId
      }
    }

    if (looksLikeUuid(candidateUserId)) {
      localStorage.setItem('userId', candidateUserId)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateLogin()
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const { data: responseData } = await authService.login({
        username: login.username,
        password: login.password,
      })
      // Debug: inspect real response shape from backend
      // eslint-disable-next-line no-console
      console.log('Login response.data:', responseData)

      // 1) Lưu TOKEN TRƯỚC để trang `/` (Dashboard) nhận được ngay
      const token =
        responseData?.token || responseData?.data?.token || responseData?.jwt
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      }

      // 2) Tách UUID/userId an toàn (nếu API trả về)
      const userId = responseData?.id || responseData?.user?.id
      if (userId) {
        localStorage.setItem('userId', userId)
      } else {
        // Không crash app nếu backend không trả UUID
        console.warn('Chưa lấy được userId từ API Login')
      }

      // Persist phần còn lại (username/role/userId fallback theo token claim)
      persistAuth(responseData)
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(parseApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateRegister()
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const { data } = await authService.register({
        username: register.username,
        password: register.password,
      })
      persistAuth(data)
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(parseApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const cardTitle =
    mode === 'login' ? (
      <>
        <div className="text-xs uppercase tracking-widest text-cyan-200/90 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]">
          CyberShield Academy
        </div>
        <h2 className="mt-1 text-2xl font-bold !text-white drop-shadow-md">
          Đăng nhập hệ thống
        </h2>
      </>
    ) : (
      <>
        <div className="text-xs uppercase tracking-widest text-purple-200/90 drop-shadow-[0_0_12px_rgba(192,132,252,0.50)]">
          CyberShield Academy
        </div>
        <h2 className="mt-1 text-2xl font-bold !text-white drop-shadow-md">
          Tạo tài khoản mới
        </h2>
      </>
    )

  return (
    <div
      spellCheck={false}
      className="relative min-h-screen w-full flex items-center justify-center m-0 p-0 overflow-hidden bg-slate-800 text-slate-100"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-56 left-1/2 w-[560px] -translate-x-1/2 rounded-full bg-cyan-500/22 blur-3xl" />
        <div className="absolute top-[-140px] right-[-160px] h-[320px] w-[320px] rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[420px] w-[420px] rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.30),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(192,132,252,0.25),transparent_60%),linear-gradient(to_bottom,rgba(30,41,59,1),rgba(15,23,42,1))]" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-[92%] sm:w-[70%] md:w-[60%] lg:w-[40%] max-w-[520px]"
        >
          <div className="mb-4 text-center sm:text-left">{cardTitle}</div>

          <div
            className={[
              'rounded-3xl border border-white/10 bg-white/5 p-0 backdrop-blur-md',
              cardGlow,
            ].join(' ')}
          >
            <div className="p-5">
              <div className="flex items-center gap-2 rounded-2xl bg-black/25 p-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={[
                    'flex-1 rounded-xl px-3 py-2 text-sm font-medium transition',
                    mode === 'login'
                      ? 'bg-cyan-500/18 text-white font-bold shadow-[0_0_22px_rgba(34,211,238,0.25)]'
                      : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-300',
                  ].join(' ')}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={[
                    'flex-1 rounded-xl px-3 py-2 text-sm font-medium transition',
                    mode === 'register'
                      ? 'bg-purple-500/18 text-white font-bold shadow-[0_0_22px_rgba(192,132,252,0.25)]'
                      : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-300',
                  ].join(' ')}
                >
                  Đăng ký
                </button>
              </div>

              {formError ? (
                <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                  {formError}
                </div>
              ) : null}

              <div className="relative mt-4">
                <AnimatePresence mode="wait">
                  {mode === 'login' ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: 36, rotateY: -18 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0, x: -36, rotateY: 18 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      onSubmit={handleLoginSubmit}
                    >
                      <AuthField
                        label="Username"
                        icon={UserIcon}
                        value={login.username}
                        onChange={(v) => setLogin((s) => ({ ...s, username: v }))}
                        error={errors.username}
                        placeholder="vd: admin01"
                        autoComplete="username"
                      />

                      <AuthField
                        label="Password"
                        icon={Lock}
                        type={showLoginPassword ? 'text' : 'password'}
                        value={login.password}
                        onChange={(v) => setLogin((s) => ({ ...s, password: v }))}
                        error={errors.password}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        right={
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword((v) => !v)}
                            className="rounded-lg p-1 text-slate-300 hover:bg-white/5 hover:text-slate-100 transition"
                            aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        }
                      />

                      <div className="mb-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="text-xs text-cyan-200/95 hover:text-cyan-50 transition drop-shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                          onClick={() => {
                            setFormError('')
                            alert('Tính năng Quên mật khẩu sẽ được tích hợp sau.')
                          }}
                        >
                          Quên mật khẩu?
                        </button>

                        <div className="text-xs text-slate-200/90 drop-shadow-[0_0_12px_rgba(34,211,238,0.20)]">
                          Phòng thủ nhận diện rủi ro
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/18 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/22 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                      >
                        {isSubmitting ? <Spinner /> : null}
                        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                      </button>

                      <div className="mt-4 text-center text-xs text-slate-200/85 drop-shadow-[0_0_10px_rgba(34,211,238,0.12)]">
                        Chưa có tài khoản?{' '}
                        <button
                          type="button"
                          className="font-medium text-cyan-200 hover:text-cyan-100 transition"
                          onClick={() => setMode('register')}
                        >
                          Tạo ngay
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 36, rotateY: -18 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0, x: -36, rotateY: 18 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      onSubmit={handleRegisterSubmit}
                    >
                      <AuthField
                        label="Username"
                        icon={UserIcon}
                        value={register.username}
                        onChange={(v) => setRegister((s) => ({ ...s, username: v }))}
                        error={errors.username}
                        placeholder="vd: user01"
                        autoComplete="username"
                      />

                      <AuthField
                        label="Email"
                        icon={Mail}
                        value={register.email}
                        onChange={(v) => setRegister((s) => ({ ...s, email: v }))}
                        error={errors.email}
                        placeholder="name@example.com"
                        autoComplete="email"
                      />

                      <AuthField
                        label="Password"
                        icon={Lock}
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={register.password}
                        onChange={(v) => setRegister((s) => ({ ...s, password: v }))}
                        error={errors.password}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        right={
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword((v) => !v)}
                            className="rounded-lg p-1 text-slate-300 hover:bg-white/5 hover:text-slate-100 transition"
                            aria-label={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showRegisterPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        }
                      />

                      <AuthField
                        label="Confirm Password"
                        icon={Lock}
                        type={showRegisterConfirmPassword ? 'text' : 'password'}
                        value={register.confirmPassword}
                        onChange={(v) =>
                          setRegister((s) => ({ ...s, confirmPassword: v }))
                        }
                        error={errors.confirmPassword}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        right={
                          <button
                            type="button"
                            onClick={() =>
                              setShowRegisterConfirmPassword((v) => !v)
                            }
                            className="rounded-lg p-1 text-slate-300 hover:bg-white/5 hover:text-slate-100 transition"
                            aria-label={
                              showRegisterConfirmPassword
                                ? 'Ẩn mật khẩu xác nhận'
                                : 'Hiện mật khẩu xác nhận'
                            }
                          >
                            {showRegisterConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        }
                      />

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-300/30 bg-purple-400/18 px-4 py-2.5 text-sm font-semibold text-purple-50 transition hover:bg-purple-400/22 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400/25"
                      >
                        {isSubmitting ? <Spinner className="text-purple-200" /> : null}
                        {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                      </button>

                      <div className="mt-4 text-center text-xs text-slate-200/85 drop-shadow-[0_0_10px_rgba(192,132,252,0.12)]">
                        Đã có tài khoản?{' '}
                        <button
                          type="button"
                          className="font-medium text-purple-200 hover:text-purple-100 transition"
                          onClick={() => setMode('login')}
                        >
                          Đăng nhập
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
