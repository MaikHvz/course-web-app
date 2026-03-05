"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CourseCard from "./CourseCard";
import { IconLoader2 } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const CATEGORIES = ["Todos", "MMA", "Jiu-Jitsu", "Kempo Karate", "Defensa Personal"];

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (!error && data) {
        setCourses(data);
      }
      setIsLoading(false);
    };

    fetchCourses();
  }, [supabase]);

  // Filter courses based on active category
  const filteredCourses = courses.filter(course => 
    activeCategory === "Todos" || course.category === activeCategory
  );

  return (
    <section className="py-16 px-4 md:px-[70px] w-full bg-gray-200 mt-[40px]">
      <div className="w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Cursos Destacados
            </h2>
            <p className="text-gray-600 text-lg">
              Explora nuestros programas completos divididos por disciplinas. Comienza tu camino marcial hoy mismo.
            </p>
          </div>
          
          <Link 
            href="/cursos" 
            className="hidden md:inline-block text-white font-semibold transition-colors bg-gray-900 px-5 py-2.5 rounded-full hover:bg-gray-800"
          >
            Ver catálogo completo &rarr;
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3 no-scrollbar">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium transition-all ${
                activeCategory === category 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center sm:justify-items-start">
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 w-full">
              <IconLoader2 size={40} className="animate-spin text-gray-900 mb-4" />
              <p className="text-lg">Cargando cursos...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <div key={course.id} className="w-full flex justify-center sm:justify-start">
                 <CourseCard course={course} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No hay cursos disponibles para esta categoría actualmente.
            </div>
          )}
        </div>

        {/* Mobile View All CTA */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link 
            href="/cursos" 
            className="text-white font-semibold transition-colors bg-gray-900 px-6 py-3 rounded-full hover:bg-gray-800 w-full text-center"
          >
            Ver catálogo completo &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
}
