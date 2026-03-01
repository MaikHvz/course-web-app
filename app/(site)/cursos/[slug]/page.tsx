import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockCourses } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import { IconClockPlay, IconTrophy, IconFileDownload, IconBrandFacebook, IconBrandWhatsapp } from "@tabler/icons-react";

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = mockCourses.find(c => c.slug === params.slug && c.is_published);

  if (!course) {
    notFound();
  }

  return (
    <div className="w-full bg-gray-900 pb-20">
      
      {/* Hero */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <Image 
          src={course.thumbnail_url} 
          alt={course.title} 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-[70px] pb-12">
          <div className="max-w-[1000px] mx-auto">
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary">{course.category}</Badge>
              {course.included_in_subscription && <Badge variant="default">Incluido en Suscripción</Badge>}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl">
              {course.short_description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-[70px] mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-12">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Acerca de este curso</h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-800 p-6 rounded-2xl">
              {course.full_description}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contenido del curso</h2>
            <div className="bg-gray-800 rounded-2xl overflow-hidden">
              {/* Mock Timestamps */}
              {[
                { time: "00:00", desc: "Introducción y fundamentos" },
                { time: "05:30", desc: "Postura y desplazamientos" },
                { time: "15:45", desc: "Técnicas de defensa principal" },
                { time: "28:10", desc: "Contraataques y combinaciones" },
                { time: "42:00", desc: "Resumen y ejercicios prácticos" }
              ].map((ts, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-700 last:border-0 hover:bg-gray-750 transition-colors">
                  <span className="text-blue-400 font-mono font-medium">{ts.time}</span>
                  <p className="text-gray-300">{ts.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column - Buy Card */}
        <div className="relative">
          <div className="sticky top-28 bg-gray-800 rounded-[20px] p-6 shadow-xl border border-gray-700">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm font-medium mb-1">Pago único, acceso de por vida</p>
              <div className="text-4xl font-black text-white">
                {course.is_free ? "Gratis" : `$${course.price}`}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <Link
                href={`/login?redirect=/mis-cursos/${course.slug}`} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-colors text-center"
              >
                {course.is_free ? "Obtener ahora gratis" : "Comprar curso"}
              </Link>
              
              {course.included_in_subscription && (
                <Link
                  href="/precios" 
                  className="w-full bg-transparent hover:bg-gray-700 text-white font-semibold py-3 px-4 border border-gray-600 rounded-xl transition-all text-center"
                >
                  Suscribirse por $19.99/mes
                </Link>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-white">Este curso incluye:</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-gray-300 items-start">
                  <IconClockPlay size={20} className="text-blue-400 shrink-0" />
                  <span>Acceso inmediato al video completo</span>
                </li>
                <li className="flex gap-3 text-gray-300 items-start">
                  <IconFileDownload size={20} className="text-blue-400 shrink-0" />
                  <span>Guías en PDF descargables</span>
                </li>
                <li className="flex gap-3 text-gray-300 items-start">
                  <IconTrophy size={20} className="text-blue-400 shrink-0" />
                  <span>Progreso gamificado y logros</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
