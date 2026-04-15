import { Lock, Save, User } from 'lucide-react'
import { useId, useState } from 'react'

export default function SettingsTab({
  disabled = false,
  isChangingPassword = false,
  isUpdatingAvatarUrl = false,
  onChangePassword,
  onUpdateAvatarUrl,
  notify,
}) {
  const oldPasswordId = useId()
  const newPasswordId = useId()
  const confirmNewPasswordId = useId()
  const avatarUrlId = useId()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const handleSubmitPassword = async (e) => {
    e.preventDefault()
    if (disabled) return

    if (!oldPassword.trim()) return notify?.('error', 'Vui lòng nhập mật khẩu cũ!')
    if (!newPassword.trim()) return notify?.('error', 'Vui lòng nhập mật khẩu mới!')
    if (!confirmNewPassword.trim())
      return notify?.('error', 'Vui lòng nhập lại mật khẩu mới!')

    if (newPassword !== confirmNewPassword) {
      notify?.('error', 'Mật khẩu mới và xác nhận không khớp!')
      return
    }

    try {
      await onChangePassword?.(oldPassword, newPassword)
    } catch {
      // Handler đã notify lỗi; chỉ tránh unhandled promise trong event handler.
      return
    }
    setOldPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Đổi mật khẩu</h3>
            <p className="mt-1 text-sm text-slate-300">
              Cập nhật mật khẩu để tăng bảo mật tài khoản.
            </p>
          </div>
          <Lock className="h-5 w-5 text-cyan-300/80" aria-hidden />
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmitPassword}>
          <div className="space-y-1">
            <label htmlFor={oldPasswordId} className="text-sm text-slate-300">
              Mật khẩu cũ
            </label>
            <input
              id={oldPasswordId}
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/30"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={disabled || isChangingPassword}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor={newPasswordId} className="text-sm text-slate-300">
              Mật khẩu mới
            </label>
            <input
              id={newPasswordId}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/30"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={disabled || isChangingPassword}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor={confirmNewPasswordId}
              className="text-sm text-slate-300"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              id={confirmNewPasswordId}
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/30"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={disabled || isChangingPassword}
            />
          </div>

          <button
            type="submit"
            disabled={disabled || isChangingPassword}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.18)] ring-1 ring-white/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {isChangingPassword ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      
    </div>
  )
}

