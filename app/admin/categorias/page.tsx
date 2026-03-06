"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Category } from "@/lib/types";
import { 
  IconPlus, 
  IconTrash, 
  IconEdit, 
  IconLoader2, 
  IconCategory,
  IconSearch
} from "@tabler/icons-react";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createSupabaseBrowserClient();

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    
    if (!error && data) {
      setCategories(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${name}"? Los cursos asociados se quedarán sin categoría.`)) {
      return;
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar la categoría: " + error.message);
    } else {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Categorías</h1>
          <p className="text-gray-400 mt-1">Gestiona las clasificaciones de tus cursos.</p>
        </div>
        <Link 
          href="/admin/categorias/nuevo"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          <IconPlus size={20} />
          Nueva Categoría
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="relative max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold">Creada</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <IconLoader2 className="animate-spin text-blue-500 mx-auto mb-4" size={32} />
                    <p className="text-gray-500">Cargando categorías...</p>
                  </td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-blue-400">
                          <IconCategory size={20} />
                        </div>
                        <span className="font-bold text-white text-base">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-gray-500 bg-gray-950 px-2 py-1 rounded">{cat.id.split('-')[0]}...</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(cat.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/categorias/${cat.id}/editar`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                          title="Editar"
                        >
                          <IconEdit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-gray-500">No se encontraron categorías.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
