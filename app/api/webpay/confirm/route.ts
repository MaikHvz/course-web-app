import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { webpayTransaction } from "@/lib/webpay";

export async function GET(request: Request) {
  return handleConfirm(request);
}
export async function POST(request: Request) {
  return handleConfirm(request);
}

async function handleConfirm(request: Request) {
  const url = new URL(request.url);
  let token_ws    = url.searchParams.get("token_ws");
  let tbk_token   = url.searchParams.get("TBK_TOKEN");

  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      token_ws  = token_ws  || (formData.get("token_ws")  as string);
      tbk_token = tbk_token || (formData.get("TBK_TOKEN") as string);
    } catch (_) {}
  }

  const supabaseAdmin = await getSupabaseAdmin();

  // Pago cancelado por usuario
  if (tbk_token) {
    await supabaseAdmin.from("webpay_transactions").update({ status: "ABORTED" }).eq("token_ws", tbk_token);
    return NextResponse.redirect(new URL("/checkout/error?reason=aborted", request.url));
  }

  if (!token_ws) {
    return NextResponse.redirect(new URL("/checkout/error?reason=invalid", request.url));
  }

  // Buscar transacción registrada
  const { data: txRecord } = await supabaseAdmin
    .from("webpay_transactions")
    .select("*")
    .eq("token_ws", token_ws)
    .single();

  if (!txRecord) {
    return NextResponse.redirect(new URL("/checkout/error?reason=not_found", request.url));
  }

  // Idempotencia: ya fue procesado
  if (txRecord.status !== "INITIALIZED") {
    if (txRecord.status === "AUTHORIZED") {
      const redirectTo = txRecord.course_id
        ? `/mis-cursos/${(await supabaseAdmin.from("courses").select("slug").eq("id", txRecord.course_id).single()).data?.slug || ""}`
        : "/perfil";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL("/checkout/error?reason=already_processed", request.url));
  }

  try {
    const response = await webpayTransaction.commit(token_ws);

    if (response.response_code === 0 && response.status === "AUTHORIZED") {
      // Verificar que el monto cobrado coincida con el esperado
      if (response.amount !== txRecord.amount) {
        console.error(`AMOUNT MISMATCH: expected ${txRecord.amount}, got ${response.amount} for token ${token_ws}`);
        await supabaseAdmin.from("webpay_transactions").update({
          status: "AMOUNT_MISMATCH",
          response_code: response.response_code,
        }).eq("token_ws", token_ws);
        return NextResponse.redirect(new URL("/checkout/error?reason=amount_mismatch", request.url));
      }

      // ✅ Pago aprobado — actualizar transacción
      await supabaseAdmin.from("webpay_transactions").update({
        status: "AUTHORIZED",
        vci: response.vci,
        authorization_code: response.authorization_code,
        payment_type_code: response.payment_type_code,
        response_code: response.response_code,
        installments_number: response.installments_number,
      }).eq("token_ws", token_ws);

      // ─── Flujo A: Compra de curso ──────────────────────────────────────────
      if (txRecord.course_id) {
        await supabaseAdmin.from("purchases").insert({
          user_id: txRecord.user_id,
          course_id: txRecord.course_id,
          amount_paid: response.amount,
          status: "paid",
          currency: "CLP",
          transaction_id: response.buy_order
        });
        const { data: course } = await supabaseAdmin
          .from("courses").select("slug").eq("id", txRecord.course_id).single();
        return NextResponse.redirect(new URL(`/mis-cursos/${course?.slug}?success=true`, request.url));
      }

      // ─── Flujo B: Compra de plan de suscripción ────────────────────────────
      if (txRecord.plan_id) {
        // Zero Trust: obtenemos la duración del plan desde la BD, NUNCA del cliente
        const { data: plan } = await supabaseAdmin
          .from("subscription_plans")
          .select("duration_days, plan_type, price")
          .eq("id", txRecord.plan_id)
          .single();

        if (!plan) {
          return NextResponse.redirect(new URL("/checkout/error?reason=plan_not_found", request.url));
        }

        // Calcular fechas de inicio y fin en el servidor
        const startDate = new Date();
        let endDate: Date;

        if (plan.plan_type === "lifetime" || !plan.duration_days) {
          // Plan vitalicio: expira en 100 años (nunca efectivamente)
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 100);
        } else {
          // Plan con tiempo: exactamente duration_days en milisegundos desde ahora
          endDate = new Date(startDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);
        }

        // Desactivar suscripciones anteriores del mismo plan (si las hubiera vencidas/fallidas)
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("user_id", txRecord.user_id)
          .eq("plan_id", txRecord.plan_id)
          .neq("status", "active");

        // Registrar nueva suscripción
        const { error: subError } = await supabaseAdmin.from("subscriptions").insert({
          user_id: txRecord.user_id,
          plan_id: txRecord.plan_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: "active",
        });

        if (subError) {
          console.error("Error creating subscription:", subError);
          return NextResponse.redirect(new URL("/checkout/error?reason=sub_error", request.url));
        }

        // También registrar en purchases para el historial, con plan_id
        await supabaseAdmin.from("purchases").insert({
          user_id: txRecord.user_id,
          course_id: null,
          plan_id: txRecord.plan_id,
          amount_paid: response.amount,
          status: "paid",
          currency: "CLP",
          transaction_id: response.buy_order
        });

        return NextResponse.redirect(new URL("/perfil?sub_success=true", request.url));
      }

    } else {
      // ❌ Pago rechazado
      await supabaseAdmin.from("webpay_transactions").update({
        status: "REJECTED",
        response_code: response.response_code,
        authorization_code: response.authorization_code,
      }).eq("token_ws", token_ws);

      return NextResponse.redirect(new URL("/checkout/error?reason=rejected", request.url));
    }

  } catch (error: any) {
    console.error("Webpay commit error:", error);
    await supabaseAdmin.from("webpay_transactions").update({ status: "FAILED" }).eq("token_ws", token_ws);
    return NextResponse.redirect(new URL("/checkout/error?reason=error", request.url));
  }

  return NextResponse.redirect(new URL("/checkout/error?reason=unknown", request.url));
}

async function getSupabaseAdmin() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}
