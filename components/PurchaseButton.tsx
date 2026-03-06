"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconShoppingCart, IconLoader2, IconCheck } from "@tabler/icons-react";

interface PurchaseButtonProps {
  courseId: string;
  isFree?: boolean;
  className?: string;
  redirectTo?: string;
  text?: string;
}

export default function PurchaseButton({ 
  courseId, 
  isFree = false, 
  className = "", 
  redirectTo,
  text
}: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    if (isLoading) return;
    setIsLoading(true);
    console.log("Starting purchase for course:", courseId);
    
    try {
      const res = await fetch("/api/courses/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      // Handle Unauthorized (Not Logged In)
      if (res.status === 401) {
        console.log("User unauthorized, redirecting to login...");
        setIsLoading(false);
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      const data = await res.json();
      console.log("Purchase API Response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pedido");
      }

      setIsSuccess(true);
      
      // Delay to show success state before refreshing/redirecting
      setTimeout(() => {
        if (redirectTo) {
          console.log("Redirecting to:", redirectTo);
          window.location.href = redirectTo; // Force refresh on redirect
        } else {
          console.log("Forcing page reload");
          window.location.reload(); // Hard reload to ensure server component re-runs access check
        }
      }, 1000);

    } catch (error: any) {
      console.error("Purchase error detailed:", error);
      alert(error.message || "Error inesperado al procesar la compra");
      setIsLoading(false); // Only clear loading on error, on success it stays true while redirecting
    }
  };

  const defaultText = isFree ? "Obtener gratis" : "Comprar ahora";
  const buttonText = text || defaultText;

  if (isSuccess) {
    return (
      <button 
        disabled 
        className={`${className} bg-emerald-600 text-white opacity-90 cursor-default flex items-center justify-center gap-2`}
      >
        <IconCheck size={18} />
        ¡Desbloqueado!
      </button>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className={`${className} flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70`}
    >
      {isLoading ? (
        <IconLoader2 size={18} className="animate-spin" />
      ) : (
        <IconShoppingCart size={18} />
      )}
      {isLoading ? "Procesando..." : buttonText}
    </button>
  );
}
