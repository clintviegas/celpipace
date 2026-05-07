import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { BRAND_NAME, SUPPORT_EMAIL } from '../data/constants'

const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    description: `${BRAND_NAME} privacy policy for account, payment, and practice data.`,
    heading: 'Privacy Policy',
    updated: 'Last updated: May 7, 2026',
    sections: [
      ['Information We Collect', 'We collect account details from Google sign-in, practice activity, saved scores, payment status, contact messages, and technical information needed to operate the learning platform. Payment card details are handled by Stripe and are not stored by us.'],
      ['How We Use Information', 'We use information to provide practice access, save progress, score responses, support accounts, prevent abuse, process subscriptions, review support or refund requests, and improve the product.'],
      ['Service Providers', 'We use providers such as Supabase, Stripe, Vercel, and scoring services to run the product. These providers process data only as needed to deliver their services.'],
      ['Your Choices', `You can request account support, data correction, or deletion by emailing ${SUPPORT_EMAIL}. Some records may need to be retained for security, legal, tax, or payment reasons.`],
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    description: `${BRAND_NAME} terms for using CELPIP practice tests, scoring, and study tools.`,
    heading: 'Terms and Conditions',
    updated: 'Last updated: May 7, 2026',
    sections: [
      ['Independent Practice Tool', `${BRAND_NAME} is an independent CELPIP preparation platform and is not affiliated with, endorsed by, sponsored by, or approved by CELPIP or Paragon Testing Enterprises.`],
      ['Educational Use', 'Practice content, scores, real-time feedback, and study guidance are for preparation only. They do not guarantee an official CELPIP score, immigration result, invitation, or application outcome.'],
      ['Accounts and Access', 'Google sign-in creates or opens your account automatically. Paid access is for the purchased access period and may not be shared, resold, copied, redistributed, or used to bypass access controls.'],
      ['Subscriptions and Cancellation', 'Premium plans are recurring subscriptions processed by Stripe. You can cancel through the billing portal. Cancellation stops future renewals, and access normally continues until the end of the paid billing period unless a refund or access reversal is approved.'],
      ['Acceptable Use', 'Do not abuse the service, scrape content, copy or redistribute practice materials, attempt to bypass payment or access controls, or upload unlawful, harmful, or infringing material.'],
      ['Refund Policy', 'Refund requests are handled under the Refund Policy. Completing practice content, using scoring, or changing your mind after substantial use does not automatically qualify for a refund.'],
    ],
  },
  refund: {
    title: 'Refund Policy',
    description: `${BRAND_NAME} refund policy for premium subscription access.`,
    heading: 'Refund Policy',
    updated: 'Last updated: May 7, 2026',
    sections: [
      ['Subscription Access', 'Premium plans are recurring subscriptions. You can cancel through the billing portal, and access continues until the end of the paid billing period.'],
      ['Eligible Refund Reasons', 'Refunds may be approved for genuine billing or access issues, such as duplicate charges, accidental duplicate subscriptions, a payment error, or a technical access problem that prevents premium use and cannot be resolved by support.'],
      ['Non-Eligible Cases', 'Refunds are not normally approved after substantial use of premium access, completion of practice sets or mock exams, repeated use of scoring tools, account sharing, policy abuse, or dissatisfaction with a predicted score or immigration outcome.'],
      ['Review Window', 'Refund requests should be submitted within 7 days of purchase. We may review account activity, scoring usage, mock exam usage, payment records, and support history before making a decision.'],
      ['How to Request Help', `Email ${SUPPORT_EMAIL} with the account email, purchase date, Stripe receipt if available, and a short description of the issue so the payment can be located and reviewed.`],
      ['Approved Refunds', 'Approved refunds are processed through Stripe and may result in premium access being revoked or the related subscription being cancelled. Bank/card processing times are controlled by Stripe and the card issuer.'],
    ],
  },
}

export default function LegalPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const page = pathname.replace(/^\//, '') || 'terms'
  const content = useMemo(() => PAGES[page] || PAGES.terms, [page])

  return (
    <main className="legal-page">
      <SEO title={content.title} description={content.description} canonical={`/${page}`} />
      <section className="legal-shell">
        <button className="legal-back" onClick={() => navigate('/')}>Back to home</button>
        <p className="legal-brand">{BRAND_NAME}</p>
        <h1>{content.heading}</h1>
        <p className="legal-updated">{content.updated}</p>
        <div className="legal-card">
          {content.sections.map(([heading, body]) => (
            <section key={heading} className="legal-section-block">
              <h2>{heading}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}
