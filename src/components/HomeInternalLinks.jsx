import { Link } from 'react-router-dom'
import { CORE_PRODUCT_LINKS, FEATURED_BLOG_LINKS, TOOL_RESOURCE_LINKS } from '../data/crawlLinks'

function LinkColumn({ heading, links }) {
  return (
    <div className="seo-link-col">
      <h2>{heading}</h2>
      <ul className="seo-link-list">
        {links.map(link => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function HomeInternalLinks() {
  return (
    <nav className="home-crawl-links seo-internal-links" aria-label="CELPIP practice tests, tools, and study guides">
      <div className="home-crawl-inner seo-internal-links-inner">
        <p className="seo-section-label">Explore CELPIPACE</p>
        <div className="seo-link-columns">
          <LinkColumn heading="Practice tests" links={CORE_PRODUCT_LINKS} />
          <LinkColumn heading="Tools & resources" links={TOOL_RESOURCE_LINKS} />
          <LinkColumn heading="Popular study guides" links={FEATURED_BLOG_LINKS} />
        </div>
      </div>
    </nav>
  )
}
