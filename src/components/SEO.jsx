import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'CELPIPace'
const DEFAULT_OG_IMAGE = 'https://celpipace.vercel.app/og-image.png'
const SITE_URL = 'https://celpipace.vercel.app'

/**
 * Reusable SEO component.
 *
 * @param {string}  title        – Page title (will be appended with " | CELPIPace")
 * @param {string}  description  – Meta description (max ~160 chars)
 * @param {string}  [ogImage]    – Absolute URL to OG image (falls back to default)
 * @param {string}  [canonical]  – Canonical URL path, e.g. "/blog"
 * @param {boolean} [noindex]    – Set true for auth-gated/private pages
 */
export default function SEO({ title, description, ogImage, canonical, noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – CELPIP Practice Tests, Mock Exams & AI Scoring`
  const image = ogImage || DEFAULT_OG_IMAGE
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : null

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />
    </Helmet>
  )
}
