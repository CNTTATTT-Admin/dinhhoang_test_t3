import { NavLink } from 'react-router-dom'
import PageShell from '../layout/PageShell.jsx'

const navItems = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/scenarios', label: 'Scenarios' },
  { to: '/admin/scenario-steps', label: 'Scenario Steps' },
  { to: '/admin/inbox-emails', label: 'Inbox Emails' },
  { to: '/admin/sessions', label: 'Sessions' },
  { to: '/admin/users', label: 'Users' },
]

const navClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]'
      : 'text-slate-300 hover:text-cyan-200 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]',
  ].join(' ')

export default function AdminLayout({ children }) {
  return (
    <PageShell headerVariant="user">
      <div className="flex-1 flex w-full bg-[#0B1120] text-white">
        <aside className="w-[280px] border-r border-white/5 px-4 py-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-cyan-200">Admin</h2>
            <p className="mt-1 text-xs text-slate-400">
              Quản lý nội dung & thống kê.
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
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
        </aside>

        <section className="flex-1 px-6 py-8 overflow-auto">{children}</section>
      </div>
    </PageShell>
  )
}

