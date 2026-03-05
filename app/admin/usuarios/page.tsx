"use client";

import { useState, useEffect } from "react";
import { Profile } from "@/lib/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { IconSearch, IconUserEdit, IconMailForward, IconGift, IconLoader2 } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setProfiles(data as Profile[]);
      }
      setIsLoading(false);
    };

    fetchProfiles();
  }, [supabase]);

  const columns: Column<Profile>[] = [
    { 
      key: "name", 
      header: "Usuario",
      render: (user) => {
        const fullName = user.name || 'Sin nombre';
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400 text-sm">
              {fullName.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white">{fullName}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          </div>
        );
      }
    },
    { 
      key: "role", 
      header: "Rol",
      render: (user) => (
        <Badge variant={user.role === 'admin' ? "destructive" : "secondary"} className="uppercase text-[10px]">
          {user.role}
        </Badge>
      )
    },
    { 
      key: "created_at", 
      header: "Registro",
      render: (user) => (
        <span className="text-gray-400 text-sm">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      )
    },
    { 
      key: "actions", 
      header: "Acciones",
      render: (user) => (
        <div className="flex items-center gap-2">
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded transition-colors" title="Editar">
            <IconUserEdit size={16} />
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded transition-colors" title="Regalar Curso">
            <IconGift size={16} />
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded transition-colors" title="Enviar Email">
            <IconMailForward size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-400">Administra alumnos y administradores de la plataforma.</p>
      </div>
      
      <div className="flex justify-between items-center gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..."
            maxLength={100}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
          />
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        
        <div className="flex gap-2">
          <select className="bg-gray-950 border border-gray-800 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-blue-500 text-sm">
            <option value="all">Todos los roles</option>
            <option value="user">Alumno</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
          <IconLoader2 size={48} className="animate-spin text-red-500 mb-4" />
          <p className="text-xl">Cargando usuarios...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={profiles} 
        />
      )}
    </div>
  );
}
