import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/pagination'

const slides = [
  {
    title: 'Bảo vệ tài khoản ngân hàng',
    description:
      'Mô phỏng các kịch bản đánh cắp thông tin đăng nhập và học cách phản ứng đúng trong vài giây.',
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Nhận diện Email Phishing',
    description:
      'Phân tích header, link giả mạo và dấu hiệu ngôn ngữ để không bị dụ vào bẫy.',
    image:
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Smishing & tin nhắn độc hại',
    description:
      'Luyện tập với SMS/Zalo giả mạo để bảo vệ OTP và thông tin cá nhân.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80&auto=format&fit=crop',
  },
]

export default function HeroSlide() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900">
      <Swiper
        className="hero-swiper w-full"
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        speed={600}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="relative min-h-[320px] w-full sm:min-h-[420px] md:min-h-[520px] lg:min-h-[600px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-transparent to-violet-950/20" />

              <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20 md:px-10 lg:mx-auto lg:max-w-7xl lg:px-8">
                <div className="max-w-2xl">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] !text-cyan-200">
                    Chiến dịch nổi bật
                  </p>
                  <h2 className="text-3xl font-bold leading-tight !text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.25)] sm:text-4xl md:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed !text-white/95 sm:text-base">
                    {slide.description}
                  </p>
                  <Link
                    to="/login"
                    className="mt-8 inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.25)] transition hover:border-cyan-300/60 hover:bg-cyan-500/25 hover:shadow-[0_0_28px_rgba(34,211,238,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                  >
                    Tham gia ngay
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
