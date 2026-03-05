import { NextRequest, NextResponse } from "next/server";

const BUNNY_API_KEY = process.env.BUNNY_API_KEY!;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;

export async function POST(req: NextRequest) {
    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
        return NextResponse.json(
            { error: "Bunny.net no está configurado. Agrega BUNNY_API_KEY y BUNNY_LIBRARY_ID al .env.local" },
            { status: 500 }
        );
    }

    const formData = await req.formData();
    const file = formData.get("video") as File | null;
    const title = formData.get("title") as string | null;

    if (!file) {
        return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    try {
        // Step 1: Create a new video object in Bunny
        const createRes = await fetch(
            `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
            {
                method: "POST",
                headers: {
                    AccessKey: BUNNY_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: title || file.name }),
            }
        );

        if (!createRes.ok) {
            const err = await createRes.text();
            return NextResponse.json({ error: `Error creando video en Bunny: ${err}` }, { status: 502 });
        }

        const { guid: videoId } = await createRes.json();

        // Step 2: Upload the video file
        const arrayBuffer = await file.arrayBuffer();
        const uploadRes = await fetch(
            `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
            {
                method: "PUT",
                headers: {
                    AccessKey: BUNNY_API_KEY,
                    "Content-Type": "application/octet-stream",
                },
                body: arrayBuffer,
            }
        );

        if (!uploadRes.ok) {
            const err = await uploadRes.text();
            return NextResponse.json({ error: `Error subiendo video a Bunny: ${err}` }, { status: 502 });
        }

        return NextResponse.json({ videoId, libraryId: BUNNY_LIBRARY_ID });
    } catch (error) {
        console.error("Bunny upload error:", error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}
