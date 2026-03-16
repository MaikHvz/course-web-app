import Link from "next/link";
import { 
  IconAlertTriangle, 
  IconRefresh, 
  IconArrowLeft,
  IconCreditCardOff
} from "@tabler/icons-react";

export const metadata = {
  title: "Error en el Pago | Zona Elite",
};

export default async function CheckoutErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason = "error" } = await searchParams;

  let title = "Pago no procesado";
  let description = "Ocurrió un error al procesar tu pago. No se han realizado cargos en tu cuenta.";
  let icon = <IconAlertTriangle size={64} className="text-red-500" />;

  switch (reason) {
    case "aborted":
      title = "Pago Cancelado";
      description = "Has cancelado el proceso de pago. Si fue un error, puedes intentar nuevamente.";
      icon = <IconCreditCardOff size={64} className="text-amber-500" />;
      break;
    case "rejected":
      title = "Pago Rechazado";
      description = "Tu banco ha rechazado la transacción. Por favor, verifica el saldo de tu cuenta o intenta con otro medio de pago.";
      break;
    case "already_processed":
      title = "Transacción Procesada";
      description = "Esta transacción ya había sido procesada anteriormente tal vez debido a una recarga de página.";
      break;
    case "not_found":
    case "invalid":
      title = "Transacción Inválida";
      description = "No hemos podido encontrar la información de tu transacción. Intenta iniciar el proceso de compra de nuevo.";
      break;
    case "error":
    default:
      title = "Error de Sistema";
      description = "Lo sentimos, hubo un problema de comunicación con el sistema de pagos. Por favor, intenta de nuevo más tarde.";
      break;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-950 px-4 py-16">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Adorno superior estilo card premium */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
        
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gray-950 rounded-full flex items-center justify-center border border-gray-800 shadow-inner">
            {icon}
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {title}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              {description}
            </p>
          </div>

          <div className="pt-6 space-y-4">
            <Link 
              href="/cursos"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <IconRefresh size={20} />
              Reintentar Compra
            </Link>

            <Link 
              href="/mis-cursos"
              className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-gray-800 text-gray-300 font-semibold py-3.5 px-4 border border-gray-700 rounded-xl transition-all"
            >
              <IconArrowLeft size={18} />
              Volver al Dashboard
            </Link>
          </div>

          <div className="border-t border-gray-800 pt-6 mt-6">
            <p className="text-xs text-gray-500">
              Si crees que esto es un error y el cargo se realizó en tu cuenta, por favor contáctanos con tu banco a la brevedad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
