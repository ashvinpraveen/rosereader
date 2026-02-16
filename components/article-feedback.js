"use client";

import { useMemo, useRef, useState } from "react";

function formatLabel(format) {
  if (!format) return "";
  return format.charAt(0).toUpperCase() + format.slice(1);
}

function normalizeWhatsappNumber(raw) {
  if (!raw) return "";
  return String(raw).replace(/[^\d]/g, "");
}

function buildWhatsAppUrl({ phone, text }) {
  const normalized = normalizeWhatsappNumber(phone);
  if (!normalized) return "";
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

function findLanguageLabel(languages, code) {
  return languages.find((language) => language.code === code)?.label ?? code;
}

function buildFeedbackMessage({
  articleTitle,
  slug,
  versionLang,
  versionFormat,
  languages,
  url,
  quickPick,
  details
}) {
  const languageLabel = findLanguageLabel(languages, versionLang);
  const formatText = versionFormat ? ` · ${formatLabel(versionFormat)}` : "";
  const quickPickLine = quickPick ? `Quick pick: ${quickPick}\n` : "";
  const detailsText = details?.trim() ? details.trim() : "(no details)";

  return [
    "Feedback",
    url ? `From page: ${url}` : null,
    `Article: ${articleTitle}`,
    `Slug: ${slug}`,
    `Version: ${languageLabel}${formatText}`,
    "",
    quickPickLine.trimEnd(),
    "Message:",
    detailsText
  ]
    .filter((line) => line !== null)
    .join("\n");
}

const QUICK_PICKS = [
  { label: "Typo", template: "Typo:\n" },
  { label: "Translation issue", template: "Translation issue:\n" },
  { label: "Formatting issue", template: "Formatting issue:\n" },
  { label: "Suggestion", template: "Suggestion:\n" }
];

export default function ArticleFeedbackDialog({
  articleTitle,
  slug,
  currentLang,
  currentFormat,
  languages,
  formats,
  whatsappNumber
}) {
  const dialogRef = useRef(null);
  const [selectedVersion, setSelectedVersion] = useState(
    `${currentLang}:${currentFormat ?? "full"}`
  );
  const [quickPick, setQuickPick] = useState("");
  const [details, setDetails] = useState("");

  const versionOptions = useMemo(() => {
    const safeFormats = Array.isArray(formats) && formats.length > 0 ? formats : ["full"];
    const safeLanguages = Array.isArray(languages) ? languages : [];

    const options = [];
    for (const language of safeLanguages) {
      for (const format of safeFormats) {
        options.push({
          value: `${language.code}:${format}`,
          label: `${language.label} · ${formatLabel(format)}`
        });
      }
    }

    return options;
  }, [languages, formats]);

  const canSend = Boolean(normalizeWhatsappNumber(whatsappNumber));

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function onQuickPickSelect(pick) {
    setQuickPick(pick.label);
    setDetails((existing) => (existing.trim() ? existing : pick.template));
  }

  function onSubmit(event) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    const [versionLang, versionFormat] = selectedVersion.split(":");
    const url = window.location.href;

    const message = buildFeedbackMessage({
      articleTitle,
      slug,
      versionLang,
      versionFormat,
      languages,
      url,
      quickPick,
      details
    });

    const waUrl = buildWhatsAppUrl({ phone: whatsappNumber, text: message });
    if (!waUrl) {
      return;
    }

    closeDialog();
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <button type="button" className="followButton" onClick={openDialog}>
        <span className="followIcon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "100%", height: "100%" }}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span>Give translation feedback</span>
      </button>

      <dialog ref={dialogRef} className="feedbackDialog" aria-labelledby="feedbackTitle">
        <form className="feedbackDialogInner" onSubmit={onSubmit}>
          <div className="feedbackDialogHeader">
            <div>
              <h2 id="feedbackTitle" className="feedbackDialogTitle">
                Send feedback
              </h2>
              <p className="feedbackDialogSubtitle">
                This opens WhatsApp with a pre-filled message.
              </p>
            </div>
            <button type="button" className="feedbackClose" onClick={closeDialog}>
              ✕
            </button>
          </div>

          <div className="feedbackField">
            <label className="feedbackLabel" htmlFor="feedbackVersion">
              Version
            </label>
            <select
              id="feedbackVersion"
              className="feedbackSelect"
              value={selectedVersion}
              onChange={(event) => setSelectedVersion(event.target.value)}
            >
              {versionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="feedbackField">
            <p className="feedbackLabel" id="feedbackQuickPick">
              Quick picks
            </p>
            <div className="feedbackQuickRow" role="group" aria-labelledby="feedbackQuickPick">
              {QUICK_PICKS.map((pick) => {
                const active = pick.label === quickPick;
                return (
                  <button
                    key={pick.label}
                    type="button"
                    className={`feedbackQuickButton ${active ? "feedbackQuickButtonActive" : ""}`}
                    onClick={() => onQuickPickSelect(pick)}
                  >
                    {pick.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="feedbackField">
            <label className="feedbackLabel" htmlFor="feedbackDetails">
              Feedback
            </label>
            <textarea
              id="feedbackDetails"
              className="feedbackTextarea"
              placeholder="What should I fix or improve?"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={6}
            />
          </div>

          {!canSend ? (
            <p className="feedbackConfigWarning">
              WhatsApp feedback is not configured. Set{" "}
              <code>NEXT_PUBLIC_WHATSAPP_FEEDBACK_NUMBER</code>.
            </p>
          ) : null}

          <div className="feedbackActions">
            <button type="button" className="feedbackCancel" onClick={closeDialog}>
              Cancel
            </button>
            <button type="submit" className="feedbackSend" disabled={!canSend}>
              Send via WhatsApp
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
