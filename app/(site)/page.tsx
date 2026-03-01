"use client";

import Image from "next/image";
import TypingText from "@/components/TypingText";
import BrandsMarquee from "@/components/BrandsMarquee";
import FeaturedCourses from "@/components/FeaturedCourses";
import FeaturedCourseHero from "@/components/FeaturedCourseHero";
import { IconArrowRight } from "@tabler/icons-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <div className="bg-white bg-grid-pattern mx-4 my-6 md:m-[70px] rounded-[20px] flex flex-col md:flex-row md:items-center md:h-[500px] relative overflow-hidden shadow-lg">
        {/* Text block */}
        <div className="w-full md:w-[50%] text-gray-900 z-10 p-6 md:p-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">
            ¿Nunca has practicado <br /> un deporte de contacto?
          </h1>

          <div className="text-2xl sm:text-3xl md:text-4xl font-black mt-1 h-[44px] md:h-[50px]">
            <TypingText
              texts={["Empieza aquí!", "Bienvenido!"]}
              typingSpeed={100}
              deletingSpeed={50}
              pauseTime={1200}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-500"
            />
          </div>

          <p className="text-gray-700 mt-4 max-w-md text-sm md:text-base">
            No necesitas experiencia previa, solo ganas de entrenar. Te guío
            paso a paso desde cero en jiujitsu, defensa personal y artes
            marciales.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <button className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-[12px] transition-colors text-sm md:text-base">
              Ver cursos
            </button>
            <button className="bg-transparent hover:bg-gray-900 text-gray-900 font-semibold hover:text-white py-2 px-4 border border-gray-900 hover:border-transparent rounded-[12px] transition-all text-sm md:text-base">
              Unirme a la academia
            </button>
          </div>
        </div>

        {/* Image block — mobile: relative below text with top-angled clip; desktop: absolute right overlay */}
        <div className="relative w-full h-[260px] sm:h-[300px] md:absolute md:right-0 md:top-0 md:h-full md:w-[55%] select-none flex-shrink-0">
          <div
            className="relative w-full h-full"
            style={{
              clipPath: "var(--hero-clip)",
            }}
          >
            <style>{`
              :root {
                --hero-clip: polygon(8% 0, 100% 0, 100% 100%, 0% 100%);
              }
              @media (max-width: 767px) {
                :root {
                  --hero-clip: polygon(0 12%, 100% 0, 100% 100%, 0% 100%);
                }
              }
            `}</style>
            <Image
              src="/hero-fist.jpg"
              alt="banner con manos en el aire"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/5 pointer-events-none" />
          </div>
        </div>
      </div>

      <FeaturedCourseHero />

      {/* Cards section */}
      <div className="flex flex-wrap px-[70px] gap-4 justify-center">
        <div className="flex flex-wrap justify-center items-center">
          <div className="flex-[1.3] font-sans text-3xl font-thin bg-gray-900 text-white p-6 rounded-[20px] min-w-[200px] w-[400px]">
            Aprende habilidades esenciales de{" "}
            <span className="font-light italic">defensa personal</span> y{" "}
            <span className="font-light italic">deportes de contacto</span> para
            tu cuerpo, tu mente y tu vida.
            <div className="text-[15px] text-gray-300 font-thin mt-4">
              Zona Elite te guía en tu entrenamiento en defensa personal y
              deportes de contacto, ayudándote a mejorar tu rendimiento físico y
              tu confianza personal.
            </div>
          </div>
        </div>

        <div className="flex-[1] min-w-[200px] max-w-[400px] w-[300px] h-[350px] rounded-[20px] overflow-hidden relative shadow-md ">
          <Image
            src="mma.svg" // reemplaza con tu imagen
            alt="Card 1"
            fill
            className="object-cover object-right"
          />
          <div className="absolute bottom-5 left-3 right-3 h-[70px] bg-white rounded-lg flex px-[20px] justify-between items-center text-black font-light  hover:bg-gray-100 hover:shadow-md cursor-pointer transition-colors group">
            <span>Mma</span>
            <IconArrowRight
              size={20}
              className="text-gray-400 group-hover:text-gray-900 transition-colors"
            />
          </div>
        </div>
        <div className="flex-[1] min-w-[200px] max-w-[400px] w-[300px] h-[350px] rounded-[20px] overflow-hidden relative shadow-md ">
          <Image
            src="kempo.svg" // reemplaza con tu imagen
            alt="Card 1"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-5 left-3 right-3 h-[70px] bg-white rounded-lg flex px-[20px] justify-between items-center text-black font-light  hover:bg-gray-100 hover:shadow-md cursor-pointer transition-colors group">
            <span>Kempo Karate</span>
            <IconArrowRight
              size={20}
              className="text-gray-400 group-hover:text-gray-900 transition-colors"
            />
          </div>
        </div>
        <div className="flex flex-[1] min-w-[200px] max-w-[400px] w-[300px] h-[350px] rounded-[20px] overflow-hidden relative shadow-md ">
          <Image
            src="jiujitsu.svg" // reemplaza con tu imagen
            alt="Card 1"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-5 left-3 right-3 h-[70px] bg-white rounded-lg flex px-[20px] justify-between items-center text-black font-light  hover:bg-gray-100 hover:shadow-md cursor-pointer transition-colors group">
            <span>Jiu-Jitsu</span>
            <IconArrowRight
              size={20}
              className="text-gray-400 group-hover:text-gray-900 transition-colors"
            />
          </div>
        </div>
      </div>


      <FeaturedCourses />

    </div>
  );
}
