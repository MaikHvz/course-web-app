 "use client";
 
 import Image from "next/image";
 
 type Logo = {
   src: string;
   alt?: string;
   width?: number;
   height?: number;
 };
 
 export default function BrandsMarquee({ logos }: { logos: Logo[] }) {
   return (
    <div className="w-full overflow-hidden py-6">
      <div className="whitespace-nowrap">
        <div className="inline-flex items-center gap-10 animate-[marquee_20s_linear_infinite] will-change-transform">
          {logos.map((l, i) => (
            <Image
              key={`a-${l.src}-${i}`}
              src={l.src}
              alt={l.alt ?? "brand"}
              width={l.width ?? 120}
              height={l.height ?? 40}
              className="opacity-80 [filter:grayscale(1)_brightness(0.9)]"
            />
          ))}
          {logos.map((l, i) => (
            <Image
              key={`b-${l.src}-${i}`}
              src={l.src}
              alt={l.alt ?? "brand"}
              width={l.width ?? 120}
              height={l.height ?? 40}
              className="opacity-80 [filter:grayscale(1)_brightness(0.9)]"
            />
          ))}
        </div>
      </div>
       <style jsx>{`
         @keyframes marquee {
           0% {
             transform: translateX(0);
           }
           100% {
             transform: translateX(-50%);
           }
         }
       `}</style>
     </div>
   );
 }
