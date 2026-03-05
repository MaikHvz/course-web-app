import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
            { error: "Supabase Service Role Key no está configurado." },
            { status: 500 }
        );
    }

    const formData = await req.formData();
    const file = formData.get("thumbnail") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
            { error: "Tipo de archivo no permitido. Solo se permiten JPEG, PNG, WebP y GIF." },
            { status: 400 }
        );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
            { error: "El archivo supera el tamaño máximo de 5MB." },
            { status: 400 }
        );
    }

    try {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error } = await supabaseAdmin.storage
            .from("course-thumbnails")
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabaseAdmin.storage
            .from("course-thumbnails")
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrlData.publicUrl });
    } catch (error) {
        console.error("Thumbnail upload error:", error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}
