import { ImageResponse } from "next/og";
import { getArticleDocument } from "../../../lib/content";

export const runtime = "nodejs";
export const alt = "Article preview card";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

function clampText(value, maxLength) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function stripMarkdown(text) {
  return text
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1")
    .replace(/[`*_>#~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractOpeningText(markdownBody) {
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

    const cleaned = stripMarkdown(block);
    if (cleaned) return cleaned;
  }

  return "";
}

function resolveSummaryText(article) {
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

  return extractOpeningText(article?.body);
}

function resolveAuthorText(article) {
  const byline = article?.frontmatter?.byline;
  if (typeof byline === "string" && byline.trim()) {
    return byline.split("•")[0].trim();
  }

  const authorName = article?.frontmatter?.author ?? article?.meta?.author?.name;
  if (typeof authorName === "string" && authorName.trim()) {
    return `By ${authorName.trim()}`;
  }

  return "";
}

export default async function OpenGraphImage({ params }) {
  const resolvedParams = await params;

  const article = await getArticleDocument({
    slug: resolvedParams.slug,
    lang: resolvedParams.lang,
    format: "full"
  });

  const title = clampText(
    article?.frontmatter?.title ?? article?.meta?.title ?? "Every One Should See This",
    120
  );
  const openingText = clampText(resolveSummaryText(article) || article?.meta?.previewText || "", 300);
  const authorText = clampText(resolveAuthorText(article), 90);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0f14",
          backgroundImage: "radial-gradient(rgba(90, 105, 138, 0.34) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          padding: 52
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 36,
            background: "rgba(13, 15, 20, 0.84)",
            border: "1px solid #2d3340",
            padding: "56px 60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 56
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: 860,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 22
            }}
          >
            {authorText ? (
              <div
                style={{
                  fontSize: 26,
                  lineHeight: 1.2,
                  color: "#8e97ab"
                }}
              >
                {authorText}
              </div>
            ) : null}

            <div
              style={{
                fontSize: 66,
                lineHeight: 1.05,
                color: "#f1f3f6",
                letterSpacing: -1.1,
                fontWeight: 700
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 31,
                lineHeight: 1.35,
                color: "#bac2d2"
              }}
            >
              {openingText}
            </div>
          </div>

          <div
            style={{
              width: 180,
              minWidth: 180,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 140,
              lineHeight: 1
            }}
          >
            🌹
          </div>
        </div>
      </div>
    ),
    size
  );
}
