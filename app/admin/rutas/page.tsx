"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { IconPlus, IconEdit, IconTrash, IconRoute, IconLoader2 } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchPaths = async () => {
      setIsLoading(true);
      
      // Fetch paths and their courses count
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          learning_path_courses(count)
        `)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setPaths(data.map(p => ({
          ...p,
          courses_count: p.learning_path_courses?.[0]?.count || 0,
          enrolled: 0 // Placeholder for now or could be calculated if we had registrations for paths
        })));
      }
      setIsLoading(false);
    };

    fetchPaths();
  }, [supabase]);

  const columns: Column<any>[] = [
    { 
      key: "title", 
      header: "Ruta de Aprendizaje",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-lg text-blue-400">
            <IconRoute size={20} />
          </div>
          <span className="font-bold text-white">{p.title}</span>
        </div>
      )
    },
    { 
      key: "courses_count", 
      header: "Cursos",
      render: (p) => (
        <span className="text-gray-300 font-medium">
          {p.courses_count} cursos
        </span>
      )
    },
    { 
      key: "enrolled", 
      header: "Alumnos en ruta",
      render: (p) => (
        <span className="text-gray-300">
          {p.enrolled}
        </span>
      )
    },
    { 
      key: "is_published", 
      header: "Estado",
      render: (p) => (
        <Badge variant={p.is_published ? "success" : "secondary"}>
          {p.is_published ? "Publicada" : "Borrador"}
        </Badge>
      )
    },
    { 
      key: "actions", 
      header: "Acciones",
      render: (p) => (
        <div className="flex items-center gap-2">
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded transition-colors" title="Editar Ruta">
            <IconEdit size={16} />
          </button>
          <button className="p-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 rounded transition-colors" title="Eliminar">
            <IconTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Rutas de Aprendizaje</h1>
          <p className="text-gray-400">Agrupa cursos en rutas lógicas para guiar a los alumnos.</p>
        </div>
        
        <button 
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus size={20} />
          <span>Nueva Ruta</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
          <IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <p className="text-xl">Cargando rutas...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={paths} 
          emptyMessage="No hay rutas creadas."
        />
      )}
    </div>
  );
}
