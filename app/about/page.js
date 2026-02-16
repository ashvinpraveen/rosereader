import Link from "next/link";

export const metadata = {
  title: "About",
  description: "Why this project exists and how to reach us."
};

export default function AboutPage() {
  return (
    <main className="page">
      <p className="breadcrumb">
        <Link href="/" className="breadcrumbLink">
          Home
        </Link>{" "}
        <span aria-hidden="true">/</span> About
      </p>

      <h1 className="title">About</h1>

      <section className="aboutBody">
        <p className="aboutLead">
          This is a small project to translate high-impact writing into as many languages and
          formats as possible — while keeping full credit with the original authors.
        </p>

        <p className="aboutParagraph">
          If you&apos;re an author and you&apos;d like a translation removed, just send feedback and
          we&apos;ll take it down. If you&apos;d like to reuse the translated copies, please do — they
          should be useful to you and your readers.
        </p>

        <p className="aboutParagraph">
          Translations are generated with GPT‑5.2 and reviewed by humans. The goal is simple: make
          the best ideas accessible to everyone, in every language.
        </p>
      </section>
    </main>
  );
}

