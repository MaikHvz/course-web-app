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

    
    try {
      const res = await fetch("/api/webpay/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      // Handle Unauthorized (Not Logged In)
      if (res.status === 401) {
        setIsLoading(false);
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      const data = await res.json();


      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pedido");
      }

      // Si es un curso gratis
      if (data.success && !data.url) {
        setIsSuccess(true);
        setTimeout(() => {
          if (redirectTo) {
            window.location.href = redirectTo; 
          } else {
            window.location.reload();
          }
        }, 1000);
        return;
      }

      // Flujo de pago Webpay Plus
      if (data.url && data.token) {
        const form = document.createElement("form");
        form.action = data.url;
        form.method = "POST";
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "token_ws";
        input.value = data.token;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      }

    } catch (error: any) {
      console.error("Purchase error detailed:", error);
      alert(error.message || "Error inesperado al intentar inicializar el pago");
      setIsLoading(false); 
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
