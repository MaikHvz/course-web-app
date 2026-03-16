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
  const [showPricingUi, setShowPricingUi] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingGlobal, setIsTogglingGlobal] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      setIsLoading(true);
      
      // 1. Fetch Plans and Settings
      const [{ data: plansData }, { data: settingsData }] = await Promise.all([
        supabase.from('subscription_plans').select('*').order('price', { ascending: true }),
        supabase.from('platform_settings').select('value').eq('id', 'show_pricing_section').single()
      ]);
      
      if (settingsData) {
        setShowPricingUi(settingsData.value === 'true' || settingsData.value === true);
      }
      
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

  const handleToggleGlobalSubmit = async (currentState: boolean) => {
    setIsTogglingGlobal(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ id: 'show_pricing_section', value: !currentState });
      
      if (error) throw error;
      setShowPricingUi(!currentState);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la visibilidad pública.");
    } finally {
      setIsTogglingGlobal(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !currentState })
        .eq('id', id);
      
      if (error) throw error;
      setPlans(plans.map(p => p.id === id ? { ...p, is_active: !currentState } : p));
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el estado");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este plan?")) return;
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setPlans(plans.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el plan. Puede que haya suscripciones activas vinculadas.");
    }
  };

  const columns: Column<SubscriptionPlan>[] = [
    { 
      key: "name", 
      header: "Plan",
      render: (plan) => (
        <span className="font-bold text-white flex flex-col">
          {plan.name}
          <span className="text-xs text-gray-400 font-normal">
            {plan.plan_type === 'lifetime' ? 'Vitalicio' : 'Estándar'}
          </span>
        </span>
      )
    },
    { 
      key: "price", 
      header: "Precio",
      render: (plan) => (
        <span className="font-medium text-emerald-400">${plan.price.toLocaleString()}</span>
      )
    },
    { 
      key: "duration_days", 
      header: "Duración",
      render: (plan) => (
        <span className="text-gray-300">
          {plan.plan_type === 'lifetime' ? '∞ De por vida' : 
            `${plan.duration_days} días ${plan.duration_days === 30 ? "(Mensual)" : plan.duration_days === 90 ? "(Trimestral)" : plan.duration_days === 365 ? "(Anual)" : ""}`
          }
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
          <Link href={`/admin/suscripciones/${plan.id}/editar`} className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded transition-colors" title="Editar">
            <IconEdit size={16} />
          </Link>
          <button onClick={() => handleToggleActive(plan.id, plan.is_active)} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded transition-colors" title={plan.is_active ? "Desactivar" : "Activar"}>
            <IconPower size={16} />
          </button>
          <button onClick={() => handleDelete(plan.id)} className="p-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 rounded transition-colors" title="Eliminar">
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
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 p-2 rounded-xl">
            <span className="text-sm font-medium text-gray-400 pl-2">Mostrar en Portada:</span>
            <button
              onClick={() => handleToggleGlobalSubmit(showPricingUi)}
              disabled={isTogglingGlobal}
              className={`relative w-12 h-6 rounded-full transition-colors ${showPricingUi ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${showPricingUi ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <Link 
            href="/admin/suscripciones/nuevo"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shrink-0"
          >
            <IconPlus size={20} />
            <span>Nuevo Plan</span>
          </Link>
        </div>
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
