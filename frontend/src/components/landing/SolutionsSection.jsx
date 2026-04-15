import { motion } from 'framer-motion'
import {
  BarChart3,
  ClipboardCheck,
  Shield,
  UsersRound,
} from 'lucide-react'

const solutions = [
  {
    title: 'Giảm thiểu rủi ro từ con người',
    body: 'Theo dõi hành vi, ngăn chặn mối đe dọa trước khi gây thiệt hại.',
    icon: Shield,
  },
  {
    title: 'Xây dựng văn hóa bảo mật',
    body: 'Gamification, thử thách nhóm — biến tuân thủ thành thói quen.',
    icon: UsersRound,
  },
  {
    title: 'Đáp ứng tiêu chuẩn & Kiểm toán',
    body: 'Báo cáo tự động, quản lý chứng chỉ — sẵn sàng cho rà soát.',
    icon: ClipboardCheck,
  },
  {
    title: 'Đo lường & Cải thiện hiệu quả',
    body: 'Dashboard tùy biến, theo dõi ROI và tiến độ theo thời gian thực.',
    icon: BarChart3,
  },
]

export default function SolutionsSection() {
  return (
    <section className="border-t border-white/5 bg-slate-950 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center justify-center text-center mb-12">
          <h2 className="text-2xl font-bold !text-white sm:text-3xl md:text-4xl">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Giải Pháp Định Hình Mục Tiêu Bảo Mật
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm !text-slate-300 sm:text-base">
            Bốn trụ cột để đưa nhận thức an ninh vào vận hành thực tế.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8">
          {solutions.map((item, index) => {
            const isLeft = index % 2 === 0
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45 }}
                className={[
                  'flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all sm:flex-row sm:items-center sm:gap-8 sm:p-8',
                  'hover:-translate-y-1 hover:border-violet-400/20 hover:shadow-[0_0_36px_rgba(139,92,246,0.08)]',
                  !isLeft ? 'lg:flex-row-reverse' : '',
                ].join(' ')}
              >
                <div className="flex shrink-0 justify-center sm:justify-start">
                  <div className="rounded-2xl bg-gradient-to-br from-cyan-500/15 to-violet-500/10 p-5 ring-1 ring-white/10">
                    <item.icon
                      className="h-10 w-10 text-cyan-300"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {item.body}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
