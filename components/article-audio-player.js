"use client";

import { useState, useEffect, useRef } from "react";

export default function ArticleAudioPlayer({ title, body, lang = "en" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stripMarkdown = (text) => {
    return text
      .replace(/^---[\s\S]*?---/m, "")
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^>\s+/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const handlePlay = () => {
    if (!synthRef.current || !body) return;

    if (isPaused && utteranceRef.current) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    synthRef.current.cancel();

    const cleanText = stripMarkdown(body);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    const langMap = {
      en: "en-US",
      id: "id-ID",
      de: "de-DE",
      es: "es-ES",
      ar: "ar-SA"
    };

    utterance.lang = langMap[lang] || "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error("[v0] Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    synthRef.current.speak(utterance);
  };

  const handlePause = () => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="audioPlayerShell" aria-label="Article audio player">
      <div className="audioPlayerInner">
        <div className="audioPlayerText">
          <svg
            className="audioPlayerIcon"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3.5v13M6.5 7l3.5-3.5L13.5 7M4.5 16.5h11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="10"
              cy="10"
              r="7.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
          <span>Listen to this article</span>
        </div>

        <div className="audioPlayerControls">
          {!isPlaying && !isPaused && (
            <button
              onClick={handlePlay}
              className="audioPlayerButton audioPlayerButtonPrimary"
              aria-label="Play article"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M6.5 4.5l9 5.5-9 5.5z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {isPlaying && (
            <button
              onClick={handlePause}
              className="audioPlayerButton audioPlayerButtonPrimary"
              aria-label="Pause article"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="6" y="5" width="2.5" height="10" fill="currentColor" />
                <rect x="11.5" y="5" width="2.5" height="10" fill="currentColor" />
              </svg>
            </button>
          )}

          {isPaused && (
            <button
              onClick={handlePlay}
              className="audioPlayerButton audioPlayerButtonPrimary"
              aria-label="Resume article"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M6.5 4.5l9 5.5-9 5.5z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              className="audioPlayerButton"
              aria-label="Stop article"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect
                  x="6"
                  y="6"
                  width="8"
                  height="8"
                  fill="currentColor"
                  rx="1"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
