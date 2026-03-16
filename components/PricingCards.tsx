"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SubscriptionPlan } from "@/lib/types";
import { IconCheck, IconLoader2, IconSparkles, IconInfinity, IconCalendar, IconShield } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function PricingCards() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const { data: settings } = await supabase
          .from("platform_settings")
          .select("value")
          .eq("id", "show_pricing_section")
          .single();

        const showSection = settings?.value === "true" || settings?.value === true;
        if (!showSection) { setIsLoading(false); return; }
        setIsVisible(true);

        const { data: plansData } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true });

        if (plansData) setPlans(plansData as SubscriptionPlan[]);
      } catch (err) {
        console.error("Error loading pricing:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPricingData();
  }, [supabase]);

  const handleSubscribe = async (planId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?redirect=/`);
      return;
    }
    setPurchasing(planId);
    try {
      const res = await fetch("/api/webpay/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar pago");
      if (data.url && data.token) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.url;
        const input = document.createElement("input");
        input.type = "hidden"; input.name = "token_ws"; input.value = data.token;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      alert(err.message);
      setPurchasing(null);
    }
  };

  if (isLoading) return (
    <div className="w-full flex justify-center py-20">
      <IconLoader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  if (!isVisible || plans.length === 0) return null;

  return (
    <section className="relative w-full py-28 px-4 overflow-hidden bg-slate-950">
      
      {/* Section Header */}
      <div className="relative text-center max-w-2xl mx-auto mb-20">
        <span className="inline-block text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 bg-blue-950/60 px-4 py-1.5 rounded-full border border-blue-800">
          Membresías
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-5">
          Elige tu <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Plan Ideal</span>
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
          </span>
        </h2>
        <p className="text-gray-400 text-xl leading-relaxed">
          Acceso completo a nuestros cursos de alto nivel. Sin trucos, sin letra pequeña.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="relative flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
          const isLifetime = plan.plan_type === "lifetime";
          const duration = plan.plan_type === "lifetime" ? null : plan.duration_days;
          const isPurchasing = purchasing === plan.id;

          return (
            <div
              key={plan.id}
              className="relative flex flex-col w-full max-w-[380px] transition-all duration-300 hover:-translate-y-3"
            >
              {/* Outer glow for lifetime */}
              {isLifetime && (
                <>
                  <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 opacity-70 blur-md -z-10 animate-pulse" />
                  <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 -z-10" />
                </>
              )}

              <div className={`relative flex flex-col h-full rounded-[26px] overflow-hidden
                ${isLifetime
                  ? "bg-[#0d0d1a] border border-purple-900/40"
                  : "bg-[#1e2436] border border-slate-700"
                }
              `}>
                {/* Top badge */}
                {isLifetime && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
                )}

                <div className="p-8 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {isLifetime ? (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <IconInfinity size={16} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center">
                            <IconCalendar size={16} className="text-blue-600" />
                          </div>
                        )}
                        <h3 className="text-xl font-black text-white">
                          {plan.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        {plan.description || (isLifetime ? "Acceso vitalicio completo" : `Acceso por ${duration} días`)}
                      </p>
                    </div>

                    {isLifetime && (
                      <span className="shrink-0 flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full">
                        <IconSparkles size={12} /> VIP
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-8 pb-8 border-b border-dashed border-white/10">
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-black tracking-tight text-white">
                        ${plan.price.toLocaleString("es-CL")}
                      </span>
                    </div>
                    <span className="text-sm mt-1 block text-gray-400">
                      {isLifetime ? "Pago único — Acceso para siempre" : `CLP / válido por ${duration} días`}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!purchasing}
                    className={`w-full py-4 rounded-2xl font-bold text-base mb-8 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
                      ${isLifetime
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:brightness-110 text-white shadow-2xl shadow-purple-900/40"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
                      }
                    `}
                  >
                    {isPurchasing ? (
                      <><IconLoader2 size={18} className="animate-spin" /> Redirigiendo a pago...</>
                    ) : (
                      "Comenzar ahora →"
                    )}
                  </button>

                  {/* Features List */}
                  <div className="space-y-3 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-500">
                      Incluido:
                    </p>
                    <ul className="space-y-3">
                      {plan.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
                            ${isLifetime ? "bg-purple-500/20" : "bg-blue-900/30"}`}>
                            <IconCheck size={12} className={isLifetime ? "text-purple-400" : "text-blue-400"} />
                          </div>
                          <span className="text-sm text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                      {(!plan.features || plan.features.length === 0) && isLifetime && (
                        <li className="flex items-start gap-3">
                          <div className="shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <IconCheck size={12} className="text-purple-400" />
                          </div>
                          <span className="text-sm text-gray-300">Acceso vitalicio a todo el catálogo</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Footer Badge */}
                <div className="px-8 py-4 border-t border-white/5 bg-white/5 flex items-center gap-2">
                  <IconShield size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Pago seguro con Transbank Webpay
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
