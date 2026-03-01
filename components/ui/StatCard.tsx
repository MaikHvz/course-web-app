import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-900/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
        <div className="p-3 bg-gray-950 rounded-xl text-blue-500 group-hover:bg-blue-900/20 group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center text-sm">
          <span className={`font-medium ${trend.isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {trend.isPositive ? "+" : "-"}{trend.value}
          </span>
          <span className="text-gray-500 ml-2">vs mes anterior</span>
        </div>
      )}
    </div>
  );
}
