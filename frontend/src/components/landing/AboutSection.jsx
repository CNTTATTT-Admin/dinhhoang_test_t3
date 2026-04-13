import { motion } from 'framer-motion'
import { Eye, Rocket, Zap } from 'lucide-react'

const cards = [
  {
    label: 'Tầm Nhìn',
    title: 'Kỷ Nguyên Human Firewall',
    body:
      'Xây dựng hệ sinh thái số an toàn. Rèn luyện hàng triệu người dùng trở thành "Bức tường lửa con người" kiên cố, bất khả xâm phạm.',
    icon: Eye,
    ring: 'ring-cyan-400/25',
    gradient: 'from-cyan-500/10 via-transparent to-violet-500/10',
  },
  {
    label: 'Sứ Mệnh',
    title: 'Thao Trường Giả Lập',
    body:
      'Ném người học vào tâm bão Phishing, Smishing. Thay bài giảng nhàm chán bằng thử thách sinh tồn chân thực, không rủi ro.',
    icon: Rocket,
    ring: 'ring-violet-400/25',
    gradient: 'from-violet-500/10 via-transparent to-cyan-500/10',
  },
  {
    label: 'Giá Trị Cốt Lõi',
    title: 'Phản Xạ Thép',
    body:
      'Hình thành phản xạ trước cạm bẫy lừa đảo. Nắm bắt tâm lý tội phạm mạng để biến sự sợ hãi thành vũ khí thực chiến.',
    icon: Zap,
    ring: 'ring-cyan-400/20',
    gradient: 'from-cyan-500/10 via-transparent to-fuchsia-500/10',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
}

export default function AboutSection() {
  return (
    <section className="border-t border-white/5 bg-slate-950 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center justify-center text-center mb-12">
          <h2 className="text-3xl font-bold !text-white sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(34,211,238,0.2)]">
              Về CyberShield Academy
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base font-medium !text-slate-300 sm:text-lg">
            Nhập vai. Trải nghiệm. Sống sót trên không gian mạng.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item, i) => (
            <motion.article
              key={item.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className={[
                'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all',
                'hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-[0_20px_50px_-12px_rgba(34,211,238,0.15)]',
                'ring-1',
                item.ring,
              ].join(' ')}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 ${item.gradient}`}
                aria-hidden
              />
              <div className="relative">
                <div className="mb-5 inline-flex rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <item.icon
                    className="h-10 w-10 text-cyan-300"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {item.label}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {item.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
