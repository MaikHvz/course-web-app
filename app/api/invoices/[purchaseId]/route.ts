import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const { purchaseId } = await params;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // Obtener la compra con datos de curso, plan y perfil
  const { data: purchase, error } = await supabaseAdmin
    .from("purchases")
    .select(`
      *,
      course:courses(title),
      plan:subscription_plans(name),
      profile:profiles(name, email)
    `)
    .eq("id", purchaseId)
    .eq("user_id", user.id)
    .single();

  if (error || !purchase) {
    return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
  }

  // Formatear fecha y hora
  const fechaObj = new Date(purchase.created_at);
  const fecha = fechaObj.toLocaleDateString("es-CL", {
    year: "numeric", month: "long", day: "numeric"
  });
  const hora = fechaObj.toLocaleTimeString("es-CL", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });

  const concepto = purchase.course?.title 
    ? `Curso: ${purchase.course.title}` 
    : purchase.plan?.name 
    ? `Suscripción: ${purchase.plan.name}` 
    : "Compra en Academia Zona Elite";

  const monto = Number(purchase.amount_paid).toLocaleString("es-CL");
  const txId = purchase.transaction_id || "N/A";
  const nombre = purchase.profile?.name || user.email || "Alumno";
  const emailCliente = purchase.profile?.email || user.email || "";
  const compraId = purchase.id.slice(0, 8).toUpperCase();

  // Generar HTML de la boleta
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Boleta ${compraId} — Zona Elite</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f1f5f9; display: flex; justify-content: center; padding: 40px 20px; }
    .receipt { max-width: 620px; width: 100%; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: white; padding: 36px; position: relative; }
    .header h1 { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header p  { font-size: 13px; opacity: 0.6; }
    .badge { display: inline-block; background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.4); color: #4ade80; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 100px; margin-top: 14px; letter-spacing: 0.05em; }
    .header-id { position: absolute; top: 20px; right: 24px; font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; }
    .body { padding: 32px 36px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 12px; margin-top: 24px; }
    .section-title:first-child { margin-top: 0; }
    .info-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding: 11px 0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: #64748b; }
    .info-value { font-size: 13px; color: #0f172a; font-weight: 600; text-align: right; max-width: 60%; word-break: break-word; }
    .amount-box { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px solid #bbf7d0; border-radius: 16px; padding: 22px 28px; margin: 28px 0 8px; display: flex; justify-content: space-between; align-items: center; }
    .amount-label { font-size: 13px; color: #15803d; font-weight: 600; }
    .amount-value { font-size: 34px; font-weight: 900; color: #15803d; letter-spacing: -1px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 36px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6; }
    .print-btn { display: block; margin: 24px auto 0; background: #0f172a; color: white; border: none; padding: 12px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; }
    .print-btn:hover { background: #1e293b; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; max-width: 100%; }
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <div>
    <div class="receipt">
      <div class="header">
        <span class="header-id">N° ${compraId}</span>
        <h1>Zona Elite</h1>
        <p>Academia de Artes Marciales Online</p>
        <span class="badge">✓ PAGO AUTORIZADO</span>
      </div>

      <div class="body">
        <p class="section-title">Datos del Cliente</p>
        <div class="info-row">
          <span class="info-label">Nombre</span>
          <span class="info-value">${nombre}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${emailCliente}</span>
        </div>

        <p class="section-title">Detalle de la Compra</p>
        <div class="info-row">
          <span class="info-label">Concepto</span>
          <span class="info-value">${concepto}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha</span>
          <span class="info-value">${fecha}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Hora</span>
          <span class="info-value">${hora} hrs</span>
        </div>

        <p class="section-title">Datos de la Transacción</p>
        <div class="info-row">
          <span class="info-label">ID de Compra</span>
          <span class="info-value">${compraId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">N° Orden Transbank</span>
          <span class="info-value">${txId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Método de Pago</span>
          <span class="info-value">Webpay Plus (Transbank)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Moneda</span>
          <span class="info-value">CLP (Peso Chileno)</span>
        </div>

        <div class="amount-box">
          <span class="amount-label">Total Pagado</span>
          <span class="amount-value">$${monto}</span>
        </div>
      </div>

      <div class="footer">
        Este documento es un comprobante electrónico interno de tu transacción.<br>
        No constituye una boleta tributaria válida ante el SII.<br>
        <strong>Academia Zona Elite</strong> — zonaelite.cl
      </div>
    </div>

    <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="boleta-${compraId}.html"`,
    },
  });
}
