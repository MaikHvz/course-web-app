import React from "react";

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ProgressBar({ percentage, showLabel = true, size = "md" }: ProgressBarProps) {
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  const text = size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm";
  
  const isComplete = safePercentage >= 90;
  const color = isComplete ? "bg-emerald-500" : "bg-blue-500";

  return (
    <div className="w-full relative">
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${h}`}>
        <div 
          className={`${color} h-full transition-all duration-500 ease-out`} 
          style={{ width: `${safePercentage}%` }}
        />
      </div>
      {showLabel && (
        <div className={`mt-1.5 flex justify-between items-center ${text} text-gray-400 font-medium`}>
          <span>{isComplete ? "¡Completado!" : "Progreso"}</span>
          <span className={isComplete ? "text-emerald-400" : "text-gray-300"}>
            {Math.round(safePercentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
