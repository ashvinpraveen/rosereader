import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <Link href="/" className="siteBrand" aria-label="Home">
          rosereader
        </Link>

        <nav className="siteNav" aria-label="Primary">
          <Link href="/#article" className="siteNavLink">
            Article
          </Link>
          <Link href="/about" className="siteNavLink">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
