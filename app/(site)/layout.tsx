"use client"
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  IconHome, 
  IconUser, 
  IconSettings, 
  IconMenu2, 
  IconX, 
  IconLogin, 
  IconChevronDown, 
  IconLogout, 
  IconVideo, 
  IconShieldLock 
} from "@tabler/icons-react";
import PromoBanner from "../../components/PromoBanner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    handleResize();

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        setProfile(profileData);
      }
      setIsLoadingSession(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setIsLoadingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const menuItems = [
    { icon: <IconHome size={24} />, label: "Inicio", href: "/" },
    { icon: <IconUser size={24} />, label: "Cursos", href: "/cursos" },
    { icon: <IconSettings size={24} />, label: "Ajustes", href: "/settings" },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full bg-gray-900">
      <PromoBanner />
      
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-700 sticky top-0 z-30 overflow-hidden min-w-0 w-full">
        <span className="text-xl font-bold truncate">Zona Elite</span>
        <div className="flex items-center gap-3">
          {isLoadingSession ? (
            <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
          ) : !user ? (
            <Link href="/login" className="px-3 py-1.5 text-sm font-medium bg-blue-600 rounded flex-shrink-0 hover:bg-blue-500">
              Ingresar
            </Link>
          ) : (
            <button 
              onClick={() => setOpen(true)}
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs"
            >
              {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
            </button>
          )}
          <button 
            onClick={() => setOpen(true)} 
            className="p-2 rounded hover:bg-gray-800 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <IconMenu2 size={24} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 w-full min-w-0 relative">
        {/* Overlay for mobile */}
        {open && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed left-0 top-0 z-50 h-[100dvh] bg-gray-900 text-white transition-all duration-300 flex flex-col border-r border-gray-700
            ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            md:translate-x-0 md:sticky md:top-0 md:shadow-none
            ${open ? "md:w-64" : "md:w-20"}
            w-64
          `}
        >
          <div className={`flex items-center p-4 min-h-[64px] ${open ? "justify-between" : "justify-center"}`}>
            <span className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ${open ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
              Zona Elite
            </span>
            <button 
              onClick={() => setOpen(!open)} 
              className="p-1 rounded hover:bg-gray-700" 
              aria-label="Toggle sidebar"
            >
              {open ? <IconX size={24} /> : <IconMenu2 size={24} />}
            </button>
          </div>

          <nav className="flex-1 flex flex-col p-2 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center p-2 rounded transition-all duration-200 whitespace-nowrap ${open ? "gap-4 justify-start" : "justify-center"} ${isActive ? "bg-blue-600 text-white border-l-4 border-blue-400" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className={`transition-all duration-300 overflow-hidden ${open ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Sidebar Footer */}
          <div className="p-4 border-t border-gray-700 mt-auto">
            {isLoadingSession ? (
              <div className={`flex items-center p-2 rounded bg-gray-800 animate-pulse ${open ? "gap-4" : "justify-center"}`}>
                <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0" />
                {open && <div className="h-4 bg-gray-700 rounded w-24" />}
              </div>
            ) : !user ? (
              <Link
                href="/login"
                className={`flex items-center p-2 rounded transition-all duration-200 whitespace-nowrap bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 hover:text-blue-300 ${open ? "gap-4 justify-start" : "justify-center"}`}
              >
                <span className="flex-shrink-0"><IconLogin size={24} /></span>
                <span className={`transition-all duration-300 overflow-hidden ${open ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>Iniciar Sesión</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center p-2 rounded transition-all duration-200 bg-gray-800 border border-gray-700 hover:bg-gray-750 ${open ? "gap-3 justify-start" : "justify-center"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  {open && (
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-bold truncate">{profile?.name || 'Usuario'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{profile?.role || 'user'}</p>
                    </div>
                  )}
                  {open && <IconChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />}
                </button>

                {isDropdownOpen && (
                  <div className={`absolute bottom-full left-0 w-full mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 ${!open && "fixed left-20 w-48 mb-0"}`}>
                    <Link 
                      href="/mis-cursos"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 p-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700"
                    >
                      <IconVideo size={18} />
                      <span>Panel Usuario</span>
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link 
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 p-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700"
                      >
                        <IconShieldLock size={18} />
                        <span>Panel Admin</span>
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <IconLogout size={18} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out bg-gray-900`}>
          {children}
        </main>
      </div>
    </div>
  );
}
