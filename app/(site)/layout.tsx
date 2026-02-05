"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconHome, IconUser, IconSettings } from "@tabler/icons-react";
import PromoBanner from "../../components/PromoBanner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  const sidebarWidth = open ? "w-64" : "w-20";

  const menuItems = [
    { icon: <IconHome size={24} />, label: "Inicio", href: "/" },
    { icon: <IconUser size={24} />, label: "Cursos", href: "/cursos" },
    { icon: <IconSettings size={24} />, label: "Ajustes", href: "/settings" },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <PromoBanner />
      
      <div className="flex flex-1 w-full relative">
        {/* Sidebar */}
        <aside className={`${sidebarWidth} sticky top-0 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col overflow-hidden border-r border-gray-700 z-10 flex-shrink-0`}>
          <div className={`flex items-center p-4 min-h-[64px] ${open ? "justify-between" : "justify-center"}`}>
            <span className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ${open ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
              Zona Elite
            </span>
            <button onClick={() => setOpen(!open)} className="p-1 rounded hover:bg-gray-700" aria-label="Toggle sidebar">☰</button>
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
        </aside>

        {/* Main */}
        <main className={`flex-1 transition-all duration-300 ease-in-out bg-gray-900`}>
          {children}
        </main>
      </div>
    </div>
  );
}
