import "./globals.css";
import ThemeToggle from "../components/theme-toggle";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata = {
  title: {
    default: "Every One Should See This",
    template: "%s"
  },
  description: "Important articles translated into lots of languages and formats."
};

export const viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  function setThemeColor(mode) {
                    var dark = mode === "dark" || (mode === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
                    var color = dark ? "#151515" : "#f5f7fb";
                    var tags = document.querySelectorAll('meta[name="theme-color"]');
                    if (!tags.length) {
                      var tag = document.createElement("meta");
                      tag.setAttribute("name", "theme-color");
                      tag.setAttribute("content", color);
                      document.head.appendChild(tag);
                      return;
                    }
                    tags.forEach(function (tag) {
                      tag.setAttribute("content", color);
                    });
                  }

                  var mode = localStorage.getItem("theme-preference");
                  var root = document.documentElement;
                  if (mode === "light" || mode === "dark") {
                    root.setAttribute("data-theme", mode);
                    setThemeColor(mode);
                  } else {
                    root.removeAttribute("data-theme");
                    setThemeColor("system");
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <SiteHeader />
        <ThemeToggle />
        <div className="siteContent">{children}</div>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
