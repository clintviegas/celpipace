import AIFeatures from './AIFeatures'
import CRSBooster from './CRSBooster'
import CTA from './CTA'
import FeatureShowcase from './FeatureShowcase'
import HowItWorks from './HowItWorks'
import Pricing from './Pricing'

export default function HomeDesktopSections({ onSignIn }) {
  return (
    <>
      <FeatureShowcase />
      <AIFeatures />
      <HowItWorks />
      <CRSBooster />
      <Pricing onSignIn={onSignIn} showFaq={false} />
      <CTA />
    </>
  )
}