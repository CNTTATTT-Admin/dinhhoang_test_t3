import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

const bullets = [
  'Khóa học tương tác',
  'Tracking real-time',
  'Report chuẩn kiểm toán',
  'Đội ngũ hỗ trợ 24/7',
]

export default function CtaSection() {
  return (
    <section className="border-t border-white/5 bg-slate-950 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-700/90 via-slate-900 to-violet-950 p-8 shadow-[0_0_60px_rgba(34,211,238,0.12)] sm:p-10 lg:p-12">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-violet-600/25 blur-3xl"
            aria-hidden
          />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <h2 className="text-2xl font-bold !text-white sm:text-3xl lg:text-4xl">
                Sẵn Sàng Trải Nghiệm?
              </h2>
              <p className="mt-4 text-sm leading-relaxed !text-slate-300 sm:text-base">
                Tạo tài khoản ngay hôm nay để tham gia các kịch bản mô phỏng tấn
                công mạng. Hoàn toàn miễn phí, không yêu cầu thẻ tín dụng.
              </p>
              <ul className="mt-6 space-y-3">
                {bullets.map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-3 text-sm text-slate-200"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                      <Check className="h-3.5 w-3.5 text-cyan-200" aria-hidden />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 lg:items-end">
              <Link
                to="/login"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-white px-8 py-3.5 text-center text-base font-bold text-slate-900 shadow-lg transition hover:bg-slate-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 sm:w-auto"
              >
                Đăng Ký Miễn Phí
              </Link>
              <p className="text-center text-xs text-slate-400 lg:text-right">
                Chỉ mất vài phút — bắt đầu luyện tập ngay sau khi đăng ký.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
