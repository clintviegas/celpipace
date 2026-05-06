import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { BRAND_NAME, SUPPORT_EMAIL } from '../data/constants'

const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    description: `${BRAND_NAME} privacy policy for account, payment, and practice data.`,
    heading: 'Privacy Policy',
    updated: 'Last updated: April 27, 2026',
    sections: [
      ['Information We Collect', 'We collect account details, practice activity, payment status, and technical information needed to operate the learning platform. Payment card details are handled by Stripe and are not stored by us.'],
      ['How We Use Information', 'We use information to provide practice access, save progress, score responses, support accounts, prevent abuse, and improve the product.'],
      ['Service Providers', 'We use providers such as Supabase, Stripe, Vercel, and AI scoring services to run the product. These providers process data only as needed to deliver their services.'],
      ['Your Choices', `You can request account support, data correction, or deletion by emailing ${SUPPORT_EMAIL}. Some records may need to be retained for security, legal, tax, or payment reasons.`],
    ],
  },
  terms: {
    title: 'Terms of Service',
    description: `${BRAND_NAME} terms for using CELPIP practice tests, scoring, and study tools.`,
    heading: 'Terms of Service',
    updated: 'Last updated: April 27, 2026',
    sections: [
      ['Independent Practice Tool', `${BRAND_NAME} is an independent CELPIP preparation platform and is not affiliated with, endorsed by, sponsored by, or approved by CELPIP or Paragon Testing Enterprises.`],
      ['Educational Use', 'Practice content, scores, AI feedback, and study guidance are for preparation only. They do not guarantee an official CELPIP score, immigration result, invitation, or application outcome.'],
      ['Accounts and Access', 'You are responsible for keeping your login secure. Paid access is for the purchased access period and may not be shared, resold, copied, or redistributed.'],
      ['Acceptable Use', 'Do not abuse the service, scrape content, attempt to bypass payment or access controls, or upload unlawful or harmful material.'],
    ],
  },
  refund: {
    title: 'Refund Policy',
    description: `${BRAND_NAME} refund policy for premium subscription access.`,
    heading: 'Refund Policy',
    updated: 'Last updated: April 27, 2026',
    sections: [
      ['Subscription Access', 'Premium plans are recurring subscriptions. You can cancel through the billing portal, and access continues until the end of the paid billing period.'],
      ['Refund Requests', 'Refund requests are reviewed within 7 days of purchase. Approval may depend on usage, duplicate purchase issues, technical access problems, or other support context.'],
      ['How to Request Help', `Email ${SUPPORT_EMAIL} with the account email, purchase date, and a short description of the issue so the payment can be located.`],
      ['Stripe Processing', 'Approved refunds are processed through Stripe. Bank/card processing times are controlled by the payment provider and card issuer.'],
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
