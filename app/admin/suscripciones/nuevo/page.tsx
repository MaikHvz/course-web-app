import SubscriptionPlanForm from "../_components/SubscriptionPlanForm";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export const metadata = {
  title: "Nuevo Plan de Suscripción | Admin",
};

export default function NewSubscriptionPlanPage() {
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
          <h1 className="text-3xl font-black text-white">Nuevo Plan</h1>
          <p className="text-gray-400">Crea un nuevo paquete de suscripción para los alumnos.</p>
        </div>
      </div>

      <SubscriptionPlanForm mode="create" />
    </div>
  );
}
