import AIFeatures from './AIFeatures'
import CRSBooster from './CRSBooster'
import CTA from './CTA'
import CredibilityBand from './CredibilityBand'
import ExamCountdownSignup from './ExamCountdownSignup'
import FeatureShowcase from './FeatureShowcase'
import HomeFAQ from './HomeFAQ'
import HowItWorks from './HowItWorks'
import Pricing from './Pricing'
import Testimonials from './Testimonials'

export default function HomeDesktopSections({ onSignIn }) {
  return (
    <>
      <CredibilityBand />
      <FeatureShowcase />
      <AIFeatures />
      <HowItWorks />
      <Testimonials />
      <CRSBooster />
      <ExamCountdownSignup onSignIn={onSignIn} />
      <Pricing onSignIn={onSignIn} showFaq={false} />
      <HomeFAQ />
      <CTA />
    </>
  )
}