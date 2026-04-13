import { Globe, Share2 } from 'lucide-react'

const quickLinks = [
  { label: 'Điều khoản', href: '#' },
  { label: 'Chính sách bảo mật', href: '#' },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-semibold text-cyan-200 drop-shadow-[0_0_14px_rgba(34,211,238,0.25)]">
              CyberShield Academy
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              Nền tảng học tập kết hợp game — luyện phòng thủ trước các kịch bản
              tấn công mạng thực tế.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Liên kết nhanh
            </h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Liên hệ & Mạng xã hội
            </h3>
            <div className="mt-4 flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200 hover:shadow-[0_0_16px_rgba(34,211,238,0.25)]"
                aria-label="Cộng đồng"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200 hover:shadow-[0_0_16px_rgba(192,132,252,0.25)]"
                aria-label="Chia sẻ"
              >
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-slate-800/80 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CyberShield Academy. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
