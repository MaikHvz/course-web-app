"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Course } from "@/lib/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { IconPlus, IconEdit, IconEye, IconEyeOff, IconTrash, IconLoader2, IconStar, IconStarFilled } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  const fetchCourses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setCourses(data as Course[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [supabase]);

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      // If already featured, just unfeature it
      const { error } = await supabase
        .from('courses')
        .update({ featured: false })
        .eq('id', id);
      
      if (error) {
        alert("Error: " + error.message);
      }
    } else {
      // Unfeature ALL courses first (to ensure only one)
      const { error: unfeatureError } = await supabase
        .from('courses')
        .update({ featured: false })
        .eq('featured', true);
      
      if (unfeatureError) {
        alert("Error cleaning others: " + unfeatureError.message);
        return;
      }

      // feature the selected one
      const { error } = await supabase
        .from('courses')
        .update({ featured: true })
        .eq('id', id);
      
      if (error) {
        alert("Error: " + error.message);
      }
    }
    
    fetchCourses();
  };

  const columns: Column<Course>[] = [
    { 
      key: "title", 
      header: "Curso",
      render: (course) => (
        <div className="flex flex-col">
          <span className="font-bold text-white mb-1">{course.title}</span>
          <span className="text-xs text-gray-500">{course.category}</span>
        </div>
      )
    },
    { 
      key: "featured", 
      header: "Destacado",
      render: (course) => (
        <button 
          onClick={() => handleToggleFeatured(course.id, course.featured)}
          className={`p-2 rounded-lg transition-all ${course.featured ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20" : "text-gray-600 hover:text-gray-400 hover:bg-white/5"}`}
          title={course.featured ? "Quitar destacado" : "Marcar como destacado"}
        >
          {course.featured ? <IconStarFilled size={20} /> : <IconStar size={20} />}
        </button>
      )
    },
    { 
      key: "status", 
      header: "Estado",
      render: (course) => (
        <Badge variant={course.is_published ? "success" : "secondary"}>
          {course.is_published ? "Publicado" : "Borrador"}
        </Badge>
      )
    },
    { 
      key: "price", 
      header: "Precio",
      render: (course) => (
        <span className="font-medium text-gray-300">
          {course.is_free ? "Gratis" : `$${course.price}`}
        </span>
      )
    },
    { 
      key: "actions", 
      header: "Acciones",
      render: (course) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/cursos/${course.id}/editar`} className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 rounded transition-colors" title="Editar">
            <IconEdit size={16} />
          </Link>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors" title={course.is_published ? "Despublicar" : "Publicar"}>
            {course.is_published ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
          <button className="p-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 hover:text-red-400 rounded transition-colors" title="Eliminar">
            <IconTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Gestión de Cursos</h1>
          <p className="text-gray-400">Crea, edita y publica el contenido de la plataforma.</p>
        </div>
        
        <Link 
          href="/admin/cursos/nuevo" 
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus size={20} />
          <span>Nuevo Curso</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
          <IconLoader2 size={48} className="animate-spin text-red-500 mb-4" />
          <p className="text-xl">Cargando cursos...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={courses} 
          emptyMessage="No hay cursos creados aún."
        />
      )}
    </div>
  );
}
