"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconCheck, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";
import { Category } from "@/lib/types";

interface CategoryFormProps {
  initialData?: Partial<Category>;
  mode: "create" | "edit";
}

export default function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [name, setName] = useState(initialData?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setErrorMsg("");

    try {
      let error;
      if (mode === "create") {
        const result = await supabase.from("categories").insert([{ name: name.trim() }]);
        error = result.error;
      } else {
        const result = await supabase
          .from("categories")
          .update({ name: name.trim() })
          .eq("id", initialData!.id!);
        error = result.error;
      }

      if (error) throw error;

      router.push("/admin/categorias");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar la categoría");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {mode === "create" ? "Nueva Categoría" : "Editar Categoría"}
        </h2>

        {errorMsg && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            <IconAlertTriangle size={18} className="shrink-0" />
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Nombre de la Categoría
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Yoga, Nutrición, etc."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/categorias")}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || !name.trim()}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <IconLoader2 size={18} className="animate-spin" />
            ) : (
              <IconCheck size={18} />
            )}
            {mode === "create" ? "Crear Categoría" : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
