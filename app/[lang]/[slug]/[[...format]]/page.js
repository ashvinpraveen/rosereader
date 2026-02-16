import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleFeedbackDialog from "../../../../components/article-feedback";
import {
  getArticleDocument,
  getArticlePath,
  listStaticArticleParams
} from "../../../../lib/content";

function formatLabel(format) {
  return format.charAt(0).toUpperCase() + format.slice(1);
}

function findLanguageLabel(languages, code) {
  return languages.find((language) => language.code === code)?.label ?? code;
}

function withCompareParam(pathname, enabled) {
  if (!enabled) return pathname;
  return `${pathname}?compare=1`;
}

function renderArticleBlocks(blocks) {
  return blocks.map((block, index) => {
    const key = `${block.type}-${index}`;

    if (block.type === "heading") {
      if (block.level <= 2) {
        return (
          <h2 className="articleSectionTitle" key={key}>
            {block.text}
          </h2>
        );
      }

      return (
        <h3 className="articleSectionTitle" key={key}>
          {block.text}
        </h3>
      );
    }

    if (block.type === "quote") {
      return (
        <blockquote className="articleQuote" key={key}>
          {block.text}
        </blockquote>
      );
    }

    if (block.type === "unordered-list") {
      return (
        <ul className="articleList" key={key}>
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );
    }

    if (block.type === "ordered-list") {
      return (
        <ol className="articleList" key={key}>
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{item}</li>
          ))}
        </ol>
      );
    }

    return (
      <p className="articleParagraph" key={key}>
        {block.text}
      </p>
    );
  });
}

export async function generateStaticParams() {
  return listStaticArticleParams();
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const requestedFormat = resolvedParams.format?.[0] ?? "full";

  const article = await getArticleDocument({
    slug: resolvedParams.slug,
    lang: resolvedParams.lang,
    format: requestedFormat
  });

  if (!article) {
    return { title: "Not found" };
  }

  const languageAlternates = Object.fromEntries(
    article.languages.map((language) => [
      language.code,
      getArticlePath({
        lang: language.code,
        slug: article.slug,
        format: article.format
      })
    ])
  );

  return {
    title: `${article.frontmatter.title} | Every One Should See This`,
    description: article.meta.previewText ?? article.meta.title,
    alternates: {
      canonical: getArticlePath({
        lang: article.lang,
        slug: article.slug,
        format: article.format
      }),
      languages: languageAlternates
    }
  };
}

export default async function ArticlePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const requestedFormat = resolvedParams.format?.[0] ?? "full";

  const article = await getArticleDocument({
    slug: resolvedParams.slug,
    lang: resolvedParams.lang,
    format: requestedFormat
  });

  if (!article) {
    notFound();
  }

  const originalLanguage = article.meta.defaultLanguage ?? "en";
  const canCompare = article.lang !== originalLanguage;
  const isCompareRequested = resolvedSearchParams?.compare === "1";
  const isCompare = Boolean(canCompare && isCompareRequested);

  const originalArticle = isCompare
    ? await getArticleDocument({
        slug: article.slug,
        lang: originalLanguage,
        format: article.format
      })
    : null;

  const originalArticleUrl =
    article.meta.sourceUrl ?? "https://shumer.dev/something-big-is-happening";

  const languageTabHref = (languageCode) =>
    withCompareParam(
      getArticlePath({
        lang: languageCode,
        slug: article.slug,
        format: article.format
      }),
      isCompare && languageCode !== originalLanguage
    );

  const formatTabHref = (format) =>
    withCompareParam(
      getArticlePath({
        lang: article.lang,
        slug: article.slug,
        format
      }),
      isCompare
    );

  const compareToggleHref = isCompare
    ? getArticlePath({ lang: article.lang, slug: article.slug, format: article.format })
    : withCompareParam(
        getArticlePath({ lang: article.lang, slug: article.slug, format: article.format }),
        true
      );

  return (
    <main className={`page articlePage ${isCompare ? "pageWide" : ""}`}>
      <header className="articleHeader">
        <h1 className="title">{article.frontmatter.title}</h1>

        <div className="articleMetaRow" aria-label="Article metadata">
          <p className="articleByline">{article.frontmatter.byline}</p>

          {article.meta.author?.xUrl && (
            <a
              className="followButton"
              href={article.meta.author.xUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="followIcon" aria-hidden="true">
                <img src="/social-icons/X_Twitter_logo.svg" alt="" />
              </span>
              <span>Follow {article.meta.author.xHandle ?? article.meta.author.name}</span>
            </a>
          )}
        </div>

        <a
          className="originalArticleLink"
          href={originalArticleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the original article
        </a>
      </header>

      <div className="tabsShell">
        <div className="tabsRow">
          <nav className="tabs" aria-label="Language tabs">
            {article.languages.map((language) => {
              const isActive = language.code === article.lang;
              return (
                <Link
                  key={language.code}
                  href={languageTabHref(language.code)}
                  className={`tab ${isActive ? "tabActive" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {language.label}
                </Link>
              );
            })}
          </nav>

          {canCompare && (
            <Link
              className="compareToggle"
              href={compareToggleHref}
              aria-label={isCompare ? "Close side-by-side view" : "Open side-by-side view"}
            >
              <span className="compareToggleIcon" aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                  <rect x="2.5" y="3.5" width="15" height="13" rx="2.5" />
                  <path d="M10 3.5v13" />
                </svg>
              </span>
              <span className="compareToggleLabel">
                {isCompare ? "Single" : "Compare"}
              </span>
            </Link>
          )}
        </div>
      </div>

      {article.formats.length > 1 && (
        <nav className="formatTabs" aria-label="Format tabs">
          {article.formats.map((format) => {
            const isActive = format === article.format;
            return (
              <Link
                key={format}
                href={formatTabHref(format)}
                className={`formatTab ${isActive ? "formatTabActive" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {formatLabel(format)}
              </Link>
            );
          })}
        </nav>
      )}

      {isCompare && originalArticle ? (
        <section className="dualView" aria-label="Side-by-side article view">
          <div className="dualColumn">
            <p className="dualLabel">
              {findLanguageLabel(article.languages, originalArticle.lang)}
            </p>
            <article className="article dualArticle">{renderArticleBlocks(originalArticle.blocks)}</article>
          </div>

          <div className="dualColumn">
            <p className="dualLabel">{findLanguageLabel(article.languages, article.lang)}</p>
            <article className="article dualArticle">{renderArticleBlocks(article.blocks)}</article>
          </div>
        </section>
      ) : (
        <article className="article">{renderArticleBlocks(article.blocks)}</article>
      )}

      <div className="feedbackBar" aria-label="Feedback">
        {article.meta.author?.xUrl && (
          <a
            className="followButton"
            href={article.meta.author.xUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="followIcon" aria-hidden="true">
              <img src="/social-icons/X_Twitter_logo.svg" alt="" />
            </span>
            <span>Follow {article.meta.author.xHandle ?? article.meta.author.name}</span>
          </a>
        )}
        <ArticleFeedbackDialog
          articleTitle={article.frontmatter.title}
          slug={article.slug}
          currentLang={article.lang}
          currentFormat={article.format}
          languages={article.languages}
          formats={article.formats}
          whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_FEEDBACK_NUMBER ?? ""}
        />
      </div>

      <p className="credit">
        Original article:{" "}
        <a href={article.meta.sourceUrl} target="_blank" rel="noopener noreferrer">
          {article.meta.title}
        </a>{" "}
        by{" "}
        <a href={article.meta.author.xUrl} target="_blank" rel="noopener noreferrer">
          {article.meta.author.name}
        </a>
        {" • "}
        {article.meta.publishedAt}
      </p>
    </main>
  );
}
