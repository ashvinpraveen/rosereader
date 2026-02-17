import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ArticleFeedbackDialog from "../../../../components/article-feedback";
import {
  getArticleDocument,
  getArticlePath
} from "../../../../lib/content";

export const dynamic = "force-dynamic";

function formatLabel(format) {
  return format.charAt(0).toUpperCase() + format.slice(1);
}

function findLanguageLabel(languages, code) {
  return languages?.find?.((language) => language.code === code)?.label ?? code;
}

function withCompareParam(pathname, enabled) {
  if (!enabled) return pathname;
  return `${pathname}?compare=1`;
}

function isNotFoundError(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String(error.digest).includes("NEXT_HTTP_ERROR_FALLBACK;404")
  );
}

function stripMarkdownForDescription(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1")
    .replace(/[`*_>#~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractOpeningDescription(markdownBody) {
  if (typeof markdownBody !== "string") return "";

  const blocks = markdownBody
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    if (block === "---") continue;
    if (/^[-*_]{3,}$/.test(block.replace(/\s+/g, ""))) continue;
    if (block.startsWith("#")) continue;
    if (block.startsWith(">")) continue;

    const cleaned = stripMarkdownForDescription(block);
    if (cleaned) return cleaned;
  }

  return "";
}

function resolveMetaDescription(article) {
  const frontmatterSummary =
    article?.frontmatter?.previewText ??
    article?.frontmatter?.description ??
    article?.frontmatter?.summary;

  if (typeof frontmatterSummary === "string" && frontmatterSummary.trim()) {
    return frontmatterSummary.trim();
  }

  const isDefaultLanguage = article?.lang === article?.meta?.defaultLanguage;
  if (isDefaultLanguage && typeof article?.meta?.previewText === "string" && article.meta.previewText.trim()) {
    return article.meta.previewText.trim();
  }

  return extractOpeningDescription(article?.body) || article?.meta?.previewText || article?.meta?.title;
}

const markdownComponents = {
  h1: ({ children }) => <h2 className="articleSectionTitle">{children}</h2>,
  h2: ({ children }) => <h2 className="articleSectionTitle">{children}</h2>,
  h3: ({ children }) => <h3 className="articleSectionTitle">{children}</h3>,
  h4: ({ children }) => <h3 className="articleSectionTitle">{children}</h3>,
  h5: ({ children }) => <h3 className="articleSectionTitle">{children}</h3>,
  h6: ({ children }) => <h3 className="articleSectionTitle">{children}</h3>,
  p: ({ children }) => <p className="articleParagraph">{children}</p>,
  blockquote: ({ children }) => <blockquote className="articleQuote">{children}</blockquote>,
  ul: ({ children }) => <ul className="articleList">{children}</ul>,
  ol: ({ children }) => <ol className="articleList">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  try {
    const requestedFormat = resolvedParams.format?.[0] ?? "full";

    const article = await getArticleDocument({
      slug: resolvedParams.slug,
      lang: resolvedParams.lang,
      format: requestedFormat
    });

    if (!article) {
      return { title: "Not found" };
    }

    const articlePath = getArticlePath({
      lang: article.lang,
      slug: article.slug,
      format: article.format
    });
    const ogImagePath = `/${article.lang}/${article.slug}/opengraph-image`;

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

    const description = resolveMetaDescription(article);

    return {
      title: `${article.frontmatter.title} | Every One Should See This`,
      description,
      openGraph: {
        title: article.frontmatter.title,
        description,
        type: "article",
        url: articlePath,
        images: [
          {
            url: ogImagePath,
            width: 1200,
            height: 630,
            alt: `${article.frontmatter.title} preview`
          }
        ]
      },
      twitter: {
        card: "summary_large_image",
        title: article.frontmatter.title,
        description,
        images: [ogImagePath]
      },
      alternates: {
        canonical: articlePath,
        languages: languageAlternates
      }
    };
  } catch (error) {
    console.error("Failed to generate article metadata", {
      params: resolvedParams,
      error
    });
    return { title: "Every One Should See This" };
  }
}

export default async function ArticlePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  try {
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
    const preferredLanguage = findLanguageLabel(article.languages, article.lang);
    const llmPrompt = `explain this, personalise it to me based on what you know about me and change the language to ${preferredLanguage}. ${originalArticleUrl}`;
    const encodedLlmPrompt = encodeURIComponent(llmPrompt);
    const chatGptLink = `https://chatgpt.com/?q=${encodedLlmPrompt}`;
    const claudeLink = `https://claude.ai/new?q=${encodedLlmPrompt}`;
    const geminiLink = `https://gemini.google.com/app?q=${encodedLlmPrompt}`;

    return (
      <main className={`page articlePage ${isCompare ? "pageWide" : ""}`}>
      <header className="articleHeader">
        <h1 className="title">{article.frontmatter.title}</h1>

        <div className="articleMetaRow" aria-label="Article metadata">
          <p className="articleByline">
            {article.frontmatter.byline}
            {" • "}
            <a
              href={originalArticleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="originalLink"
            >
              Original
            </a>
          </p>

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

        <div className="aiChatRow" aria-label="Chat links">
          <a className="aiChatButton" href={chatGptLink} target="_blank" rel="noopener noreferrer">
            <span className="aiChatIcon" aria-hidden="true">
              <img
                src="/social-icons/ChatGPT_logo_light.svg"
                className="chatgpt-logo-light"
                alt=""
              />
              <img
                src="/social-icons/ChatGPT_logo_dark.svg"
                className="chatgpt-logo-dark"
                alt=""
              />
            </span>
            <span>ChatGPT</span>
          </a>

          <a className="aiChatButton" href={claudeLink} target="_blank" rel="noopener noreferrer">
            <span className="aiChatIcon" aria-hidden="true">
              <img src="/social-icons/Claude_logo_transparent.svg" alt="" />
            </span>
            <span>Claude</span>
          </a>

          <a className="aiChatButton" href={geminiLink} target="_blank" rel="noopener noreferrer">
            <span className="aiChatIcon" aria-hidden="true">
              <img src="/social-icons/Gemini_logo_transparent.svg" alt="" />
            </span>
            <span>Gemini</span>
          </a>
        </div>
      </header>

      <div className="tabsShell">
        <div className="tabsRow">
          <nav className="tabs" aria-label="Language tabs">
            {article.languages?.map((language) => {
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
          {article.formats?.map((format) => {
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
            <article className="article dualArticle">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {originalArticle.body}
              </ReactMarkdown>
            </article>
          </div>

          <div className="dualColumn">
            <p className="dualLabel">{findLanguageLabel(article.languages, article.lang)}</p>
            <article className="article dualArticle">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {article.body}
              </ReactMarkdown>
            </article>
          </div>
        </section>
      ) : (
        <article className="article">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {article.body}
          </ReactMarkdown>
        </article>
      )}

      <p className="credit">
        Original article:{" "}
        <a href={article.meta.sourceUrl} target="_blank" rel="noopener noreferrer">
          {article.meta.title}
        </a>{" "}
        by{" "}
        {article.meta.author?.xUrl ? (
          <a href={article.meta.author.xUrl} target="_blank" rel="noopener noreferrer">
            {article.meta.author.name}
          </a>
        ) : (
          article.meta.author?.name
        )}
        {" • "}
        {article.meta.publishedAt}
      </p>

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
      </main>
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      throw error;
    }

    console.error("Failed to render article page", {
      params: resolvedParams,
      searchParams: resolvedSearchParams,
      error
    });
    notFound();
  }
}
