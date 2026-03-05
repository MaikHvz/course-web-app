"use client";

const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

interface VideoPlayerProps {
  videoId: string;
  title?: string;
}

export default function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Video no disponible</p>
      </div>
    );
  }

  if (!BUNNY_LIBRARY_ID) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl border border-red-900/40 flex items-center justify-center p-4 text-center">
        <p className="text-red-400 text-sm">
          Falta configurar <code className="bg-red-900/30 px-1 rounded">NEXT_PUBLIC_BUNNY_LIBRARY_ID</code> en .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      <iframe
        src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        title={title || "Video del curso"}
        loading="lazy"
        className="w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
