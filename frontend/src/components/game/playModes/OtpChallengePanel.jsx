import { KeyRound, ShieldCheck } from 'lucide-react'
import { QuarantineStamp } from './playModeShared.jsx'

const MIN_OTP_LEN = 4

/**
 * @param {'default' | 'mailOtp'} variant — mailOtp: ẩn báo cáo, dùng sau khi xử lý xong hàng đợi mail
 */
export default function OtpChallengePanel({
  contentHint,
  otpInput,
  onOtpChange,
  onReport,
  onTrustSubmit,
  canReport,
  canTrustSubmit,
  variant = 'default',
}) {
  const mailOtp = variant === 'mailOtp'
  const title = contentHint?.title || 'Yêu cầu mã OTP'
  const message =
    contentHint?.message ||
    (mailOtp
      ? 'Nhập mã bạn đã đọc trong email (mô phỏng gửi mã về hộp thư).'
      : 'Có yêu cầu gửi mã xác thực qua kênh không chính thức.')

  return (
    <section
      className={[
        'flex min-h-0 flex-col bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#050b14] text-slate-100',
        mailOtp ? 'h-full max-h-full' : 'h-full',
      ].join(' ')}
    >
      <div className="shrink-0 border-b border-white/10 bg-[#0c1428]/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-4">
        <div className="flex items-center gap-2 text-amber-300">
          <KeyRound className={mailOtp ? 'h-6 w-6' : 'h-7 w-7'} />
          <div>
            <h2 className="text-base font-bold tracking-tight sm:text-lg">
              {mailOtp ? 'Xác nhận OTP (sau khi đọc email)' : 'Thử thách OTP / MFA'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{title}</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
        <div className="rounded-2xl border border-amber-500/25 bg-amber-950/35 p-3 text-sm leading-relaxed text-amber-50 shadow-inner sm:p-4">
          {message}
        </div>
        {!mailOtp ? (
          <p className="mt-3 text-sm text-slate-400">
            <strong className="text-slate-200">Gợi ý:</strong> Không nhập OTP vào form lạ. Nếu nghi ngờ, hãy báo cáo
            thay vì nhập mã.
          </p>
        ) : (
          <p className="mt-3 text-xs text-slate-400">
            Mã chỉ hiển thị trong email mô phỏng — không có trong API play-context để tránh gian lận.
          </p>
        )}

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg sm:mt-6 sm:p-5">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            {mailOtp ? 'Nhập mã từ email' : 'Nhập mã OTP (mô phỏng — không gửi đi đâu)'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={otpInput}
            onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ''))}
            disabled={mailOtp ? false : !canReport}
            className="mt-2 w-full max-w-xs rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-center font-mono text-xl tracking-[0.35em] text-white shadow-inner focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 sm:text-2xl"
            placeholder="••••••"
          />
          <p className="mt-2 text-[11px] text-slate-500">
            Tối thiểu {MIN_OTP_LEN} số.{' '}
            {mailOtp ? 'Bấm gửi để hoàn tất bài (kiểm tra mã trên server).' : null}
          </p>
          <button
            type="button"
            disabled={!canTrustSubmit}
            onClick={onTrustSubmit}
            className="mt-3 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/50 py-2.5 text-sm font-bold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)] transition hover:bg-cyan-900/55 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-800 disabled:text-slate-500 sm:mt-4 sm:py-3"
          >
            <ShieldCheck className="h-4 w-4" />
            {mailOtp ? 'Gửi mã & hoàn tất bài' : 'Xác nhận mã — coi như tin tưởng yêu cầu này'}
          </button>
        </div>
      </div>

      {!mailOtp ? (
        <div className="shrink-0 border-t border-white/10 bg-[#0a0f1c]/90 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Báo cáo tình huống đáng ngờ
          </p>
          <QuarantineStamp disabled={!canReport} onClick={onReport} />
        </div>
      ) : null}
    </section>
  )
}

export { MIN_OTP_LEN }
