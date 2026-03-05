"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CourseForm from "../../_components/CourseForm";
import { Course } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";

export default function EditarCursoPage() {
  const params = useParams();
  const id = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setCourse(data as Course);
      }
      setIsLoading(false);
    };
    fetchCourse();
  }, [id, supabase]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <IconLoader2 size={48} className="animate-spin text-blue-500" />
        <p className="text-gray-400">Cargando curso...</p>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-2xl font-bold text-white">Curso no encontrado</p>
        <Link href="/admin/cursos" className="text-blue-400 hover:underline">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cursos"
          className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
        >
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Editar Curso</h1>
          <p className="text-gray-400 text-sm truncate max-w-xl">{course.title}</p>
        </div>
      </div>

      <CourseForm mode="edit" initialData={course} />
    </div>
  );
}
