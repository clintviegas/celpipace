import { Helmet } from 'react-helmet-async'
import { BRAND_NAME, PUBLIC_SITE_URL } from '../data/constants'

const DEFAULT_OG_IMAGE = `${PUBLIC_SITE_URL}/og-image.png`
const SITE_URL = PUBLIC_SITE_URL
const DEFAULT_DESCRIPTION = 'Prepare for CELPIP with mock exams, section practice, instant scoring, and progress tracking.'

/**
 * Reusable SEO component.
 *
 * @param {string}  title        – Page title (will be appended with " | CELPIPACE" unless already branded)
 * @param {string}  description  – Meta description (max ~160 chars)
 * @param {string}  [ogImage]    – Absolute URL to OG image (falls back to default)
 * @param {string}  [canonical]  – Canonical URL path, e.g. "/blog"
 * @param {boolean} [noindex]    – Set true for auth-gated/private pages
 * @param {object|object[]} [jsonLd] – Optional JSON-LD structured data
 */
export default function SEO({ title, description, ogImage, canonical, noindex = false, jsonLd }) {
  const cleanTitle = title?.replace(/\s*\|\s*celpipace\s*$/i, '').trim()
  const fullTitle = cleanTitle
    ? /celpipace/i.test(cleanTitle) ? cleanTitle : `${cleanTitle} | ${BRAND_NAME}`
    : `${BRAND_NAME} | CELPIP Practice Tests, Mock Exams & Instant Scoring`
  const metaDescription = description || DEFAULT_DESCRIPTION
  const image = ogImage || DEFAULT_OG_IMAGE
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : null

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name"   content={BRAND_NAME} />
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image"       content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image"       content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  )
}
