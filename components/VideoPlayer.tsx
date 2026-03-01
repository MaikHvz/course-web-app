"use client";

import { IconPlayerPlayFilled } from "@tabler/icons-react";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
}

export default function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  return (
    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-gray-800 shadow-xl group">
      
      {/* Placeholder overlay before play (in a real scenario, Bunny player handles this) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <button className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white mb-4 hover:bg-blue-500 hover:scale-110 transition-all shadow-[0_0_30px_rgba(37,99,235,0.5)]">
          <IconPlayerPlayFilled size={24} className="ml-1" />
        </button>
        <p className="text-gray-400 text-sm font-mono bg-gray-900/80 px-3 py-1 rounded">
          [Bunny Stream MOCK: {videoId}]
        </p>
      </div>

    </div>
  );
}
