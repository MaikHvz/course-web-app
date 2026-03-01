import Link from "next/link";
import { mockSubscriptionPlans } from "@/lib/mock-data";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";

export default function PricingPage() {
  const activePlans = mockSubscriptionPlans.filter(p => p.is_active);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-900 py-16 px-4 md:px-[70px]">
      <div className="max-w-[1200px] mx-auto text-center">
        
        <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 mb-4">Suscripciones Zona Elite</Badge>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Invierte en tu evolución</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
          Obtén acceso ilimitado a nuestra biblioteca de cursos de artes marciales y defensa personal. Aprende a tu propio ritmo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {activePlans.map((plan, index) => {
            const isPopular = plan.duration_days > 30; // Highlight annual plan
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-gray-800 rounded-3xl p-8 text-left border transition-transform hover:-translate-y-2 ${
                  isPopular ? "border-blue-500 shadow-2xl shadow-blue-500/10" : "border-gray-700"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    MÁS POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6 min-h-[48px]">{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  <span className="text-gray-400">/{plan.duration_days === 30 ? "mes" : "año"}</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-gray-300">
                      <IconCheck size={20} className="text-blue-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/login?redirect=/perfil"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-bold transition-colors ${
                    isPopular 
                      ? "bg-blue-600 hover:bg-blue-500 text-white" 
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  Elegir Plan
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
