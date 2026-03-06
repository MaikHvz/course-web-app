"use client"
import { useState, useEffect } from "react";
import CourseCard from "@/components/CourseCard";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { Course, Category } from "@/lib/types";

type ProductTypeFilter = "Todos" | "Gratis" | "Individual" | "Suscripción";

export default function CatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productType, setProductType] = useState<ProductTypeFilter>("Todos");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const [coursesRes, categoriesRes] = await Promise.all([
        supabase
          .from('courses')
          .select('*, category:categories(*)')
          .order('order_index', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
      ]);
      
      if (!coursesRes.error && coursesRes.data) {
        setCourses(coursesRes.data);
      }
      
      if (!categoriesRes.error && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  const filteredCourses = courses.filter(course => {
    // Search match
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Product type filter match
    let matchesType = true;
    if (productType === "Gratis") matchesType = course.is_free;
    if (productType === "Individual") matchesType = !course.is_free;
    if (productType === "Suscripción") matchesType = course.included_in_subscription;

    // Category filter match
    const matchesCategory = activeCategoryId === "all" || course.category_id === activeCategoryId;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-900 py-12 px-4 md:px-[70px]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Catálogo de Cursos</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Descubre todos nuestros programas de entrenamiento. Desde fundamentos hasta masterclasses especializadas.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            {(["Todos", "Gratis", "Individual", "Suscripción"] as ProductTypeFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setProductType(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  productType === f 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            <button
              onClick={() => setActiveCategoryId("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategoryId === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Todas las Categorías
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategoryId === cat.id 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Buscar curso..."
              value={searchQuery}
              maxLength={100}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>

        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center sm:justify-items-start">
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 w-full">
              <IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
              <p className="text-xl">Cargando cursos...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
               <div key={course.id} className="w-full flex justify-center sm:justify-start">
                 <CourseCard course={course} />
               </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500 bg-gray-800/50 rounded-[20px] w-full mt-4">
              <p className="text-xl">No se encontraron cursos con estos filtros.</p>
              <button onClick={() => { setProductType("Todos"); setActiveCategoryId("all"); setSearchQuery(""); }} className="mt-4 text-blue-400 hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
