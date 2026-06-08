import { MarketingNav } from './MarketingNav'
import { Hero } from './Hero'
import { MetricsBand } from './MetricsBand'
import { FeaturePillars } from './FeaturePillars'
import { HowItWorks } from './HowItWorks'
import { RoleHighlight } from './RoleHighlight'
import { FinalCta } from './FinalCta'
import { MarketingFooter } from './MarketingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-700">
      <MarketingNav />
      <main>
        <Hero />
        <MetricsBand />
        <FeaturePillars />
        <HowItWorks />
        <RoleHighlight />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  )
}
