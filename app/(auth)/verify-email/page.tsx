import Link from "next/link";
import { IconMailFast } from "@tabler/icons-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <IconMailFast size={32} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">Verificá tu email</h2>
      <p className="text-gray-400 mb-8 leading-relaxed">
        Acabamos de enviarte un correo de confirmación. 
        Por favor, hacé clic en el enlace seguro dentro del email para activar tu cuenta.
      </p>
      
      <div className="space-y-4">
        <Link 
          href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} 
          className="w-full inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors"
        >
          Ya lo verifiqué, ir a Login
        </Link>
      </div>
    </div>
  );
}
