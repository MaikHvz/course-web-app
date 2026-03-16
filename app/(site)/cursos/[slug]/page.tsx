import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/Badge";
import {
  IconClockPlay,
  IconTrophy,
  IconFileDownload,
  IconPlayerPlay,
  IconInfinity,
  IconDeviceMobile,
  IconCertificate,
  IconShoppingCart,
  IconStar,
} from "@tabler/icons-react";

const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

async function checkAccess(courseId: string) {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "paid")
    .maybeSingle();

  return !!purchase;
}

async function getCourse(slug: string) {
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

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !course) return null;
  return course;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Curso no encontrado" };
  return {
    title: `${course.title} | Zona Elite`,
    description: course.short_description,
  };
}

// Separate component for CTAs
import PurchaseButton from "@/components/PurchaseButton";
import { IconLock } from "@tabler/icons-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const hasAccess = await checkAccess(course.id);
  
  if (hasAccess) {
    redirect(`/mis-cursos/${course.slug}`);
  }

  const hasVideo = !!course.bunny_video_id && !!BUNNY_LIBRARY_ID;

  return (
    <div className="w-full min-h-screen bg-gray-950">
      {/* ─── Hero Banner con gradiente sobre thumbnail ─── */}
      <div className="relative w-full bg-gray-900 border-b border-gray-800">
        {course.thumbnail_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${course.thumbnail_url})` }}
          />
        )}
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-10 py-12 lg:py-16">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
              <Link href="/cursos" className="hover:text-blue-400 transition-colors">Cursos</Link>
              <span>/</span>
              <span className="text-gray-400">{course.category}</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{course.category}</Badge>
              {course.is_free && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ✦ Gratis
                </span>
              )}
              {course.included_in_subscription && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Incluido en Suscripción
                </span>
              )}
              {course.featured && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ⭐ Destacado
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              {course.title}
            </h1>

            {/* Short desc */}
            {course.short_description && (
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {course.short_description}
              </p>
            )}

            {/* Rating placeholder */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <IconStar
                    key={s}
                    size={16}
                    className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-600"}
                  />
                ))}
              </div>
              <span className="text-amber-400 font-bold">4.0</span>
              <span className="text-gray-500">· Academia Zona Elite</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          
          {/* ── LEFT: Video + Course Details ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Video Player / Lock Overlay */}
            {/* Video Player (Locked State Only since users with access are redirected) */}
            {hasVideo ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-xl group">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover blur-sm opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
                    <IconLock size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Contenido Exclusivo</h3>
                  <p className="text-gray-300 text-sm max-w-md mb-6">
                    Este video es exclusivo para alumnos. Obtén el curso para desbloquear el acceso inmediato.
                  </p>
                  <PurchaseButton 
                    courseId={course.id}
                    isFree={course.is_free}
                    redirectTo={`/mis-cursos/${course.slug}`}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20"
                  />
                </div>
              </div>
            ) : course.thumbnail_url ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-xl">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* What you'll learn */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Lo que aprenderás</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Técnicas fundamentales del curso",
                  "Aplicación práctica en situaciones reales",
                  "Progresión estructurada de habilidades",
                  "Metodología propia de Zona Elite",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                    <p className="text-gray-300 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Description */}
            {course.full_description && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-4">Descripción completa</h2>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {course.full_description}
                </div>
              </div>
            )}

            {/* Course includes */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-5">Este curso incluye</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <IconClockPlay size={20} />, text: "Acceso inmediato al video" },
                  { icon: <IconInfinity size={20} />, text: "Acceso de por vida" },
                  { icon: <IconFileDownload size={20} />, text: "Guías descargables en PDF" },
                  { icon: <IconDeviceMobile size={20} />, text: "Compatible en todos los dispositivos" },
                  { icon: <IconCertificate size={20} />, text: "Certificado de finalización" },
                  { icon: <IconTrophy size={20} />, text: "Logros y reconocimientos" },
                ].map(({ icon, text }, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="text-blue-400 shrink-0">{icon}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── RIGHT: Sticky Purchase Card ── */}
          <div className="relative">
            <div className="lg:sticky lg:top-8 space-y-4">
              {/* Main Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Thumbnail preview */}
                {course.thumbnail_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 space-y-5">
                  {/* Price */}
                  <div>
                    {course.is_free ? (
                      <p className="text-3xl font-black text-emerald-400">Gratis</p>
                    ) : (
                      <div>
                        <p className="text-3xl font-black text-white">${course.price}</p>
                        <p className="text-gray-500 text-xs mt-1">Pago único · Acceso de por vida</p>
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <PurchaseButton
                      courseId={course.id}
                      isFree={course.is_free}
                      redirectTo={`/mis-cursos/${course.slug}`}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20"
                    />

                    {course.included_in_subscription && (
                      <Link
                        href="/precios"
                        className="w-full block bg-transparent hover:bg-gray-800 text-white font-semibold py-3.5 px-4 border border-gray-700 rounded-xl transition-all text-center text-sm"
                      >
                        Incluido en suscripción → Ver planes
                      </Link>
                    )}
                  </div>

                  {/* Badges recap */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {course.is_free && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Gratis
                      </span>
                    )}
                    {course.included_in_subscription && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        En suscripción
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700">
                      {course.category}
                    </span>
                  </div>

                  {/* Quick stats */}
                  <div className="border-t border-gray-800 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nivel</span>
                      <span className="text-gray-300 font-medium">Todos los niveles</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Idioma</span>
                      <span className="text-gray-300 font-medium">Español</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Acceso</span>
                      <span className="text-gray-300 font-medium">De por vida</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Orden</span>
                      <span className="text-gray-300 font-medium">#{course.order_index}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share / secondary actions */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                <p className="text-gray-500 text-xs mb-2">¿Tenés dudas?</p>
                <a
                  href="https://wa.me/5491112345678?text=Hola!%20Me%20interesa%20el%20curso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  Consultanos por WhatsApp →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
