import { motion } from 'framer-motion'
import { Bot, ShieldAlert, Target, Users } from 'lucide-react'

const features = [
  {
    title: 'Đào Tạo Nhận Thức Bảo Mật',
    body:
      'Cung cấp chương trình đào tạo toàn diện, mô-đun tương tác và kịch bản thực tế.',
    icon: Target,
  },
  {
    title: 'Giả Lập Phishing Thông Minh',
    body:
      'Tấn công giả lập sát thực tế, chiến dịch tự động và báo cáo chi tiết.',
    icon: ShieldAlert,
  },
  {
    title: 'Quản Lý Rủi Ro Con Người',
    body:
      'Phân tích nâng cao để đánh giá và giảm thiểu rủi ro từ hành vi người dùng.',
    icon: Users,
  },
  {
    title: 'Trợ Lý AI Thông Minh',
    body:
      'Hướng dẫn ngữ cảnh và giải đáp thắc mắc bảo mật 24/7.',
    icon: Bot,
  },
]

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
}

export default function FeaturesSection() {
  return (
    <section className="border-t border-white/5 bg-slate-900 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center justify-center text-center mb-12">
          <h2 className="text-2xl font-bold leading-tight !text-white sm:text-3xl md:text-4xl">
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-violet-400 bg-clip-text text-transparent">
              Tính Năng Cốt Lõi Cho Sự Bảo Vệ Toàn Diện
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm !text-slate-300 sm:text-base">
            Mọi thứ bạn cần để xây dựng văn hóa nhận thức bảo mật trong tổ chức.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, i) => (
            <motion.article
              key={item.title}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-30px' }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:-translate-y-2 hover:border-cyan-400/25 hover:shadow-[0_0_40px_rgba(34,211,238,0.12)]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/10 p-3 ring-1 ring-white/10">
                <item.icon
                  className="h-8 w-8 text-cyan-300"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
