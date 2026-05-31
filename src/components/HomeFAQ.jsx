import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'What is a CELPIP mock test?',
    a: 'A CELPIP mock test is a full-length timed simulation of the official CELPIP General exam, covering Listening, Reading, Writing, and Speaking. CELPIPACE mock exams include instant CLB score reports and real-time AI feedback on writing and speaking.',
  },
  {
    q: 'Is CELPIPACE free to use?',
    a: 'Yes. CELPIPACE offers free section practice across all four CELPIP skills. Full-length mock exams and detailed score reports are available with a premium subscription.',
  },
  {
    q: 'How do I prepare for the CELPIP exam?',
    a: 'Start with section drills to identify your weakest skill, then take timed mock exams to build stamina. Review your CLB score reports after each mock to focus your remaining study time on the sections that will gain you the most CRS points.',
  },
  {
    q: 'Does CELPIPACE cover all four CELPIP sections?',
    a: 'Yes. CELPIPACE includes practice and mock exam content for all four CELPIP General sections: Listening, Reading, Writing, and Speaking.',
  },
  {
    q: 'Is CELPIP accepted for Canadian permanent residence?',
    a: 'Yes. CELPIP General is an accepted English language test for many Canadian immigration programs, including Express Entry. Your CELPIP scores are converted to CLB levels, which determine your CRS language points.',
  },
]

export default function HomeFAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section className="hp-faq" id="faq">
      <div className="section-inner">
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Questions
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Frequently asked <span className="highlight">questions</span>
        </motion.h2>

        <div className="pricing-faq hp-faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                {faq.q}
                <span className="faq-chevron">{open === i ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
