import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_ROOT = path.join(process.cwd(), "content", "articles");

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) {
    return { frontmatter: {}, body: raw.trim() };
  }

  const closingIndex = raw.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return { frontmatter: {}, body: raw.trim() };
  }

  const frontmatterBlock = raw.slice(4, closingIndex);
  const body = raw.slice(closingIndex + 5).trim();
  const frontmatter = {};

  for (const line of frontmatterBlock.split("\n")) {
    if (!line.trim()) continue;

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    let value = rawValue;
    try {
      value = JSON.parse(rawValue);
    } catch {
      if (
        (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'"))
      ) {
        value = rawValue.slice(1, -1);
      }
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

export function parseMdxBlocks(body) {
  const chunks = body
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk) => {
    if (/^#{1,6}\s+/.test(chunk)) {
      const headingMatch = chunk.match(/^(#{1,6})\s+([\s\S]*)$/);
      const level = headingMatch[1].length;
      return {
        type: "heading",
        level,
        text: headingMatch[2].trim()
      };
    }

    const lines = chunk.split("\n");

    if (lines.every((line) => line.startsWith(">"))) {
      return {
        type: "quote",
        text: lines.map((line) => line.replace(/^>\s?/, "")).join("\n")
      };
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return {
        type: "unordered-list",
        items: lines.map((line) => line.replace(/^[-*]\s+/, "").trim())
      };
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      return {
        type: "ordered-list",
        items: lines.map((line) => line.replace(/^\d+\.\s+/, "").trim())
      };
    }

    return { type: "paragraph", text: chunk };
  });
}

async function listArticleSlugs() {
  const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function getArticleMeta(slug) {
  const metaPath = path.join(CONTENT_ROOT, slug, "meta.json");
  if (!(await pathExists(metaPath))) return null;
  return readJsonFile(metaPath);
}

async function resolveArticleFile({ slug, meta, lang, format }) {
  const availableLanguageCodes = new Set(meta.languages.map((language) => language.code));
  const resolvedLang = availableLanguageCodes.has(lang) ? lang : meta.defaultLanguage;

  const formatSet = new Set(meta.availableFormats);
  let resolvedFormat = formatSet.has(format) ? format : "full";

  let filePath = path.join(CONTENT_ROOT, slug, resolvedLang, `${resolvedFormat}.mdx`);
  if (await pathExists(filePath)) {
    return { filePath, lang: resolvedLang, format: resolvedFormat };
  }

  resolvedFormat = "full";
  filePath = path.join(CONTENT_ROOT, slug, resolvedLang, `${resolvedFormat}.mdx`);
  if (await pathExists(filePath)) {
    return { filePath, lang: resolvedLang, format: resolvedFormat };
  }

  filePath = path.join(CONTENT_ROOT, slug, meta.defaultLanguage, "full.mdx");
  if (await pathExists(filePath)) {
    return { filePath, lang: meta.defaultLanguage, format: "full" };
  }

  return null;
}

export function getArticlePath({ lang, slug, format = "full" }) {
  if (format === "full") {
    return `/${lang}/${slug}`;
  }
  return `/${lang}/${slug}/${format}`;
}

export async function listArticlesIndex() {
  const slugs = await listArticleSlugs();
  const records = await Promise.all(
    slugs.map(async (slug) => {
      const meta = await getArticleMeta(slug);
      if (!meta) return null;
      return {
        slug,
        ...meta,
        defaultPath: getArticlePath({
          lang: meta.defaultLanguage,
          slug,
          format: "full"
        })
      };
    })
  );

  return records
    .filter(Boolean)
    .sort((a, b) => `${b.publishedAt}`.localeCompare(`${a.publishedAt}`));
}

export async function getArticleDocument({ slug, lang, format = "full" }) {
  const meta = await getArticleMeta(slug);
  if (!meta) return null;

  const resolved = await resolveArticleFile({ slug, meta, lang, format });
  if (!resolved) return null;

  const raw = await fs.readFile(resolved.filePath, "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);

  return {
    slug,
    meta,
    lang: resolved.lang,
    format: resolved.format,
    frontmatter,
    body,
    blocks: parseMdxBlocks(body),
    languages: meta.languages,
    formats: meta.availableFormats
  };
}

export async function listStaticArticleParams() {
  const slugs = await listArticleSlugs();
  const params = [];

  for (const slug of slugs) {
    const meta = await getArticleMeta(slug);
    if (!meta) continue;

    for (const language of meta.languages) {
      params.push({ lang: language.code, slug });

      for (const format of meta.availableFormats) {
        if (format === "full") continue;
        params.push({ lang: language.code, slug, format: [format] });
      }
    }
  }

  return params;
}
