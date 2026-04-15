import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import EpicHeroCarousel from '../components/landing/EpicHeroCarousel.jsx'
import AboutSection from '../components/landing/AboutSection.jsx'
import FeaturesSection from '../components/landing/FeaturesSection.jsx'
import SolutionsSection from '../components/landing/SolutionsSection.jsx'
import TestimonialSection from '../components/landing/TestimonialSection.jsx'
import CtaSection from '../components/landing/CtaSection.jsx'

export default function GuestLanding() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header variant="guest" />
      <main>
        <EpicHeroCarousel />
        <AboutSection />
        <FeaturesSection />
        <SolutionsSection />
        <TestimonialSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
