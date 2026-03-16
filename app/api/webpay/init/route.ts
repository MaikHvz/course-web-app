import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { webpayTransaction } from "@/lib/webpay";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    // Acepta courseId O planId — NUNCA el precio desde el cliente
    const { courseId, planId } = await request.json();

    if (!courseId && !planId) {
      return NextResponse.json({ error: "Se requiere courseId o planId" }, { status: 400 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Zero Trust: URL de retorno desde variable de entorno, NUNCA del header Host
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;
    const returnUrl = `${appUrl}/api/webpay/confirm`;

    // ─── FLUJO: COMPRA DE CURSO INDIVIDUAL ───────────────────────────────────
    if (courseId) {
      // Verificar si ya tiene el curso
      const { data: existing } = await supabaseAdmin
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "paid")
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ message: "Ya tienes acceso a este curso" });
      }

      // Zero Trust: precio directo de la BD
      const { data: course } = await supabaseAdmin
        .from("courses")
        .select("price, is_free, slug")
        .eq("id", courseId)
        .single();

      if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });

      if (course.is_free || course.price === 0) {
        await supabaseAdmin.from("purchases").insert({
          user_id: user.id,
          course_id: courseId,
          amount_paid: 0,
          status: "paid",
          currency: "CLP",
          transaction_id: `free_${Date.now()}`
        });
        return NextResponse.json({ success: true, message: "Acceso gratuito otorgado" });
      }

      const buyOrder = `CO-${randomUUID().slice(0, 12)}`;
      const sessionId = `SES-${randomUUID().slice(0, 12)}`;
      const amount = Math.round(Number(course.price));

      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: "El precio del curso no es válido" }, { status: 400 });
      }

      let createResponse;
      try {
        createResponse = await webpayTransaction.create(buyOrder, sessionId, amount, returnUrl);
      } catch (e: any) {
        console.error("Transbank create error:", e);
        return NextResponse.json({ error: "Error al iniciar pago con Transbank" }, { status: 500 });
      }

      await supabaseAdmin.from("webpay_transactions").insert({
        user_id: user.id,
        course_id: courseId,
        plan_id: null,
        buy_order: buyOrder,
        session_id: sessionId,
        token_ws: createResponse.token,
        amount: amount,
        status: "INITIALIZED"
      });

      return NextResponse.json({ url: createResponse.url, token: createResponse.token });
    }

    // ─── FLUJO: COMPRA DE PLAN DE SUSCRIPCIÓN ────────────────────────────────
    if (planId) {
      // Zero Trust: obtener precio y duración directamente desde BD
      const { data: plan } = await supabaseAdmin
        .from("subscription_plans")
        .select("price, duration_days, plan_type, name, is_active")
        .eq("id", planId)
        .single();

      if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
      if (!plan.is_active) return NextResponse.json({ error: "Plan no disponible" }, { status: 400 });

      // Verificar si ya tiene una suscripción activa y no expirada para este plan
      const { data: activeSub } = await supabaseAdmin
        .from("subscriptions")
        .select("id, end_date")
        .eq("user_id", user.id)
        .eq("plan_id", planId)
        .eq("status", "active")
        .maybeSingle();

      if (activeSub && (plan.plan_type === "lifetime" || new Date(activeSub.end_date) > new Date())) {
        return NextResponse.json({ message: "Ya tienes este plan activo" });
      }

      const buyOrder = `PL-${randomUUID().slice(0, 12)}`;
      const sessionId = `SES-${randomUUID().slice(0, 12)}`;
      const amount = Math.round(Number(plan.price));

      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: "El precio del plan no es válido" }, { status: 400 });
      }

      let createResponse;
      try {
        createResponse = await webpayTransaction.create(buyOrder, sessionId, amount, returnUrl);
      } catch (e: any) {
        console.error("Transbank plan create error:", e);
        return NextResponse.json({ error: "Error al iniciar pago con Transbank" }, { status: 500 });
      }

      await supabaseAdmin.from("webpay_transactions").insert({
        user_id: user.id,
        course_id: null,
        plan_id: planId,
        buy_order: buyOrder,
        session_id: sessionId,
        token_ws: createResponse.token,
        amount: amount,
        status: "INITIALIZED"
      });

      return NextResponse.json({ url: createResponse.url, token: createResponse.token });
    }

  } catch (error: any) {
    console.error("Webpay init error:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
