import { PRODUCT_STATS } from '../data/constants'

const ITEMS = [
  { value: PRODUCT_STATS.questionItems, label: 'CELPIP-style question items' },
  { value: PRODUCT_STATS.mockExams, label: 'Full timed mock exams' },
  { value: '4', label: 'Skills with instant CLB scoring' },
  { value: 'CLB 4–12', label: 'Aligned to official band levels' },
]

export default function CredibilityBand() {
  return (
    <section className="hp-credibility" aria-label="Why test-takers trust CELPIPACE">
      <div className="hp-credibility-inner">
        {ITEMS.map((item) => (
          <div key={item.label} className="hp-credibility-item">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
