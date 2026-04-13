import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const quotes = [
  {
    text:
      'CyberShield Academy đã thay đổi hoàn toàn văn hóa bảo mật của chúng tôi. Các mô-đun tương tác rất hấp dẫn và tỷ lệ tuân thủ chưa bao giờ cao đến thế.',
    role: 'CISO, Ngành Công Nghệ',
  },
  {
    text:
      'Dashboard quản lý cung cấp tầm nhìn theo thời gian thực về tiến độ của team. Công cụ đắc lực để đáp ứng các yêu cầu kiểm toán.',
    role: 'Giám đốc IT, Y Tế',
  },
  {
    text:
      'Nền tảng đào tạo bảo mật tốt nhất chúng tôi từng dùng. Tỷ lệ click vào link rủi ro giảm tới 87% chỉ trong quý đầu tiên.',
    role: 'VP Operations, Tài Chính',
  },
]

export default function TestimonialSection() {
  return (
    <section className="border-t border-white/5 bg-slate-900 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center justify-center text-center mb-12">
          <h2 className="text-3xl font-bold !text-white sm:text-4xl">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm !text-slate-300 sm:text-base">
            Phản hồi từ các đội ngũ an ninh và vận hành.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:-translate-y-2 hover:border-cyan-400/20"
            >
              <Quote
                className="absolute -right-2 -top-2 h-24 w-24 text-white/[0.06]"
                aria-hidden
                strokeWidth={1}
              />
              <div className="relative">
                <p className="text-sm leading-relaxed !text-slate-300 sm:text-[15px]">
                  “{q.text}”
                </p>
                <footer className="mt-5 border-t border-white/10 pt-4 text-xs font-medium !text-slate-400">
                  {q.role}
                </footer>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
