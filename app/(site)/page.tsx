"use client";

import Image from "next/image";
import TypingText from "@/components/TypingText";
import BrandsMarquee from "@/components/BrandsMarquee";
import { IconArrowRight } from "@tabler/icons-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <div className="bg-white bg-grid-pattern m-[70px] h-[500px] rounded-[20px] flex items-center p-8 relative overflow-hidden shadow-lg">
        <div className="w-[50%] text-gray-900 z-10">
          <h1 className="text-5xl font-black">
            ¿Nunca has practicado <br /> un deporte de contacto?
          </h1>

          <div className="text-4xl font-black mt-1 h-[50px]">
            <TypingText
              texts={["Empieza aquí!", "Bienvenido!"]}
              typingSpeed={100}
              deletingSpeed={50}
              pauseTime={1200}
              className="text-4xl font-black text-gray-500"
            />
          </div>

          <p className="text-gray-700 mt-4 max-w-md">
            No necesitas experiencia previa, solo ganas de entrenar. Te guío
            paso a paso desde cero en jiujitsu, defensa personal y artes
            marciales.
          </p>

          <div className="flex gap-4 mt-4">
            <button className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-[12px] transition-colors">
              Ver cursos
            </button>
            <button className="bg-transparent hover:bg-gray-900 text-gray-900 font-semibold hover:text-white py-2 px-4 border border-gray-900 hover:border-transparent rounded-[12px] transition-all">
              Unirme a la academia
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-[55%] select-none">
          <div className="relative w-full h-full" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}>
            <Image
              src="/hero-fist.jpg"
              alt="banner con manos en el aire"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay sutil para mejorar contraste si fuera necesario, opcional */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/5 pointer-events-none" />
          </div>
        </div>
      </div>

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
      <div className="w-full mt-[40px] bg-white h-[500px] flex ">
        <main className="flex flex-col mx-[90px] mt-[40px] h-[400px] rounded-[20px] bg-grid-pattern">
          <h2 className="text-2xl text-gray-900 font-semibold">Aprende Aplicando</h2>
          <p className="text-[16px] text-gray-900">Accede a <span className="font-normal underline cursor-pointer hover:text-blue-600">Cursos online de deportes de contacto y defensa personal</span>. Aprende de expertos y domina técnicas clave desde cualquier lugar.</p>
          
        </main>
      </div>

    </div>
  );
}
