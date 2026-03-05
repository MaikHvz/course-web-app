import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import VideoPlayer from "@/components/VideoPlayer";
import ProgressBar from "@/components/ProgressBar";
import PurchaseButton from "@/components/PurchaseButton";
import { 
  IconArrowLeft, 
  IconFileDownload, 
  IconMessageCircle, 
  IconSend,
  IconLock
} from "@tabler/icons-react";
import { Course, Purchase, Subscription } from "@/lib/types";

// Helper checking access
function canUserAccessCourse(course: Course, activeSubs: Subscription[], purchases: Purchase[]): boolean {
  if (course.is_free) return true;

  const hasPaid = purchases.some(p => p.course_id === course.id && (p.status === "paid" || p.status === "gifted"));
  if (hasPaid) return true;

  if (course.included_in_subscription) {
      const hasActiveSub = activeSubs.some(s => s.status === "active" && new Date(s.end_date) > new Date());
      if (hasActiveSub) return true;
  }

  return false;
}

export default async function CoursePlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect(`/login?redirect=/mis-cursos/${slug}`);
  }

  // Fetch course
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  // Fetch user access data
  const [purchasesRes, subsRes] = await Promise.all([
    supabase.from("purchases").select("*").eq("user_id", session.user.id),
    supabase.from("subscriptions").select("*").eq("user_id", session.user.id)
  ]);

  const hasAccess = canUserAccessCourse(
    course as Course, 
    (subsRes.data as Subscription[]) || [], 
    (purchasesRes.data as Purchase[]) || []
  );

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mb-2">
          <IconLock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white">Contenido Bloqueado</h1>
        <p className="text-gray-400 max-w-md mb-4">
          No tienes acceso a este curso. Necesitas comprarlo o tener una suscripción activa para verlo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <PurchaseButton 
            courseId={course.id}
            isFree={course.is_free}
            text={course.is_free ? "Obtener gratis ahora" : "Comprar y desbloquear ahora"}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          />
          <Link 
            href={`/cursos/${slug}`}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Ver detalles del curso
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6">
      
      <div className="flex items-center gap-4">
        <Link href="/mis-cursos" className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white">{course.title}</h1>
          <p className="text-sm text-gray-400">{course.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 xl:gap-6 items-start">
        
        {/* Main Content (Video + Comments) */}
        <div className="xl:col-span-3 space-y-8">
          <VideoPlayer videoId={course.bunny_video_id} title={course.title} />
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Acerca de este curso</h2>
            <div className="text-gray-300 whitespace-pre-wrap">{course.full_description}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <IconMessageCircle className="text-blue-400" />
              <h2 className="text-xl font-bold text-white">Comentarios (Próximamente)</h2>
            </div>
            <p className="text-gray-500 text-sm">
              La sección de comentarios comunitarios estará disponible en la próxima actualización.
            </p>
          </div>
        </div>

        {/* Sidebar (Guía + Recursos + Progreso) */}
        <div className="xl:col-span-1 space-y-6">
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4">Tu progreso</h3>
            <ProgressBar percentage={0} size="md" />
            <p className="text-xs text-center text-gray-500 mt-2">Seguimiento de progreso en desarrollo</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0">
              <h3 className="font-bold text-white">Contenido</h3>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1 p-4 text-center">
              <p className="text-sm text-gray-500">Módulos en desarrollo para la v2. El video contiene el curso completo.</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <h3 className="font-bold text-white mb-2">Recursos</h3>
            <p className="text-sm text-gray-500">Sin recursos adicionales descargables para este curso en este momento.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
