"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconHome, IconVideo, IconTrophy, IconUserCircle, IconMenu2, IconX, IconLogout } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setProfile(profileData);
        setIsLoading(false);
      } else {
        router.push('/login');
      }
    };

    fetchProfile();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Cargando tu panel...</p>
      </div>
    );
  }

  const navItems = [
    { label: "Volver a Inicio", href: "/", icon: <IconHome size={20} />, exact: true },
    { label: "Mis Cursos", href: "/mis-cursos", icon: <IconVideo size={20} /> },
    { label: "Mis Logros", href: "/logros", icon: <IconTrophy size={20} /> },
    { label: "Mi Perfil", href: "/perfil", icon: <IconUserCircle size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <span className="text-xl font-bold text-white">Mi Dashboard</span>
        <button onClick={() => setOpen(!open)} className="text-gray-300 hover:text-white p-1">
          {open ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black text-white px-2">Zona Elite</h2>
          <div className="mt-6 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate w-32">{profile?.name || 'Cargando...'}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role || 'user'}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
              
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors text-red-400 hover:bg-red-950/30"
          >
            <IconLogout size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 bg-gray-950">
        <div className="max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}
