"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SubscriptionPlan, Course } from "@/lib/types";
import { IconLoader2, IconCheck, IconAlertTriangle, IconPlus, IconX } from "@tabler/icons-react";

interface SubscriptionPlanFormProps {
  initialData?: SubscriptionPlan;
  mode: "create" | "edit";
}

interface FormState {
  name: string;
  description: string;
  price: string;
  plan_type: "standard" | "lifetime";
  duration_preset: "30" | "90" | "365" | "lifetime" | "custom";
  custom_duration: string;
  is_active: boolean;
  features: string[];
  selected_course_ids: string[];
}

export default function SubscriptionPlanForm({ initialData, mode }: SubscriptionPlanFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // Helper para determinar preset inicial
  const getInitialPreset = (days: number | null, type: string) => {
    if (type === "lifetime") return "lifetime";
    if (days === 30) return "30";
    if (days === 90) return "90";
    if (days === 365) return "365";
    return "custom";
  };

  const [form, setForm] = useState<FormState>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    plan_type: initialData?.plan_type || "standard",
    duration_preset: initialData ? getInitialPreset(initialData.duration_days, initialData.plan_type) : "30",
    custom_duration: initialData && initialData.plan_type === "standard" && 
                     ![30, 90, 365].includes(initialData.duration_days || 0) ? 
                     initialData.duration_days?.toString() || "" : "",
    is_active: initialData?.is_active ?? true,
    features: initialData?.features || [],
    selected_course_ids: initialData?.courses?.map(c => c.id) || [],
  });

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("is_published", true)
        .order("title");
      
      if (data) {
        setAvailableCourses(data as Course[]);
      }
      setIsLoadingCourses(false);
    };
    fetchCourses();
  }, [supabase]);

  const handleFieldChange = (field: keyof FormState, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-ajustes al cambiar el tipo de plan o preset
      if (field === "plan_type" && value === "lifetime") {
        updated.duration_preset = "lifetime";
      } else if (field === "plan_type" && value === "standard" && prev.duration_preset === "lifetime") {
        updated.duration_preset = "30";
      }

      if (field === "duration_preset" && value === "lifetime") {
        updated.plan_type = "lifetime";
      }

      // Validar precio (solo números enteros permitidos, según requerimiento del usuario)
      if (field === "price") {
        const numericValue = value.replace(/[^0-9]/g, '');
        updated.price = numericValue;
      }

      return updated;
    });
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const toggleCourseSelection = (courseId: string) => {
    setForm(prev => {
      const current = prev.selected_course_ids;
      if (current.includes(courseId)) {
        return { ...prev, selected_course_ids: current.filter(id => id !== courseId) };
      } else {
        return { ...prev, selected_course_ids: [...current, courseId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.name.trim()) { setErrorMsg("El nombre es requerido."); return; }
    if (!form.price) { setErrorMsg("El precio es requerido."); return; }
    
    let durationDays: number | null = null;
    if (form.plan_type === "standard") {
      if (form.duration_preset === "custom") {
        durationDays = parseInt(form.custom_duration);
        if (!durationDays || durationDays <= 0) {
          setErrorMsg("Debe especificar una duración válida en días."); return;
        }
      } else {
        durationDays = parseInt(form.duration_preset);
      }
    }

    setIsSaving(true);

    const planPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseInt(form.price),
      duration_days: durationDays,
      plan_type: form.plan_type,
      is_active: form.is_active,
      features: form.features,
    };

    try {
      let createdPlanId = initialData?.id;

      if (mode === "create") {
        const { data, error } = await supabase
          .from("subscription_plans")
          .insert([planPayload])
          .select()
          .single();
        if (error) throw error;
        createdPlanId = data.id;
      } else {
        const { error } = await supabase
          .from("subscription_plans")
          .update(planPayload)
          .eq("id", initialData!.id!);
        if (error) throw error;
      }

      // Sincronizar cursos asociados si es un plan standard
      if (form.plan_type === "standard" && createdPlanId) {
        // Eliminar asociaciones actuales
        if (mode === "edit") {
          await supabase
            .from("subscription_plan_courses")
            .delete()
            .eq("plan_id", createdPlanId);
        }

        // Insertar nuevas
        if (form.selected_course_ids.length > 0) {
          const links = form.selected_course_ids.map(course_id => ({
            plan_id: createdPlanId,
            course_id
          }));
          const { error: linkError } = await supabase
            .from("subscription_plan_courses")
            .insert(links);
          if (linkError) throw linkError;
        }
      }

      setSuccessMsg(mode === "create" ? "Plan creado con éxito." : "Plan actualizado con éxito.");
      setTimeout(() => router.push("/admin/suscripciones"), 1500);

    } catch (err: any) {
      setErrorMsg(err.message || err.details || "Ocurrió un error al guardar.");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          <IconAlertTriangle size={18} className="shrink-0" />
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl">
          <IconCheck size={18} className="shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Detalles del Plan</h2>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre del Plan</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Ej: Suscripción Mensual PRO"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Descripción</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Breve descripción para la tarjeta de precio..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Precio (Solo números, sin puntos)</label>
              <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-500">
                <span className="px-4 text-gray-500 font-bold">$</span>
                <input
                  type="text"
                  required
                  pattern="\d*"
                  value={form.price}
                  onChange={(e) => handleFieldChange("price", e.target.value)}
                  placeholder="20000"
                  className="flex-1 bg-transparent py-3 text-white outline-none"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Plan Activo</p>
                <p className="text-xs text-gray-500">Visible para los usuarios</p>
              </div>
              <div
                onClick={() => handleFieldChange("is_active", !form.is_active)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-blue-600" : "bg-gray-700"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.is_active ? "translate-x-5" : ""}`} />
              </div>
            </label>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Tipo y Duración</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFieldChange("plan_type", "standard")}
                className={`py-3 rounded-xl text-sm font-bold border transition-colors ${form.plan_type === "standard" ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"}`}
              >
                Plan Estándar (Tiempo Lim.)
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange("plan_type", "lifetime")}
                className={`py-3 rounded-xl text-sm font-bold border transition-colors ${form.plan_type === "lifetime" ? "bg-purple-600/20 border-purple-500 text-purple-400" : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"}`}
              >
                De Por Vida (Full Access)
              </button>
            </div>

            {form.plan_type === "standard" && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Duración del acceso</label>
                <select
                  value={form.duration_preset}
                  onChange={(e) => handleFieldChange("duration_preset", e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                >
                  <option value="30">Mensual (30 días)</option>
                  <option value="90">Trimestral (90 días)</option>
                  <option value="365">Anual (365 días)</option>
                  <option value="custom">Personalizado (días exactos)</option>
                </select>

                {form.duration_preset === "custom" && (
                  <div className="mt-3">
                    <input
                      type="number"
                      min={1}
                      placeholder="Ej: 15"
                      value={form.custom_duration}
                      onChange={(e) => handleFieldChange("custom_duration", e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none"
                    />
                  </div>
                )}
              </div>
            )}
            
            {form.plan_type === "lifetime" && (
              <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl text-sm text-purple-300">
                Este plan no expirará y otorgará acceso a todo el catálogo de forma vitalicia.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Características (Checklist)</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                placeholder="Ej: Acceso a 4 cursos..."
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-xl transition-colors"
                title="Añadir a la lista"
              >
                <IconPlus size={20} />
              </button>
            </div>
            
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {form.features.length === 0 ? (
                <li className="text-gray-500 text-sm italic text-center py-2">No hay características añadidas.</li>
              ) : (
                form.features.map((feat, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <IconCheck size={16} className="text-emerald-500 shrink-0" />
                      {feat}
                    </div>
                    <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-400 p-1">
                      <IconX size={16} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {form.plan_type === "standard" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 h-[340px] flex flex-col">
              <div>
                <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Cursos Incluidos</h2>
                <p className="text-xs text-gray-500 mt-2">Selecciona qué cursos estarán disponibles con este plan.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {isLoadingCourses ? (
                  <div className="flex items-center justify-center p-4 text-gray-500">
                    <IconLoader2 size={24} className="animate-spin" />
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center pt-4">No hay cursos publicados.</div>
                ) : (
                  availableCourses.map(course => {
                    const isSelected = form.selected_course_ids.includes(course.id);
                    return (
                      <div 
                        key={course.id}
                        onClick={() => toggleCourseSelection(course.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-colors ${isSelected ? "bg-blue-600/10 border-blue-500/50" : "bg-gray-950 border-gray-800 hover:border-gray-600"}`}
                      >
                        <span className={`text-sm ${isSelected ? "text-white font-medium" : "text-gray-400"}`}>
                          {course.title}
                        </span>
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isSelected ? "bg-blue-500 text-white" : "border border-gray-600"}`}>
                          {isSelected && <IconCheck size={14} />}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
        <button
          type="button"
          onClick={() => router.push("/admin/suscripciones")}
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <IconLoader2 size={18} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <IconCheck size={18} />
              {mode === "create" ? "Crear Plan" : "Guardar Cambios"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
