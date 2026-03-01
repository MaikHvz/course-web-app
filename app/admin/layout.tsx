"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  IconLayoutDashboard, 
  IconVideo, 
  IconRoute, 
  IconCalendarStar, 
  IconTags, 
  IconUsers, 
  IconMenu2, 
  IconX, 
  IconLogout,
  IconShieldLock,
  IconTrophy
} from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        
        if (!profileData || profileData.role !== 'admin') {
          router.push('/');
          return;
        }
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
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Verificando credenciales admin...</p>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: <IconLayoutDashboard size={20} />, exact: true },
    { label: "Cursos", href: "/admin/cursos", icon: <IconVideo size={20} /> },
    { label: "Rutas", href: "/admin/rutas", icon: <IconRoute size={20} /> },
    { label: "Suscripciones", href: "/admin/suscripciones", icon: <IconCalendarStar size={20} /> },
    { label: "Descuentos", href: "/admin/descuentos", icon: <IconTags size={20} /> },
    { label: "Usuarios", href: "/admin/usuarios", icon: <IconUsers size={20} /> },
    { label: "Logros", href: "/admin/logros", icon: <IconTrophy size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <IconShieldLock className="text-red-500" size={24} />
          <span className="text-xl font-bold text-white">Panel Admin</span>
        </div>
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
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <IconShieldLock className="text-red-500" size={28} />
            <h2 className="text-2xl font-black text-white">Admin</h2>
          </div>
          <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
            <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center text-red-500 font-bold text-xs ring-1 ring-red-500/50">
              {profile?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{profile?.name || 'Z-Admin Master'}</p>
              <p className="text-[10px] text-gray-500 truncate">{profile?.email || 'admin@zona-elite.com'}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
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
                    ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20" 
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
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
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-gray-900"
          >
            <IconLogout size={20} />
            <span>Salir del Panel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 bg-gray-950 text-white">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}
