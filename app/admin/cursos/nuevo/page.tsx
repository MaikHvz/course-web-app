import CourseForm from "../_components/CourseForm";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function NuevoCursoPage() {
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
          <h1 className="text-3xl font-black text-white">Nuevo Curso</h1>
          <p className="text-gray-400 text-sm">Completa los datos para crear un nuevo curso.</p>
        </div>
      </div>

      <CourseForm mode="create" />
    </div>
  );
}
