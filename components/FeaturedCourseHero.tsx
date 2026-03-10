"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Course } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconArrowRight, IconStar } from "@tabler/icons-react";

export default function FeaturedCourseHero() {
  const [featuredCourse, setFeaturedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, category:categories(*)")
        .eq("featured", true)
        .maybeSingle();

      if (!error && data) {
        setFeaturedCourse(data as Course);
      }
      setIsLoading(false);
    };

    fetchFeatured();
  }, [supabase]);

  if (isLoading || !featuredCourse) return null;

  return (
    <section className="px-4 md:px-[70px] py-12">
      <div className="relative w-full h-[400px] md:h-[500px] rounded-[32px] overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-blue-900/20">
        {/* Background Image */}
        <Image
          src={featuredCourse.thumbnail_url || "/course-placeholder.jpg"}
          alt={featuredCourse.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent z-10" />

        {/* Content Block */}
        <div className="relative z-20 h-full flex flex-col justify-center p-8 md:p-16 max-w-2xl">
          <div className="flex items-center gap-2 mb-4 animate-fade-in">
            <div className="bg-yellow-400 text-gray-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-yellow-400/20">
              <IconStar size={12} fill="currentColor" />
              <span>Curso Destacado</span>
            </div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {featuredCourse.category?.name || "Sin categoría"}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            {featuredCourse.title}
          </h2>

          <p className="text-gray-300 text-base md:text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-xl font-medium leading-relaxed">
            {featuredCourse.short_description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/cursos/${featuredCourse.slug}`}
              className="group/btn bg-white hover:bg-blue-50 text-gray-950 font-black py-4 px-8 rounded-2xl flex items-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-white/5"
            >
              <span>{featuredCourse.is_free ? "Ver ahora" : "Comprar ahora"}</span>
              <IconArrowRight
                size={20}
                className="transition-transform group-hover/btn:translate-x-1"
              />
            </Link>
            
            {!featuredCourse.is_free && (
              <div className="flex flex-col justify-center">
                <span className="text-white text-2xl font-black">
                  ${featuredCourse.price}
                </span>
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">
                  Pago Único
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Elegant subtle highlight effect */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
