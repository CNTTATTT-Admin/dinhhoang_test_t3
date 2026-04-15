import { AlertTriangle } from 'lucide-react'

export default function TeachableMomentOverlay({
  gameOverEmail,
  gameOverNonMail,
  onContinue,
  onRetry,
}) {
  if (!gameOverEmail && !gameOverNonMail) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-red-500/40 bg-[#150e17] p-5 shadow-[0_0_45px_rgba(239,68,68,0.3)]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-8 w-8 text-red-400" />
          <div>
            <h3 className="text-xl font-black text-red-300">TEACHABLE MOMENT</h3>
            <p className="mt-1 text-sm text-slate-200">
              {gameOverNonMail ? (
                <>
                  Bạn đã <span className="font-semibold text-red-300">tin tưởng</span> tình huống đáng ngờ (đã nhập mã
                  / tài khoản hoặc gửi tin nhắn mô phỏng).
                </>
              ) : (
                <>
                  Bạn đã chọn <span className="font-semibold text-red-300">VERIFIED</span> cho một email phishing.
                </>
              )}
            </p>
          </div>
        </div>

        {gameOverEmail ? (
          <>
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
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-300">
            Hãy xem lại gợi ý trong bài và thử báo cáo (Quarantine) khi có dấu hiệu lừa đảo.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-xl border border-cyan-400/45 bg-cyan-950/50 py-2.5 font-bold text-cyan-100 hover:bg-cyan-900/60 sm:w-auto sm:min-w-[200px]"
          >
            Tiếp tục &amp; gửi báo cáo
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-xl border border-red-400/45 bg-red-950/60 py-2.5 font-bold text-red-100 hover:bg-red-900/70 sm:w-auto sm:min-w-[140px]"
          >
            Chơi lại
          </button>
        </div>
      </div>
    </div>
  )
}
