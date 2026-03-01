import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <IconArrowLeft size={20} />
        <span>Volver al inicio</span>
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-black text-white tracking-tight">Zona Elite</h1>
          </Link>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
          {children}
        </div>
      </div>
      
    </div>
  );
}
