# rosereader

Rosereader is the Rosetta stone of the internet age. It translates great articles online into multiple major and minor languages so the best ideas can reach more people. We use LLM's to translate into multiple languages and are community driven.

Many important ideas are first published in English. The goal of this project is to make those ideas accessible across borders by publishing one source article in many languages (and optional formats) under a single, shareable structure.

The product intent is simple:

- Democratize access to high-impact writing.
- Keep full credit and links to original authors.
- Make multilingual sharing easy: one link, many languages and formats.
- Offer a fast feedback loop so translation issues can be corrected.

Translations are generated with GPT models and reviewed by human reviewers continuously.

rosereader is open source, and contributors are welcome. If you want to add new high-impact articles or expand language coverage with more translations, contributions are encouraged.

If you're from a community that doesn't speak English natively, do share the articles that are relevant with your community too.

## What it does

- Serves article translations from local MDX files.
- Supports language tabs and format tabs per article.
- Supports side-by-side compare mode (`?compare=1`) against the default-language version.
- Includes one-click “explain this in my language” links for ChatGPT, Claude, and Gemini.
- Includes translation feedback via WhatsApp (configurable by env var).

## Tech stack

- Next.js App Router (`next@16`)
- React 18
- `react-markdown` + `remark-gfm` for MDX body rendering
- Vercel Analytics

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Production commands:

```bash
npm run build
npm start
```

## Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_WHATSAPP_FEEDBACK_NUMBER=<countrycode+number>
```

Used by the feedback dialog on article pages. If unset, feedback UI still renders but send action is disabled.

## Content model

All content lives under `content/articles/<slug>/`.

For each article slug:

1. Add `meta.json`
2. Add one folder per language code
3. Add `<format>.mdx` files in each language folder (`full.mdx` is required)

Example:

```text
content/articles/something-big-is-happening/
  meta.json
  en/full.mdx
  ms/full.mdx
  zh/full.mdx
  ...
```

### `meta.json` fields

- `id`: stable article identifier
- `slug`: URL slug
- `defaultLanguage`: language code used as canonical/original view
- `availableFormats`: list like `["full"]` or `["full","summary"]`
- `title`, `previewText`
- `author`: `{ name, xHandle, xUrl }`
- `publishedAt`
- `sourceUrl`
- `languages`: array of `{ code, label }`

### MDX frontmatter

Each `*.mdx` file may start with frontmatter. Current pages use:

- `title`
- `byline`
- `languageLabel` (optional for rendering, useful metadata)

Body content is rendered with GitHub-flavored Markdown support.

## URL patterns

- Home: `/`
- About: `/about`
- Article full format: `/<lang>/<slug>`
- Non-full format: `/<lang>/<slug>/<format>`

Resolution behavior (from `lib/content.js`):

- Unknown language falls back to `defaultLanguage`.
- Unknown format falls back to `full`.
- Missing requested file falls back to `defaultLanguage/full`.

Compare mode:

- Add `?compare=1` on non-default language article pages to show side-by-side original + translation.

## Project structure

```text
app/
  page.js                              # homepage
  about/page.js                        # about page
  [lang]/[slug]/[[...format]]/page.js # article page + metadata + compare mode
components/
  site-header.js
  site-footer.js
  theme-toggle.js
  article-feedback.js
content/
  articles/<slug>/<lang>/<format>.mdx
lib/
  content.js                           # article indexing/loading + path resolution
```

## Agent workflow (from `AGENTS.md`)

This repo is set up to work with Codex-style agents. Notable points:

- Skills available:
  - `skill-creator`: create/update a skill
  - `skill-installer`: install skills from curated list or GitHub
- Skill trigger rule: if a skill is explicitly named (or task clearly matches), the agent should load and follow that skill.
- Preferred repo search command: `rg` (and `rg --files`).
- Agent should avoid destructive git/file operations unless explicitly requested.

## License

MIT (`LICENSE`).
