"use client";

import { useState, useEffect } from "react";
import { Achievement } from "@/lib/types";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconLoader2, 
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
  IconX,
  IconCheck
} from "@tabler/icons-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const AVAILABLE_ICONS = [
  { id: "IconTrophy", component: IconTrophy },
  { id: "IconAward", component: IconAward },
  { id: "IconStar", component: IconStar },
  { id: "IconFlame", component: IconFlame },
  { id: "IconRocket", component: IconRocket },
  { id: "IconCertificate", component: IconCertificate },
  { id: "IconTarget", component: IconTarget },
  { id: "IconSchool", component: IconSchool },
  { id: "IconCrown", component: IconCrown },
  { id: "IconMedal", component: IconMedal },
];

const CONDITION_TYPES = [
  { id: "purchases", label: "Cursos Comprados", description: "Se desbloquea cuando el usuario compra N cursos." },
  { id: "completions", label: "Cursos Completados", description: "Se desbloquea cuando el usuario completa N cursos." },
  { id: "subscription_active", label: "Suscripción Activa", description: "Se desbloquea si el usuario tiene una suscripción vigente.", hideValue: true },
  { id: "account_age", label: "Antigüedad (Días)", description: "Se desbloquea cuando la cuenta cumple N días." },
];

const PALETTE_COLORS = [
  { id: "blue", label: "Azul", hex: "#3b82f6", bg: "bg-blue-600" },
  { id: "emerald", label: "Esmeralda", hex: "#10b981", bg: "bg-emerald-600" },
  { id: "rose", label: "Rosa", hex: "#f43f5e", bg: "bg-rose-600" },
  { id: "amber", label: "Ámbar", hex: "#f59e0b", bg: "bg-amber-600" },
  { id: "violet", label: "Violeta", hex: "#8b5cf6", bg: "bg-violet-600" },
  { id: "orange", label: "Naranja", hex: "#f97316", bg: "bg-orange-600" },
  { id: "cyan", label: "Cian", hex: "#06b6d4", bg: "bg-cyan-600" },
  { id: "red", label: "Rojo", hex: "#ef4444", bg: "bg-red-600" },
];

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon_url: "IconTrophy",
    hex_color: "#3b82f6",
    condition_type: "purchases",
    condition_value: 1
  });

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    fetchAchievements();
  }, [supabase]);

  const fetchAchievements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAchievements(data as Achievement[]);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (achievement?: Achievement) => {
    if (achievement) {
      setEditingAchievement(achievement);
      setFormData({
        title: achievement.title,
        description: achievement.description || "",
        icon_url: achievement.icon_url || "IconTrophy",
        hex_color: achievement.hex_color || "#3b82f6",
        condition_type: achievement.condition_type,
        condition_value: achievement.condition_value
      });
    } else {
      setEditingAchievement(null);
      setFormData({
        title: "",
        description: "",
        icon_url: "IconTrophy",
        hex_color: "#3b82f6",
        condition_type: "purchases",
        condition_value: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      condition_value: formData.condition_type === "subscription_active" ? 1 : formData.condition_value
    };

    if (editingAchievement) {
      const { error } = await supabase
        .from('achievements')
        .update(payload)
        .eq('id', editingAchievement.id);
      
      if (error) alert("Error al actualizar: " + error.message);
    } else {
      const { error } = await supabase
        .from('achievements')
        .insert([payload]);
      
      if (error) alert("Error al crear: " + error.message);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    fetchAchievements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este logro?")) return;
    
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);
    
    if (error) alert("Error al eliminar: " + error.message);
    fetchAchievements();
  };

  const columns: Column<Achievement>[] = [
    {
      key: "icon",
      header: "Icono",
      render: (ach) => {
        const IconComp = AVAILABLE_ICONS.find(i => i.id === ach.icon_url)?.component || IconTrophy;
        return (
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{ 
              backgroundColor: `${ach.hex_color}15`, 
              color: ach.hex_color,
              borderColor: `${ach.hex_color}30`
            }}
          >
            <IconComp size={24} />
          </div>
        );
      }
    },
    { 
      key: "title", 
      header: "Logro",
      render: (ach) => (
        <div className="flex flex-col">
          <span className="font-bold text-white mb-0.5">{ach.title}</span>
          <span className="text-xs text-gray-500 max-w-[200px] truncate">{ach.description}</span>
        </div>
      )
    },
    { 
      key: "condition", 
      header: "Condición",
      render: (ach) => {
        const type = CONDITION_TYPES.find(t => t.id === ach.condition_type);
        return (
          <div className="flex flex-col">
            <Badge variant="secondary" className="mb-1">{type?.label}</Badge>
            {ach.condition_type !== "subscription_active" && (
              <span className="text-xs text-gray-400">Valor: {ach.condition_value}</span>
            )}
          </div>
        );
      }
    },
    { 
      key: "actions", 
      header: "Acciones",
      render: (ach) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenModal(ach)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 rounded transition-colors"
          >
            <IconEdit size={16} />
          </button>
          <button 
            onClick={() => handleDelete(ach.id)}
            className="p-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 hover:text-red-400 rounded transition-colors"
          >
            <IconTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Gestión de Logros</h1>
          <p className="text-gray-400">Configura medallas y condiciones de desbloqueo automático.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus size={20} />
          <span>Nuevo Logro</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed w-full">
          <IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <p className="text-xl">Cargando logros...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={achievements} 
          emptyMessage="No hay logros configurados todavía."
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-950 z-10">
              <h2 className="text-xl font-bold text-white">
                {editingAchievement ? "Editar Logro" : "Crear Nuevo Logro"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <IconX size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Título del Logro</label>
                    <input 
                      type="text" 
                      required
                      maxLength={100}
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ej: Primer Paso"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Descripción</label>
                    <textarea 
                      rows={3}
                      maxLength={500}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Explica cómo se obtiene este logro..."
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 text-center uppercase tracking-widest text-[10px]">1. Selecciona un Icono</label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVAILABLE_ICONS.map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => setFormData({...formData, icon_url: icon.id})}
                        className={`
                          p-3 rounded-xl border flex flex-col items-center justify-center transition-all relative
                          ${formData.icon_url === icon.id 
                            ? "border-blue-400 text-white scale-105 shadow-lg shadow-blue-900/40" 
                            : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"}
                        `}
                        style={formData.icon_url === icon.id ? { backgroundColor: formData.hex_color } : {}}
                      >
                        <icon.component size={20} />
                        {formData.icon_url === icon.id && (
                          <div className="absolute -top-1 -right-1 bg-white text-blue-600 rounded-full w-4 h-4 flex items-center justify-center border border-blue-600">
                            <IconCheck size={10} stroke={4} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Color Palette Selector */}
                  <label className="block text-sm font-medium text-gray-400 mb-3 mt-6 text-center uppercase tracking-widest text-[10px]">2. Elige un Color</label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {PALETTE_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setFormData({...formData, hex_color: color.hex})}
                        title={color.label}
                        className={`
                          w-8 h-8 rounded-full transition-all border-2
                          ${color.bg}
                          ${formData.hex_color === color.hex 
                            ? "border-white scale-110 shadow-lg" 
                            : "border-transparent opacity-60 hover:opacity-100"}
                        `}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Regla de Desbloqueo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="md:col-span-7">
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Tipo de Métrica</label>
                    <div className="space-y-2">
                      {CONDITION_TYPES.map((type) => (
                        <label 
                          key={type.id}
                          className={`
                            flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                            ${formData.condition_type === type.id 
                              ? "bg-blue-900/20 border-blue-500/50 ring-1 ring-blue-500/20" 
                              : "bg-gray-950 border-gray-800 hover:border-gray-700"}
                          `}
                        >
                          <input 
                            type="radio" 
                            name="condition_type" 
                            value={type.id}
                            checked={formData.condition_type === type.id}
                            onChange={() => setFormData({...formData, condition_type: type.id})}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.condition_type === type.id ? "border-blue-500" : "border-gray-700"}`}>
                            {formData.condition_type === type.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none mb-1">{type.label}</p>
                            <p className="text-[10px] text-gray-500 leading-none">{type.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    {formData.condition_type !== "subscription_active" ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Valor Requerido (N)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min={1}
                            step="1"
                            value={formData.condition_value}
                            onChange={(e) => setFormData({...formData, condition_value: parseInt(e.target.value) || 1})}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-2xl font-black text-blue-400 focus:border-blue-500 outline-none"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold uppercase text-[10px] tracking-widest">
                            Unidades
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-center">
                        <IconCheck className="mx-auto text-green-500 mb-2" size={32} />
                        <p className="text-xs text-gray-400">Este logro se desbloquea al tener cualquier suscripción activa.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 sticky bottom-0 bg-gray-950 py-4 border-t border-gray-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl border border-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {isSaving ? (
                    <>
                      <IconLoader2 size={20} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <span>{editingAchievement ? "Guardar Cambios" : "Crear Logro"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
