import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-slate-100">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.2)]">
          Sắp ra mắt
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-400">
          Tính năng đang được xây dựng. Quay lại Trang chủ để tiếp tục luyện tập.
        </p>
      </main>
      <Footer />
    </div>
  )
}
