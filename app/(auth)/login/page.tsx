"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { IconBrandGoogle } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/mis-cursos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }

    // Redirect to the provided path or default dashboard
    router.push(redirectTo);
    router.refresh(); 
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Ingresar a tu cuenta</h2>
      
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-lg mb-4">
          {errorMsg}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input 
            id="email"
            type="email" 
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
            <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input 
            id="password"
            type="password" 
            required
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="my-6 flex items-center before:flex-1 before:border-t before:border-gray-700 after:flex-1 after:border-t after:border-gray-700">
        <span className="px-3 text-sm text-gray-500">o continuar con</span>
      </div>

      <button 
        type="button"
        onClick={handleGoogleLogin}
        className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <IconBrandGoogle size={20} />
        <span>Google</span>
      </button>

      <p className="mt-8 text-center text-gray-400 text-sm">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
          Registrate acá
        </Link>
      </p>
    </>
  );
}
