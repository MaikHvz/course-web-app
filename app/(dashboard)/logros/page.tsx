"use client";

import { useState, useEffect } from "react";
import { Achievement } from "@/lib/types";
import AchievementBadge from "@/components/AchievementBadge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconLoader2 } from "@tabler/icons-react";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchAchievementsData = async () => {
      setIsLoading(true);
      
      // consume tods los logros
      const { data: allAch } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (allAch) setAchievements(allAch as Achievement[]);

      // consume los logros desbloqueados del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userAch } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', session.user.id);
        
        if (userAch) {
          setUnlockedIds(userAch.map(ua => ua.achievement_id));
        }
      }
      
      setIsLoading(false);
    };

    fetchAchievementsData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400">Cargando tus logros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Tus Logros</h1>
        <p className="text-gray-400">Desbloquea medallas completando desafíos y rutinas dentro de la academia.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Total Desbloqueados</p>
          <p className="text-4xl font-black text-blue-400">
            {unlockedIds.length} <span className="text-gray-600 text-2xl font-medium">/ {achievements.length}</span>
          </p>
        </div>
      </div>

      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map(ach => (
            <AchievementBadge 
              key={ach.id} 
              achievement={ach} 
              isUnlocked={unlockedIds.includes(ach.id)}
              unlockedAt={unlockedIds.includes(ach.id) ? new Date().toISOString() : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-gray-800 border-dashed rounded-2xl">
          <p className="text-gray-500 italic">No hay logros configurados en la plataforma todavía.</p>
        </div>
      )}
    </div>
  );
}
