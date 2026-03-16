import Image from "next/image";
import Link from "next/link";
import { Course } from "@/lib/types";
import { Badge } from "./ui/Badge";
import { IconArrowRight } from "@tabler/icons-react";

interface CourseCardProps {
  course: Course;
  hidePrice?: boolean;
}

export default function CourseCard({ course, hidePrice = false }: CourseCardProps) {
  return (
    <Link href={`/cursos/${course.slug}`} className="group flex flex-col min-w-[200px] w-full max-w-[400px] h-[350px] rounded-[20px] overflow-hidden relative shadow-md bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative w-full h-[60%] bg-gray-900">
        <Image
          src={course.thumbnail_url || "https://placehold.co/600x400/0f172a/white.png?text=Zona+Elite"}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {course.is_free ? (
            <Badge variant="success">Gratis</Badge>
          ) : course.included_in_subscription ? (
            <Badge variant="default">Suscripción</Badge>
          ) : (
            <Badge variant="warning">Premium</Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-col flex-1 p-5 justify-between bg-gray-800 text-white">
        <div>
          <h3 className="text-xl font-bold line-clamp-2 leading-tight">{course.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{course.category?.name || "Sin categoría"}</p>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          {!hidePrice && (
            <span className="text-lg font-semibold text-blue-400">
              {course.is_free ? "Gratis" : `$${course.price}`}
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-blue-600 transition-colors ml-auto">
            <IconArrowRight size={18} className="text-gray-300 group-hover:text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
