"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMail } from "@tabler/icons-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate sending email
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconMail size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Revisá tu email</h2>
        <p className="text-gray-400 mb-8">
          Te enviamos un enlace de recuperación a <strong>{email}</strong>. Si no lo ves, revisá la carpeta de spam.
        </p>
        <Link 
          href="/login" 
          className="w-full inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-lg border border-gray-700 transition-colors"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-2 text-center">Recuperar contraseña</h2>
      <p className="text-gray-400 text-center text-sm mb-8">
        Ingresá tu email y te enviaremos un enlace para restablecerla.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>

      <p className="mt-8 text-center text-gray-400 text-sm">
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          &larr; Volver al inicio de sesión
        </Link>
      </p>
    </>
  );
}
