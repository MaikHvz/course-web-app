"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockCourses } from "@/lib/mock-data";
import VideoPlayer from "@/components/VideoPlayer";
import ProgressBar from "@/components/ProgressBar";
import { IconArrowLeft, IconFileDownload, IconMessageCircle, IconSend } from "@tabler/icons-react";

export default function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const course = mockCourses.find(c => c.slug === params.slug);
  const [newComment, setNewComment] = useState("");

  if (!course) notFound();

  return (
    <div className="space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/mis-cursos" className="p-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">{course.title}</h1>
          <p className="text-sm text-gray-400">{course.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 items-start">
        
        {/* Main Content (Video + Comments) */}
        <div className="lg:col-span-3 space-y-8">
          <VideoPlayer videoId={course.bunny_video_id} title={course.title} />
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Acerca de este curso</h2>
            <div className="text-gray-300 whitespace-pre-wrap">{course.full_description}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <IconMessageCircle className="text-blue-400" />
              <h2 className="text-xl font-bold text-white">Comentarios de alumnos</h2>
            </div>
            
            <div className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-600 shrink-0 flex items-center justify-center font-bold text-white">JE</div>
              <div className="flex-1 relative">
                <textarea 
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none min-h-[100px]"
                  placeholder="Comparte tus dudas o progresos..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors">
                  <IconSend size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Mock Comment */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-700 shrink-0 flex items-center justify-center font-bold text-white">MR</div>
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Martín Rodríguez</span>
                    <span className="text-xs text-gray-500">Hace 2 días</span>
                  </div>
                  <p className="text-gray-300 text-sm">Excelente curso. La progresión de las técnicas desde la guardia me ayudó un montón a entender el control de peso. ¡Gracias formador!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Guía + Recursos + Progreso) */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4">Tu progreso</h3>
            <ProgressBar percentage={65} size="md" />
            <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
              Marcar como completado
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0">
              <h3 className="font-bold text-white">Guía Minuto a Minuto</h3>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1 p-2">
              {[
                { time: "00:00", desc: "Introducción y fundamentos" },
                { time: "05:30", desc: "Postura y desplazamientos" },
                { time: "15:45", desc: "Técnicas de defensa" },
                { time: "28:10", desc: "Variaciones avanzadas" },
                { time: "42:00", desc: "Resumen práctico" }
              ].map((ts, idx) => (
                <button key={idx} className="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors group flex flex-col gap-1">
                  <span className="text-blue-400 font-mono text-sm group-hover:text-blue-300">{ts.time}</span>
                  <span className="text-gray-300 text-sm">{ts.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="font-bold text-white mb-4">Recursos Descargables</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-gray-950 hover:bg-gray-800 rounded-lg border border-gray-800 hover:border-gray-700 transition-all group">
                <span className="text-gray-300 text-sm truncate pr-2">Manual Técnico.pdf</span>
                <IconFileDownload size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-950 hover:bg-gray-800 rounded-lg border border-gray-800 hover:border-gray-700 transition-all group">
                <span className="text-gray-300 text-sm truncate pr-2">Rutina_Entrenamiento.pdf</span>
                <IconFileDownload size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
