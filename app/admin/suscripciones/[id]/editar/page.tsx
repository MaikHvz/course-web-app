"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import SubscriptionPlanForm from "../../_components/SubscriptionPlanForm";
import { SubscriptionPlan, Course } from "@/lib/types";

export default function EditSubscriptionPlanPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        if (!id) return;
        
        // 1. Get Plan Data
        const { data: planData, error: planError } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", id as string)
          .single();
          
        if (planError) throw planError;
        
        // 2. Get Associated Courses
        const { data: courseLinks, error: linksError } = await supabase
          .from("subscription_plan_courses")
          .select("course_id")
          .eq("plan_id", id as string);
          
        if (linksError) throw linksError;

        setPlan({
          ...planData,
          courses: courseLinks.map((link: any) => ({ id: link.course_id } as Course))
        } as SubscriptionPlan);

      } catch (err: any) {
        setErrorMsg(err.message || "Error al cargar el plan.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-400">
        <IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <p>Cargando información del plan...</p>
      </div>
    );
  }

  if (errorMsg || !plan) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-2xl mx-auto">
        <IconAlertTriangle size={48} className="mb-4" />
        <p>{errorMsg || "Plan no encontrado."}</p>
        <Link href="/admin/suscripciones" className="mt-6 text-blue-400 underline hover:text-white transition-colors">
          Volver a planes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/suscripciones"
          className="p-2 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-colors"
        >
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Editar Plan</h1>
          <p className="text-gray-400">Modificando <span className="text-white font-medium">{plan.name}</span>.</p>
        </div>
      </div>

      <SubscriptionPlanForm mode="edit" initialData={plan} />
    </div>
  );
}
