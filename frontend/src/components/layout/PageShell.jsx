import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function PageShell({ headerVariant = 'guest', children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-white">
      <Header variant={headerVariant} />
      <div className="flex-grow bg-[#0B1120]">{children}</div>
      <Footer />
    </div>
  )
}

