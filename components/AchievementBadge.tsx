import React from "react";
import { Achievement } from "@/lib/types";
import { 
  IconTrophy, 
  IconAward, 
  IconStar, 
  IconFlame, 
  IconRocket, 
  IconCertificate, 
  IconTarget, 
  IconSchool, 
  IconCrown, 
  IconMedal 
} from "@tabler/icons-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
}

const ICON_MAP: Record<string, any> = {
  IconTrophy,
  IconAward,
  IconStar,
  IconFlame,
  IconRocket,
  IconCertificate,
  IconTarget,
  IconSchool,
  IconCrown,
  IconMedal,
};

export default function AchievementBadge({ achievement, isUnlocked, unlockedAt }: AchievementBadgeProps) {
  const IconComponent = ICON_MAP[achievement.icon_url] || IconTrophy;
  const badgeColor = achievement.hex_color || "#3b82f6"; // Fallback to blue

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isUnlocked 
        ? "bg-gray-800 border-gray-700 shadow-lg hover:-translate-y-1" 
        : "bg-gray-900 border-gray-800 opacity-60 grayscale"
    }`}
    style={isUnlocked ? { borderLeft: `4px solid ${badgeColor}` } : {}}
    >
      <div className="flex items-start gap-4">
        <div 
          className="p-3 rounded-xl shrink-0 hidden sm:block"
          style={{ 
            backgroundColor: isUnlocked ? `${badgeColor}20` : "transparent",
            color: isUnlocked ? badgeColor : "#4b5563"
          }}
        >
          <IconComponent size={32} />
        </div>
        <div>
          <h4 
            className="font-bold text-lg mb-1"
            style={{ color: isUnlocked ? "white" : "#9ca3af" }}
          >
            {achievement.title}
          </h4>
          <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
          
          {isUnlocked && unlockedAt ? (
            <div 
              className="text-xs font-medium px-2 py-1 rounded inline-block"
              style={{ 
                backgroundColor: `${badgeColor}30`,
                color: badgeColor
              }}
            >
              Desbloqueado el {new Date(unlockedAt).toLocaleDateString()}
            </div>
          ) : (
            <div className="text-xs font-medium text-gray-500 italic">
              Aún no desbloqueado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
