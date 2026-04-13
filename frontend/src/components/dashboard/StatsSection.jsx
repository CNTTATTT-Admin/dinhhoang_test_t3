import { BarChart3, BookOpen, ShieldCheck, Zap } from 'lucide-react'

const stats = [
  {
    label: 'Kịch bản đã hoàn thành',
    value: '24',
    sub: '+3 tuần này',
    icon: BookOpen,
    accent: 'from-cyan-500/20 to-cyan-600/5',
    ring: 'ring-cyan-400/25',
  },
  {
    label: 'Điểm kinh nghiệm',
    value: '8.420',
    sub: 'Cấp 12 · Elite',
    icon: Zap,
    accent: 'from-violet-500/20 to-violet-600/5',
    ring: 'ring-violet-400/25',
  },
  {
    label: 'Tỷ lệ nhận diện rủi ro',
    value: '94%',
    sub: 'Trung bình 30 ngày',
    icon: BarChart3,
    accent: 'from-cyan-500/15 to-violet-500/15',
    ring: 'ring-cyan-400/20',
  },
]

export default function StatsSection() {
  return (
    <section className="mb-16">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            Thống kê & Thành tựu
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Dữ liệu mô phỏng — sẽ nối API sau.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-cyan-400/80" />
          Hệ thống đang hoạt động
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className={[
              'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-6 shadow-lg ring-1',
              item.accent,
              item.ring,
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
                <item.icon className="h-6 w-6 text-cyan-300/90" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
