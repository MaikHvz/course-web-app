"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SubscriptionPlan } from "@/lib/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { IconPlus, IconEdit, IconTrash, IconPower, IconLoader2 } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [metrics, setMetrics] = useState({ activeSubscribers: 0, mrr: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      setIsLoading(true);
      
      // 1. Fetch Plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (plansData) {
        setPlans(plansData as SubscriptionPlan[]);
      }

      // 2. Fetch Metrics (Active subscribers and MRR)
      const { data: activeSubs } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('status', 'active');
      
      if (activeSubs && plansData) {
        const count = activeSubs.length;
        const totalMrr = activeSubs.reduce((acc, sub) => {
          const plan = plansData.find(p => p.id === sub.plan_id);
          return acc + (plan?.price || 0);
        }, 0);
        setMetrics({ activeSubscribers: count, mrr: totalMrr });
      }

      setIsLoading(false);
    };

    fetchSubscriptionData();
  }, [supabase]);

  const columns: Column<SubscriptionPlan>[] = [
    { 
      key: "name", 
      header: "Plan",
      render: (plan) => (
        <span className="font-bold text-white">{plan.name}</span>
      )
    },
    { 
      key: "price", 
      header: "Precio",
      render: (plan) => (
        <span className="font-medium text-emerald-400">${plan.price}</span>
      )
    },
    { 
      key: "duration_days", 
      header: "Duración",
      render: (plan) => (
        <span className="text-gray-300">
          {plan.duration_days} días {plan.duration_days === 30 ? "(Mensual)" : plan.duration_days === 365 ? "(Anual)" : ""}
        </span>
      )
    },
    { 
      key: "is_active", 
      header: "Estado",
      render: (plan) => (
        <Badge variant={plan.is_active ? "success" : "secondary"}>
          {plan.is_active ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
    { 
      key: "actions", 
      header: "Acciones",
      render: (plan) => (
        <div className="flex items-center gap-2">
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded transition-colors" title="Editar">
            <IconEdit size={16} />
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded transition-colors" title={plan.is_active ? "Desactivar" : "Activar"}>
            <IconPower size={16} />
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
          <h1 className="text-3xl font-black text-white mb-2">Planes de Suscripción</h1>
          <p className="text-gray-400">Administra los planes y precios disponibles para tus alumnos.</p>
        </div>
        
        <button 
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus size={20} />
          <span>Nuevo Plan</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
          <IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <p className="text-xl">Cargando planes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Active Subscribers quick view */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Métricas Rápidas</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Suscriptores Activos</p>
                <div className="text-3xl font-black text-blue-400">{metrics.activeSubscribers}</div>
              </div>
              <div className="w-full h-px bg-gray-800 my-4" />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">MRR Estimado</p>
                <div className="text-3xl font-black text-emerald-400">${metrics.mrr.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Ingreso Mensual Recurrente</p>
              </div>
            </div>
          </div>

          {/* Plans Table */}
          <div className="lg:col-span-3">
            <DataTable 
              columns={columns} 
              data={plans} 
            />
          </div>

        </div>
      )}
    </div>
  );
}
