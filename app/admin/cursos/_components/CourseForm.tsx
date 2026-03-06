"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Course, Category } from "@/lib/types";
import { useEffect } from "react";
import Link from "next/link";
import {
  IconUpload,
  IconVideo,
  IconLink,
  IconLoader2,
  IconCheck,
  IconX,
  IconPhoto,
  IconAlertTriangle,
} from "@tabler/icons-react";

const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface CourseFormProps {
  initialData?: Partial<Course>;
  mode: "create" | "edit";
}

interface FormState {
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  bunny_video_id: string;
  thumbnail_url: string;
  price: string;
  is_free: boolean;
  included_in_subscription: boolean;
  is_published: boolean;
  featured: boolean;
  category_id: string;
  order_index: string;
}

export default function CourseForm({ initialData, mode }: CourseFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [form, setForm] = useState<FormState>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    short_description: initialData?.short_description || "",
    full_description: initialData?.full_description || "",
    bunny_video_id: initialData?.bunny_video_id || "",
    thumbnail_url: initialData?.thumbnail_url || "",
    price: initialData?.price?.toString() || "0",
    is_free: initialData?.is_free ?? false,
    included_in_subscription: initialData?.included_in_subscription ?? false,
    is_published: initialData?.is_published ?? false,
    featured: initialData?.featured ?? false,
    category_id: initialData?.category_id || "",
    order_index: initialData?.order_index?.toString() || "0",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      
      if (!error && data) {
        setCategories(data);
        // If create mode and no category selected, select the first one
        if (mode === "create" && !form.category_id && data.length > 0) {
          setForm(prev => ({ ...prev, category_id: data[0].id }));
        }
      }
      setIsLoadingCategories(false);
    };

    fetchCategories();
  }, [supabase, mode]);

  // Video state
  const [videoMode, setVideoMode] = useState<"id" | "upload">("id");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadDone, setVideoUploadDone] = useState(false);
  // Stores the videoId returned by Bunny after a successful upload
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);

  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(initialData?.thumbnail_url || "");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  // General state
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = useCallback(
    (field: keyof FormState, value: string | boolean) => {
      setForm((prev) => {
        const updated = { ...prev, [field]: value };
        // Auto-generate slug from title
        if (field === "title" && typeof value === "string" && mode === "create") {
          updated.slug = generateSlug(value);
        }
        return updated;
      });
    },
    [mode]
  );

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile) return form.thumbnail_url || null;
    setIsUploadingThumbnail(true);
    try {
      const data = new FormData();
      data.append("thumbnail", thumbnailFile);
      const res = await fetch("/api/supabase/upload-thumbnail", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al subir imagen");
      return json.url as string;
    } catch (err: any) {
      setErrorMsg(err.message);
      return null;
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoUploadDone(false);
    setVideoUploadProgress(0);
  };

  const uploadVideo = async (): Promise<string | null> => {
    if (!videoFile) return null;
    setIsUploadingVideo(true);
    setVideoUploadProgress(10);
    try {
      const data = new FormData();
      data.append("video", videoFile);
      data.append("title", form.title || videoFile.name);

      setVideoUploadProgress(30);

      const res = await fetch("/api/bunny/upload", {
        method: "POST",
        body: data,
      });

      setVideoUploadProgress(90);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al subir video");

      const videoId = json.videoId as string;
      setVideoUploadProgress(100);
      setVideoUploadDone(true);
      // ✅ FIX: persist the ID so handleSubmit can use it
      setUploadedVideoId(videoId);
      return videoId;
    } catch (err: any) {
      setErrorMsg(err.message);
      return null;
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.title.trim()) { setErrorMsg("El título es requerido."); return; }
    if (!form.slug.trim()) { setErrorMsg("El slug es requerido."); return; }
    if (!form.category_id) { setErrorMsg("La categoría es requerida."); return; }
    if (!form.is_free && parseFloat(form.price) < 0) {
      setErrorMsg("El precio no puede ser negativo."); return;
    }

    setIsSaving(true);

    // 1. Upload thumbnail if changed
    let finalThumbnailUrl = form.thumbnail_url;
    if (thumbnailFile) {
      const uploadedUrl = await uploadThumbnail();
      if (!uploadedUrl) { setIsSaving(false); return; }
      finalThumbnailUrl = uploadedUrl;
    }

    // 2. Upload video if in upload mode
    let finalBunnyId = form.bunny_video_id;
    if (videoMode === "upload") {
      if (videoUploadDone && uploadedVideoId) {
        // Already uploaded manually — use the stored ID
        finalBunnyId = uploadedVideoId;
      } else if (videoFile && !videoUploadDone) {
        // Not uploaded yet — upload now
        const uploadedId = await uploadVideo();
        if (!uploadedId) { setIsSaving(false); return; }
        finalBunnyId = uploadedId;
      }
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      short_description: form.short_description.trim(),
      full_description: form.full_description.trim(),
      bunny_video_id: finalBunnyId,
      thumbnail_url: finalThumbnailUrl,
      price: form.is_free ? 0 : parseFloat(form.price) || 0,
      is_free: form.is_free,
      included_in_subscription: form.included_in_subscription,
      is_published: form.is_published,
      featured: form.featured,
      category_id: form.category_id,
      order_index: parseInt(form.order_index) || 0,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (mode === "create") {
      const result = await supabase.from("courses").insert([payload]);
      error = result.error;
    } else {
      const result = await supabase
        .from("courses")
        .update(payload)
        .eq("id", initialData!.id!);
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg(mode === "create" ? "Curso creado con éxito." : "Curso actualizado con éxito.");
    setTimeout(() => router.push("/admin/cursos"), 1500);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN — Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Información Básica</h2>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Título del Curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={form.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Ej: Introducción al MMA"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                <span className="px-3 py-3 text-gray-600 text-sm border-r border-gray-800">/cursos/</span>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={form.slug}
                  onChange={(e) => handleFieldChange("slug", generateSlug(e.target.value))}
                  className="flex-1 bg-transparent px-3 py-3 text-white placeholder:text-gray-600 outline-none"
                  placeholder="introduccion-al-mma"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Descripción Corta</label>
              <textarea
                rows={2}
                maxLength={500}
                value={form.short_description}
                onChange={(e) => handleFieldChange("short_description", e.target.value)}
                placeholder="Un resumen atractivo para la tarjeta del curso..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-colors resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">{form.short_description.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Descripción Completa</label>
              <textarea
                rows={6}
                maxLength={5000}
                value={form.full_description}
                onChange={(e) => handleFieldChange("full_description", e.target.value)}
                placeholder="Descripción detallada del curso, qué aprenderán los alumnos, requisitos previos..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Video del Curso (Bunny.net)</h2>

            <div className="flex gap-2 bg-gray-950 rounded-xl p-1 border border-gray-800">
              <button
                type="button"
                onClick={() => setVideoMode("id")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${videoMode === "id" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
              >
                <IconLink size={16} />
                Pegar Video ID
              </button>
              <button
                type="button"
                onClick={() => setVideoMode("upload")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${videoMode === "upload" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
              >
                <IconUpload size={16} />
                Subir Video
              </button>
            </div>

            {videoMode === "id" ? (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Bunny Video ID</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.bunny_video_id}
                  onChange={(e) => handleFieldChange("bunny_video_id", e.target.value)}
                  placeholder="Ej: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Encontrá el Video ID en tu Bunny Stream → Library → Video → aparece en la URL o en los detalles del video.
                </p>
                {form.bunny_video_id && BUNNY_LIBRARY_ID && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-800 aspect-video">
                    <iframe
                      src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${form.bunny_video_id}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors group"
                >
                  <IconVideo size={40} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                  <div className="text-center">
                    <p className="text-gray-300 font-medium">
                      {videoFile ? videoFile.name : "Haz clic para seleccionar un video"}
                    </p>
                    <p className="text-gray-600 text-sm">MP4, MOV, AVI, MKV. Sin límite de tamaño.</p>
                  </div>
                </button>

                {videoFile && !videoUploadDone && (
                  <div className="mt-4">
                    {isUploadingVideo ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Subiendo a Bunny.net...</span>
                          <span>{videoUploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${videoUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={uploadVideo}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <IconUpload size={18} />
                        Subir Video a Bunny.net
                      </button>
                    )}
                  </div>
                )}

                {videoUploadDone && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">
                    <IconCheck size={18} />
                    Video subido correctamente. El ID se guardará al guardar el curso.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Thumbnail, Settings */}
        <div className="space-y-6">

          {/* Thumbnail */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Imagen de Portada</h2>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailChange}
              className="hidden"
            />

            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-700 hover:border-blue-500 cursor-pointer aspect-video transition-colors group"
            >
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Cambiar imagen</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                  <IconPhoto size={36} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                  <p className="text-gray-500 text-sm text-center group-hover:text-gray-300 transition-colors">
                    Haz clic para subir una imagen
                  </p>
                  <p className="text-gray-700 text-xs">JPG, PNG, WebP · Máx 5MB</p>
                </div>
              )}
              {isUploadingThumbnail && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <IconLoader2 size={32} className="animate-spin text-blue-400" />
                </div>
              )}
            </div>

            {thumbnailFile && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <IconPhoto size={14} />
                <span className="truncate">{thumbnailFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setThumbnailFile(null); setThumbnailPreview(initialData?.thumbnail_url || ""); }}
                  className="ml-auto text-red-500 hover:text-red-400"
                >
                  <IconX size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Course Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Configuración</h2>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Categoría <span className="text-red-500">*</span>
              </label>
              {isLoadingCategories ? (
                <div className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-2 text-gray-500 text-sm">
                  <IconLoader2 size={16} className="animate-spin" />
                  Cargando categorías...
                </div>
              ) : categories.length > 0 ? (
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => handleFieldChange("category_id", e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="" disabled>Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs">
                  No hay categorías disponibles. <Link href="/admin/categorias/nuevo" className="underline font-bold">Crea una aquí</Link>.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Orden</label>
              <input
                type="number"
                min={0}
                step="1"
                maxLength={5}
                value={form.order_index}
                onChange={(e) => handleFieldChange("order_index", e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Pricing */}
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleFieldChange("is_free", true)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${form.is_free ? "bg-emerald-600 text-white" : "bg-gray-950 text-gray-400 hover:text-white"}`}
                >
                  Gratis
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange("is_free", false)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${!form.is_free ? "bg-blue-600 text-white" : "bg-gray-950 text-gray-400 hover:text-white"}`}
                >
                  De Pago
                </button>
              </div>
              {!form.is_free && (
                <div className="p-4 bg-gray-950">
                  <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                    <span className="px-3 text-gray-500 font-bold text-lg">$</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(e) => handleFieldChange("price", e.target.value)}
                      className="flex-1 bg-transparent px-2 py-2.5 text-white text-lg font-bold outline-none"
                      placeholder="29.99"
                    />
                    <span className="px-3 text-gray-600 text-sm">USD</span>
                  </div>
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { key: "included_in_subscription" as keyof FormState, label: "Incluido en suscripción", desc: "Disponible con plan activo" },
                { key: "is_published" as keyof FormState, label: "Publicado", desc: "Visible en el catálogo" },
                { key: "featured" as keyof FormState, label: "Destacado", desc: "Aparece en la página principal" },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <div
                    onClick={() => handleFieldChange(key, !form[key])}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form[key] ? "bg-blue-600" : "bg-gray-700"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form[key] ? "translate-x-5" : ""}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
        <button
          type="button"
          onClick={() => router.push("/admin/cursos")}
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving || isUploadingThumbnail || isUploadingVideo}
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <IconLoader2 size={18} className="animate-spin" />
              {isUploadingThumbnail ? "Subiendo imagen..." : isUploadingVideo ? "Subiendo video..." : "Guardando..."}
            </>
          ) : (
            <>
              <IconCheck size={18} />
              {mode === "create" ? "Crear Curso" : "Guardar Cambios"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
