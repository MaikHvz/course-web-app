"use client";

import { useState, useEffect } from "react";

interface TypingTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  endIcon?: React.ReactNode; // icono que aparece al final
  className?: string;
}

export default function TypingText({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1000,
  endIcon,
  className = "",
}: TypingTextProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // escribiendo
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // frase completa, esperar antes de borrar
        timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      }
    } else {
      // borrando
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseTime]);

  const isComplete = displayText === texts[textIndex];

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {displayText}
      {/* Icono aparece solo al final de la frase */}
      {isComplete && endIcon && <span className="inline-block">{endIcon}</span>}
      <span className="animate-pulse">|</span>
    </span>
  );
}
