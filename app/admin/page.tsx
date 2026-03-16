"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import { IconCurrencyDollar, IconUsers, IconCalendarStar, IconVideo, IconLoader2 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    users: 0,
    subscriptions: 0,
    courses: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      
      // 1. Fetch Stats
      const [
        { count: userCount },
        { count: courseCount },
        { data: purchaseData },
        { count: subCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('purchases').select('amount_paid').eq('status', 'paid'),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      const totalRevenue = purchaseData?.reduce((acc, curr) => acc + (Number(curr.amount_paid) || 0), 0) || 0;

      setStats({
        revenue: totalRevenue,
        users: userCount || 0,
        subscriptions: subCount || 0,
        courses: courseCount || 0
      });

      // 2. Recent Activity (Recent Purchases)
      const { data: activity } = await supabase
        .from('purchases')
        .select(`
          id,
          amount_paid,
          created_at,
          profiles (name),
          courses (title)
        `)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (activity) {
        setRecentActivity(activity.map(a => ({
          id: a.id,
          user: (a.profiles as any)?.name || 'Anónimo',
          action: `Compró ${(a.courses as any)?.title || 'Curso'}`,
          date: new Date(a.created_at).toLocaleDateString(),
          amount: `$${a.amount_paid}`
        })));
      }

      // 3. Top Courses Aggregation (Agrupar todas las compras por curso)
      const { data: allPaid } = await supabase
        .from('purchases')
        .select(`
          amount_paid,
          courses (id, title)
        `)
        .eq('status', 'paid');
        
      const courseStats = new Map();
      
      if (allPaid) {
        allPaid.forEach((p: any) => {
          if (!p.courses) return;
          const cid = p.courses.id;
          if (!courseStats.has(cid)) {
            courseStats.set(cid, {
              id: cid,
              title: p.courses.title,
              salesCount: 0,
              revenue: 0
            });
          }
          const st = courseStats.get(cid);
          st.salesCount += 1;
          st.revenue += (Number(p.amount_paid) || 0);
        });
      }

      const popularCourses = Array.from(courseStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      setTopCourses(popularCourses);
      
      setIsLoading(false);
    };

    fetchAdminData();
  }, [supabase]);

  const columns = [
    { key: "user", header: "Usuario" },
    { key: "action", header: "Actividad" },
    { key: "amount", header: "Ingreso", render: (item: any) => (
      <span className={item.amount !== "-" ? "text-emerald-400 font-medium" : "text-gray-500"}>
        {item.amount}
      </span>
    )},
    { key: "date", header: "Fecha" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Resumen General</h1>
        <p className="text-gray-400">Métricas principales y actividad reciente de la academia.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
          <IconLoader2 size={48} className="animate-spin text-red-500 mb-4" />
          <p className="text-xl">Cargando métricas...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              title="Ingresos Totales" 
              value={`$${stats.revenue.toLocaleString()}`} 
              icon={<IconCurrencyDollar size={24} />} 
              trend={{ value: "Live", isPositive: true }}
            />
            <StatCard 
              title="Usuarios Totales" 
              value={stats.users.toString()} 
              icon={<IconUsers size={24} />} 
            />
            <StatCard 
              title="Suscripciones Activas" 
              value={stats.subscriptions.toString()} 
              icon={<IconCalendarStar size={24} />} 
            />
            <StatCard 
              title="Cursos Pub." 
              value={stats.courses.toString()} 
              icon={<IconVideo size={24} />} 
            />
          </div>

          {/* Top Content & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
                  <p className="text-sm text-gray-500 mt-1">Últimas 10 compras realizadas en la plataforma.</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-right">
                  <p className="text-xs text-gray-500 font-medium">Ventas Históricas</p>
                  <p className="text-emerald-400 font-bold text-lg">${stats.revenue.toLocaleString()}</p>
                </div>
              </div>
              <DataTable columns={columns} data={recentActivity} />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Cursos Populares</h2>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
                {topCourses.length > 0 ? topCourses.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center font-bold text-blue-500 border border-gray-800 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.salesCount} {c.salesCount === 1 ? 'venta' : 'ventas'}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-sm font-bold text-emerald-400">${c.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm p-4 text-center italic">No hay cursos publicados aún.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    
    </div>
  );
}
