import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <div className="footerTextGroup">
          <nav className="footerLinks" aria-label="Footer">
            <Link href="/#article" className="footerLink">
              Article
            </Link>
            <Link href="/about" className="footerLink">
              About
            </Link>
            <a
              href="https://github.com/ashvinpraveen/rosereader"
              target="_blank"
              rel="noopener noreferrer"
              className="footerLink"
            >
              GitHub
            </a>
          </nav>

          <p className="footerCredit">
            made with{" "}
            <span aria-label="love" role="img">
              ❤️
            </span>{" "}
            by{" "}
            <a
              href="https://x.com/ashvinpk"
              target="_blank"
              rel="noopener noreferrer"
              className="footerLink"
            >
              @ashvinpk
            </a>{" and "}
            <a href="https://openai.com/codex" target="_blank" rel="noopener noreferrer" className="footerLink">
              codex
            </a>{" "}
            in 2 hours
          </p>
        </div>

        <div className="footerThemeToggle">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
