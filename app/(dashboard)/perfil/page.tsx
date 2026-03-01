"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Profile, Subscription, Purchase } from "@/lib/types";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [newName, setNewName] = useState("");
  
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile as Profile);
          setNewName(profile.name || "");
        }

        // 2. Fetch Active Subscriptions
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', session.user.id)
          .eq('status', 'active');
        
        if (subs) setSubscriptions(subs as any[]);

        // 3. Fetch Purchases
        const { data: buys } = await supabase
          .from('purchases')
          .select('*, course:courses(title)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (buys) setPurchases(buys as any[]);
      }
      
      setIsLoading(false);
    };

    fetchUserData();
  }, [supabase]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      alert("Error al actualizar contraseña: " + error.message);
    } else {
      alert("Contraseña actualizada con éxito");
      setCurrentPassword("");
      setNewPassword("");
    }
    setIsUpdatingPassword(false);
  };

  const handleNameUpdate = async () => {
    if (!newName.trim() || !userProfile) return;
    setIsUpdatingName(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', userProfile.id);
    
    if (error) {
      alert("Error al actualizar nombre: " + error.message);
    } else {
      setUserProfile({ ...userProfile, name: newName });
      alert("Nombre actualizado con éxito");
    }
    setIsUpdatingName(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400">Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Mi Perfil</h1>
        <p className="text-gray-400">Administra tu información personal y configuración de cuenta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          {/* Main Info */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Información Básica</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 text-white bg-gray-950 px-4 py-3 rounded-lg border border-gray-800 focus:border-blue-500 outline-none transition-colors"
                  />
                  <button 
                    onClick={handleNameUpdate}
                    disabled={isUpdatingName || !newName.trim() || newName === userProfile?.name}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 rounded-lg transition-colors border border-gray-700 disabled:opacity-50"
                  >
                    {isUpdatingName ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="text-white bg-gray-950 px-4 py-3 rounded-lg border border-gray-800 flex justify-between items-center">
                  <span>{userProfile?.email}</span>
                  <Badge variant="success" className="text-[10px] uppercase">Verificado</Badge>
                </div>
              </div>
            </div>
          </section>

          {/* Password Update */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Cambiar Contraseña</h2>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nueva contraseña</label>
                <input 
                   type="password" 
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none"
                   required
                   placeholder="Mínimo 8 caracteres"
                 />
              </div>
              <button 
                type="submit" 
                disabled={isUpdatingPassword || newPassword.length < 8}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors border border-gray-700 disabled:opacity-50"
              >
                {isUpdatingPassword ? "Actualizando..." : "Actualizar"}
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-8">
          {/* Subscription Status */}
          {subscriptions.length > 0 ? (
            subscriptions.map(sub => (
              <section key={sub.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900 border border-blue-900/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <IconCheck size={100} />
                </div>
                
                <Badge className="bg-blue-600 mb-4">{sub.plan?.name}</Badge>
                <h2 className="text-2xl font-bold text-white mb-2">{sub.plan?.name}</h2>
                <p className="text-blue-200 mb-6 text-sm">Próxima renovación: {new Date(sub.end_date).toLocaleDateString()}</p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <IconCheck size={16} className="text-blue-400" /> Acceso completo a la plataforma
                  </div>
                </div>

                <button className="bg-gray-900 text-white font-medium py-2 px-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm w-full sm:w-auto text-center">
                  Gestionar Suscripción
                </button>
              </section>
            ))
          ) : (
            <section className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-8 text-center">
              <p className="text-gray-500 mb-4">No tienes una suscripción activa.</p>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Ver Planes
              </button>
            </section>
          )}

          {/* Purchase History */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Historial de Compras</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-950/50 text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Concepto</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {purchases.length > 0 ? (
                    purchases.map(buy => (
                      <tr key={buy.id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-medium text-gray-300">
                          {buy.course?.title || "Compra de Curso"}
                        </td>
                        <td className="px-6 py-4">{new Date(buy.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">${buy.amount_paid}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-600 italic">
                        No has realizado compras todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
