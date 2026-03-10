"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Course } from "@/lib/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import {
  IconPlus,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconLoader2,
  IconStar,
  IconStarFilled,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const supabase = createSupabaseBrowserClient();

  const fetchCourses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCourses(data as Course[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [supabase]);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setActionError("");
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      setActionError(`Error al cambiar estado: ${error.message}`);
    } else {
      fetchCourses();
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    setActionError("");
    if (!currentStatus) {
      // Unfeature ALL courses first
      const { error: unfeatureError } = await supabase
        .from("courses")
        .update({ featured: false })
        .eq("featured", true);

      if (unfeatureError) {
        setActionError(`Error: ${unfeatureError.message}`);
        return;
      }
    }

    const { error } = await supabase
      .from("courses")
      .update({ featured: !currentStatus })
      .eq("id", id);

    if (error) {
      setActionError(`Error al cambiar destacado: ${error.message}`);
    } else {
      fetchCourses();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setActionError("");

    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      setActionError(`Error al eliminar: ${error.message}`);
    } else {
      fetchCourses();
    }
  };

  const columns: Column<Course>[] = [
    {
      key: "title",
      header: "Curso",
      render: (course) => (
        <div className="flex items-center gap-3">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-14 h-10 rounded-lg object-cover shrink-0 border border-gray-800"
            />
          ) : (
            <div className="w-14 h-10 rounded-lg bg-gray-800 border border-gray-700 shrink-0 flex items-center justify-center text-gray-600 text-xs">
              Sin img
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white truncate">{course.title}</span>
            <span className="text-xs text-gray-500">{course.category?.name || "Sin categoría"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "featured",
      header: "Destacado",
      render: (course) => (
        <button
          onClick={() => handleToggleFeatured(course.id, course.featured)}
          className={`p-2 rounded-lg transition-all ${
            course.featured
              ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
              : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
          }`}
          title={course.featured ? "Quitar destacado" : "Marcar como destacado"}
        >
          {course.featured ? <IconStarFilled size={20} /> : <IconStar size={20} />}
        </button>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (course) => (
        <Badge variant={course.is_published ? "success" : "secondary"}>
          {course.is_published ? "Publicado" : "Borrador"}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Precio",
      render: (course) => (
        <span className="font-medium text-gray-300">
          {course.is_free ? (
            <span className="text-emerald-400">Gratis</span>
          ) : (
            `$${course.price}`
          )}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (course) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/cursos/${course.id}/editar`}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 rounded-lg transition-colors"
            title="Editar"
          >
            <IconEdit size={16} />
          </Link>
          <button
            onClick={() => handleTogglePublish(course.id, course.is_published)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
            title={course.is_published ? "Despublicar" : "Publicar"}
          >
            {course.is_published ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
          <button
            onClick={() => handleDelete(course.id, course.title)}
            className="p-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 hover:text-red-400 rounded-lg transition-colors"
            title="Eliminar"
          >
            <IconTrash size={16} />
          </button>
        </div>
      ),
    },
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
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus size={20} />
          <span>Nuevo Curso</span>
        </Link>
      </div>

      {actionError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          <IconAlertTriangle size={18} className="shrink-0" />
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
          <IconLoader2 size={48} className="animate-spin text-red-500 mb-4" />
          <p className="text-xl">Cargando cursos...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          emptyMessage="No hay cursos creados aún. Haz clic en 'Nuevo Curso' para empezar."
        />
      )}
    </div>
  );
}
