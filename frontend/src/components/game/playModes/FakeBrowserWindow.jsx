import { Link2, Shield, X } from 'lucide-react'

/**
 * Trình duyệt giả — overlay, không iframe ra Internet.
 */
export default function FakeBrowserWindow({
  title,
  displayUrl,
  formType = 'CREDENTIAL',
  loginUser,
  loginPass,
  otpInput,
  onLoginUserChange,
  onLoginPassChange,
  onOtpChange,
  onClose,
  onSubmitTrap,
  canSubmitTrap,
}) {
  const isOtp = String(formType).toUpperCase() === 'OTP'
  const address = displayUrl || 'https://secure-login.internal/verify'

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#dee1e6] text-slate-800">
      {/* Chrome-like chrome */}
      <div className="window-header flex shrink-0 cursor-grab items-center gap-2 border-b border-slate-300/80 bg-[#e8eaed] px-2 py-2 active:cursor-grabbing">
        <div className="flex gap-1.5 pl-1">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-300/90 bg-white px-3 py-1.5 font-mono text-[11px] text-slate-600 shadow-sm">
          <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="truncate">{address}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-slate-600 hover:bg-slate-300"
          aria-label="Close browser"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-200/90 to-slate-300/80 p-4 sm:p-8">
        <div className="mx-auto max-w-md rounded-xl border border-white/60 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <h2 className="text-lg font-bold text-slate-900">{title || 'Xác minh tài khoản'}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {isOtp
              ? 'Trang yêu cầu mã OTP. Nếu mã bị nhập vào trang giả mạo, bạn sẽ bị chiếm quyền truy cập.'
              : 'Trang yêu cầu tài khoản và mật khẩu. Hãy kiểm tra kỹ domain trước khi nhập.'}
          </p>
          {isOtp ? (
            <div className="mt-5 space-y-3">
              <label className="block text-xs font-medium text-slate-600">
                OTP
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpInput}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="123456"
                />
              </label>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <label className="block text-xs font-medium text-slate-600">
                Email / Tài khoản
                <input
                  type="text"
                  autoComplete="off"
                  value={loginUser}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => onLoginUserChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="user@company.com"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Mật khẩu
                <input
                  type="password"
                  autoComplete="off"
                  value={loginPass}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => onLoginPassChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="••••••••"
                />
              </label>
            </div>
          )}
          <button
            type="button"
            disabled={!canSubmitTrap}
            onClick={onSubmitTrap}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isOtp ? 'Xác nhận OTP' : 'Đăng nhập'} — tiếp tục
          </button>
          <p className="mt-4 flex items-start gap-1.5 text-xs text-slate-500">
            <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Dữ liệu chỉ dùng trong bài học; không kết nối tới website thật.
          </p>
        </div>
      </div>
    </section>
  )
}
