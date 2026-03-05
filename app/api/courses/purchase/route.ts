import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { courseId } = await request.json();
        if (!courseId) {
            return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: () => { },
                },
            }
        );

        // 1. Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Use Service Role to bypass RLS and create purchase
        // We need a separate client for service role
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: () => { },
                },
            }
        );

        // Check if purchase already exists
        const { data: existing } = await supabaseAdmin
            .from("purchases")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ message: "Course already owned" });
        }

        // Get course price
        const { data: course } = await supabaseAdmin
            .from("courses")
            .select("price")
            .eq("id", courseId)
            .single();

        // 3. Insert simulated purchase
        const { error: insertError } = await supabaseAdmin.from("purchases").insert({
            user_id: user.id,
            course_id: courseId,
            amount_paid: course?.price || 0,
            status: "paid",
            currency: "USD",
            transaction_id: `sim_${Date.now()}`
        });

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({ success: true, message: "Course unlocked successfully" });
    } catch (error: any) {
        console.error("Purchase error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
