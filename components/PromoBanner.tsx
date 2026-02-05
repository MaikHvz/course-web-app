"use client";

import React, { useState } from "react";
import { IconX } from "@tabler/icons-react";

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 text-center text-sm font-medium relative z-50 shadow-md flex justify-between items-center">
      <div className="flex-1 text-center overflow-hidden">
        <p className="animate-pulse-horizontal inline-block">
          🔥 Oferta en todos los cursos de introducción con un{" "}
          <span className="font-bold text-yellow-300">30% de descuento</span>
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
        aria-label="Cerrar oferta"
      >
        <IconX size={16} className="text-white" />
      </button>
      <style jsx>{`
        @keyframes pulse-horizontal {
          0%, 100% {
            transform: translateX(-5px);
          }
          50% {
            transform: translateX(5px);
          }
        }
        .animate-pulse-horizontal {
          animation: pulse-horizontal 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
