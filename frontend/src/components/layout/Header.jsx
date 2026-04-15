import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LogIn, LogOut, Menu, X } from 'lucide-react'

const navClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]'
      : 'text-slate-300 hover:text-cyan-200 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]',
  ].join(' ')

const links = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/campaigns', label: 'Chiến dịch' },
  { to: '/leaderboard', label: 'Bảng xếp hạng' },
  { to: '/handbook', label: 'Cẩm nang' },
]

/**
 * @param {'guest' | 'user'} [variant]
 * @param {() => void} [onLogout] — bắt buộc khi variant === 'user'
 */
export default function Header({ variant = 'guest', onLogout }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 font-semibold tracking-tight text-cyan-200 drop-shadow-[0_0_14px_rgba(34,211,238,0.35)] transition hover:text-cyan-100"
        >
          CyberShield Academy
        </Link>

        <nav className="hidden items-center justify-center gap-1 md:flex md:flex-1">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {variant === 'guest' ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400/40 transition hover:from-cyan-500 hover:to-cyan-400 hover:shadow-[0_0_28px_rgba(34,211,238,0.55)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Đăng nhập
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onLogout?.()}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-100 shadow-[0_0_20px_rgba(139,92,246,0.25)] transition hover:bg-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Đăng xuất
            </button>
          )}

          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-cyan-200"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/5 bg-slate-900/95 px-4 py-2 md:hidden">
          <nav className="flex flex-col gap-1 pb-2">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
