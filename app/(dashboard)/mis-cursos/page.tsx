"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar";
import { IconPlayerPlay, IconCertificate, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      // Fetch purchased courses
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          course_id,
          courses (*)
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'paid');
      
      if (!error && data) {
        // Flatten the relationship
        const flattened = data.map((p: any) => p.courses).filter(Boolean);
        setCourses(flattened);
      }
      setIsLoading(false);
    };

    fetchEnrolledCourses();
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Mis Cursos</h1>
        <p className="text-gray-400">Continúa tu entrenamiento donde lo dejaste.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
            <IconLoader2 size={40} className="animate-spin text-blue-500 mb-4" />
            <p className="text-lg">Cargando tus cursos...</p>
          </div>
        ) : courses.length > 0 ? (
          courses.map((course) => {
            const progress: number = 0; // In a real app, fetch from course_progress table

            return (
              <div key={course.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col sm:flex-row transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50">
                <div className="relative w-full sm:w-48 aspect-video sm:aspect-square shrink-0">
                  <Image 
                    src={course.thumbnail_url || '/placeholder-course.jpg'} 
                    alt={course.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
                
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{course.category}</p>
                    
                    <ProgressBar percentage={progress} size="sm" />
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <Link 
                      href={`/mis-cursos/${course.slug}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors"
                    >
                      <IconPlayerPlay size={18} />
                      <span>{progress === 100 ? "Repasar" : "Continuar"}</span>
                    </Link>
                    
                    {progress === 100 && (
                      <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-3 rounded-lg border border-gray-700 transition-colors" title="Descargar Certificado">
                        <IconCertificate size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
            <IconAlertCircle size={40} className="text-gray-600 mb-4" />
            <p className="text-lg">Aún no estás inscrito en ningún curso.</p>
            <Link href="/cursos" className="mt-4 text-blue-500 hover:underline">
              Ir al catálogo
            </Link>
          </div>
        )}
      </div>

      <div className="mt-12 p-8 bg-blue-900/20 border border-blue-900/50 rounded-2xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">¿Buscando un nuevo desafío?</h3>
        <p className="text-blue-200 mb-6">Explora el catálogo completo y añade nuevas disciplinas a tu arsenal.</p>
        <Link href="/cursos" className="inline-block bg-white text-gray-900 font-bold py-2.5 px-6 rounded-lg hover:bg-gray-100 transition-colors">
          Explorar Cursos
        </Link>
      </div>
    </div>
  );
}
