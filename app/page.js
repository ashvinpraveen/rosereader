import Link from "next/link";
import { listArticlesIndex } from "../lib/content";

export const metadata = {
  title: "Every One Should See This",
  description: "One important article, translated clearly."
};

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default async function HomePage() {
  const articles = await listArticlesIndex();
  const article = articles[0];

  if (!article) {
    return (
      <main className="page homePage">
        <section className="homeIntro">
          <p className="homeBadge">everyoneshouldseethis.com</p>
          <h1 className="heroTitle">No article published yet.</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="page homePage">
      <section className="homeIntro">
        <p className="homeBadge">everyoneshouldseethis.com</p>
        <h1 className="heroTitle">Important writing, translated for everyone.</h1>
        <p className="heroLead">
          Read high-impact articles in multiple languages and formats. Share one link,
          and people can switch to the version they understand best.
        </p>
      </section>

      <section className="homeMessage" aria-label="Site message">
        <p className="homeMessageParagraph">
          Dear reader -
        </p>
        <p className="homeMessageParagraph">
          A lot of the world&apos;s best ideas are still written in English. That&apos;s an accident of
          history, not a rule of nature.
        </p>
        <p className="homeMessageParagraph">
          With the rate AI is progressing, we can translate the writing that matters and
          share it with everyone globally. This project is my attempt at that: one link,
          many languages and formats.
        </p>
        <p className="homeMessageParagraph">
          Full credit always goes to the original authors. If anything here causes an
          issue, just drop feedback - I&apos;m happy to take it down. And if you&apos;re an
          author, feel free to take the translated copies too.
        </p>
        <p className="homeMessageParagraph">
          Translations are done by GPT-5.2 and reviewed by human reviewers. The goal is
          simple: make these ideas accessible to the world, in all languages.
        </p>
        <p className="homeMessageSignature">- Ashvin</p>
      </section>

      <section className="focusSection" id="article" aria-label="Current article">
        <article className="focusCard">
          <p className="focusKicker">Current read</p>
          <h2 className="focusTitle">
            <Link href={article.defaultPath}>{article.title}</Link>
          </h2>
          <p className="focusMeta">
            By{" "}
            {article.author?.xUrl ? (
              <a className="authorLink" href={article.author.xUrl} target="_blank" rel="noopener noreferrer">
                {article.author.name}
              </a>
            ) : (
              article.author?.name
            )}{" "}
            • {formatDate(article.publishedAt)}
          </p>
          {article.previewText && <p className="focusPreview">{article.previewText}</p>}
          <p className="focusLanguages">
            Available in {article.languages.length} languages:{" "}
            {article.languages.map((language) => language.label).join(" • ")}
          </p>
          <div className="heroActions">
            <Link href={article.defaultPath} className="primaryButton">
              Read article
            </Link>
            {article.sourceUrl && (
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="secondaryButton">
                Original source
              </a>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
