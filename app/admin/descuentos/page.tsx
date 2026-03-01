"use client";

import { useState, useEffect } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { IconPlus, IconTrash, IconCopy, IconLoader2 } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchDiscounts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setDiscounts(data);
      }
      setIsLoading(false);
    };

    fetchDiscounts();
  }, [supabase]);

  const columns: Column<any>[] = [
    { 
      key: "code", 
      header: "Código",
      render: (d) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-white bg-gray-950 px-2 py-1 rounded border border-gray-800">{d.code}</span>
          <button className="text-gray-500 hover:text-blue-400 transition-colors" title="Copiar">
            <IconCopy size={16} />
          </button>
        </div>
      )
    },
    { 
      key: "value", 
      header: "Descuento",
      render: (d) => (
        <span className="font-medium text-emerald-400">
          {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}
        </span>
      )
    },
    { 
      key: "used_count", 
      header: "Usos",
      render: (d) => (
        <div className="flex flex-col gap-1 w-32">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{d.used_count || 0}</span>
            <span>{d.max_uses || '∞'}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: d.max_uses ? `${( (d.used_count || 0) / d.max_uses) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )
    },
    { 
      key: "is_active", 
      header: "Estado",
      render: (d) => (
        <Badge variant={d.is_active ? "success" : "secondary"}>
          {d.is_active ? "Activo" : "Agotado/Inactivo"}
        </Badge>
      )
    },
    { 
      key: "actions", 
      header: "Acciones",
      render: (d) => (
        <button className="p-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 rounded transition-colors" title="Eliminar">
          <IconTrash size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Códigos de Descuento</h1>
          <p className="text-gray-400">Crea promociones para cursos y suscripciones.</p>
        </div>
        
        <button 
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus size={20} />
          <span>Nuevo Cupón</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
          <IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <p className="text-xl">Cargando cupones...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={discounts} 
        />
      )}
    </div>
  );
}
