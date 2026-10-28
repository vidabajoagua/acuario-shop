"use server";

import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getShippingCostLabel,
  getShippingMethodLabel,
} from "@/lib/shipping/shipping-method";

type CheckoutItem = {
  product_id: string;
  quantity: number;
};
type CheckoutProfile = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export async function getMyCheckoutProfile(): Promise<{
  success: boolean;
  profile: CheckoutProfile | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, profile: null };
  }

  const admin = createAdminClient();
  const { data: customer, error } = await admin
    .from("customers")
    .select("first_name, last_name, email, phone")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !customer) {
    return { success: false, profile: null };
  }

  return {
    success: true,
    profile: {
      first_name: customer.first_name ?? "",
      last_name: customer.last_name ?? "",
      email: customer.email ?? user.email ?? "",
      phone: customer.phone ?? "",
    },
  };
}



function getEmailStatusStyle(status: string) {
  const styles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    pending: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", dot: "#f59e0b" },
    confirmed: { bg: "#ecfdf5", border: "#a7f3d0", text: "#047857", dot: "#10b981" },
    preparing: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" },
    shipped: { bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1", dot: "#0ea5e9" },
    delivered: { bg: "#ecfdf5", border: "#a7f3d0", text: "#047857", dot: "#059669" },
    cancelled: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", dot: "#ef4444" },
  };
  return styles[status] ?? styles.pending;
}
async function sendOrderConfirmationEmail(order: any) {
  const customer = {
    first_name: order.buyer_first_name,
    last_name: order.buyer_last_name,
    email: order.buyer_email,
    phone: order.buyer_phone,
  };
  const payment = Array.isArray(order.payments)
    ? order.payments[0]
    : order.payments;

  if (!customer?.email) return;

  const shippingMethodLabel = getShippingMethodLabel(order.shipping_method);
  const shippingCostLabel = getShippingCostLabel(
    order.shipping_method,
    Number(order.shipping_cost) || 0,
  );
  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    preparing: "Preparando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  const statusLabel = statusLabels[order.status] ?? "Pendiente";
  const statusStyle = getEmailStatusStyle(order.status ?? "pending");
  const orderNumber = String(order.order_number).padStart(4, "0");
  const paymentLabels: Record<string, string> = {
    transferencia: "Transferencia / QR",
    efectivo: "Pago en efectivo",
    payphone: "PayPhone",
  };
  const paymentMethodLabel =
    paymentLabels[payment?.payment_method] ?? "No especificado";

  const supabase = createAdminClient();
  const { data: accounts } = await supabase
    .from("payment_accounts")
    .select("bank_name, account_type, account_number, account_holder, identification, contact_email, qr_url")
    .eq("enabled", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const transporter = createTransporter();

  const items = order.order_items ?? [];
  const itemsHtml = items
    .map(
      (item: any) =>
        `<tr><td style="padding:8px 0;">${item.product_name} × ${item.quantity}</td><td style="padding:8px 0;text-align:right;">${Number(item.subtotal).toFixed(2)}</td></tr>`,
    )
    .join("");

  const transferHtml =
    payment?.payment_method === "transferencia"
      ? `
        <tr><td style="padding:8px 24px;">
          <div style="padding:14px 16px;border:1px solid #dfe5dc;border-radius:14px;background:#fbfcf8;">
            <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#718078;font-weight:700;">Datos para la transferencia</div>
            ${(accounts ?? []).map((account: any) => `
              <div style="margin-top:10px;padding:11px 12px;border:1px solid #e3e8df;border-radius:11px;background:#ffffff;">
                <div style="font-size:13px;font-weight:700;color:#25352d;">${account.bank_name}</div>
                <div style="margin-top:4px;font-size:12px;line-height:1.55;color:#66766d;">
                  ${account.account_type} · ${account.account_number}<br/>
                  Titular: ${account.account_holder}
                  ${account.identification ? `<br/>Cédula / RUC: ${account.identification}` : ""}
                  ${account.contact_email ? `<br/>Comprobantes: ${account.contact_email}` : ""}
                </div>
                ${account.qr_url ? `<img src="${account.qr_url}" alt="Código QR ${account.bank_name}" style="display:block;margin-top:9px;width:140px;height:140px;border-radius:10px;border:1px solid #e3e8df;object-fit:contain;" />` : ""}
              </div>
            `).join("")}
          </div>
        </td></tr>
      `
      : "";
  await transporter.sendMail({
    from: `"VidaBajoAgua" <${process.env.SMTP_USER}>`,
    to: customer.email,
    ...(order.additional_email ? { cc: order.additional_email } : {}),
    subject: `Pedido #${orderNumber} recibido · ${statusLabel} — VidaBajoAgua`,
    text: `VidaBajoAgua — Pedido #${orderNumber}\nEstado: ${statusLabel}\nMétodo de envío: ${shippingMethodLabel}\nCosto de envío: ${shippingCostLabel}\nMétodo de pago: ${paymentMethodLabel}\nTotal: ${Number(order.total).toFixed(2)}\nCódigo de seguimiento: ${order.tracking_token}`,
    html: `
      <div style="margin:0;padding:24px 12px;background:#f4f5ef;font-family:Arial,Helvetica,sans-serif;color:#25352d;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;margin:0 auto;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #e2e7df;border-radius:18px;overflow:hidden;">
          <tr><td style="padding:22px 24px;background:#203a31;color:#ffffff;border-bottom:4px solid #78a58d;">
            <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#d7e7df;">VidaBajoAgua</div>
            <div style="margin-top:5px;font-size:23px;line-height:1.2;font-weight:700;">Pedido #${orderNumber}</div>
            <div style="margin-top:6px;font-size:13px;color:#cfe0d7;">Hemos recibido correctamente tu pedido.</div>
          </td></tr>
          <tr><td style="padding:16px 24px 6px;">
            <div style="display:inline-block;padding:8px 12px;border:1px solid ${statusStyle.border};border-radius:999px;background:${statusStyle.bg};color:${statusStyle.text};font-size:12px;font-weight:700;">
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${statusStyle.dot};margin-right:7px;"></span>${statusLabel}
            </div>
            <div style="margin-top:10px;font-size:14px;color:#526259;">Hola <strong style="color:#25352d;">${customer.first_name ?? "cliente"}</strong>, estos son los detalles de tu compra.</div>
          </td></tr>
          <tr><td style="padding:8px 24px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
          </td></tr>
          <tr><td style="padding:16px 24px 8px;">
            <div style="padding:14px 16px;border-radius:14px;background:#f7f8f4;border:1px solid #e7ebe3;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr><td style="padding:3px 0;color:#69776f;">Subtotal</td><td style="padding:3px 0;text-align:right;">$${Number(order.subtotal).toFixed(2)}</td></tr>
                <tr><td style="padding:3px 0;color:#69776f;">Método de envío</td><td style="padding:3px 0;text-align:right;font-weight:600;">${shippingMethodLabel}</td></tr>
                <tr><td style="padding:3px 0;color:#69776f;">Costo de envío</td><td style="padding:3px 0;text-align:right;font-weight:600;">${shippingCostLabel}</td></tr>
                <tr><td style="padding:10px 0 3px;border-top:1px solid #dde3da;font-size:15px;font-weight:700;">Total</td><td style="padding:10px 0 3px;border-top:1px solid #dde3da;text-align:right;font-size:18px;font-weight:700;">$${Number(order.total).toFixed(2)}</td></tr>
              </table>
            </div>
          </td></tr>
          <tr><td style="padding:8px 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="width:50%;vertical-align:top;padding-right:6px;"><div style="padding:13px 14px;border:1px solid #e2e7df;border-radius:12px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#718078;font-weight:700;">Pago</div><div style="margin-top:5px;font-size:13px;font-weight:600;">${paymentMethodLabel}</div></div></td>
                <td style="width:50%;vertical-align:top;padding-left:6px;"><div style="padding:13px 14px;border:1px solid #e2e7df;border-radius:12px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#718078;font-weight:700;">Seguimiento</div><div style="margin-top:5px;font-size:11px;font-weight:600;word-break:break-all;">${order.tracking_token}</div></div></td>
              </tr>
            </table>
          </td></tr>
          ${order.recipient_is_other ? `<tr><td style="padding:8px 24px;"><div style="padding:14px 16px;border:1px solid #e2e7df;border-radius:12px;background:#fbfcf8;"><div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#718078;font-weight:700;">Persona que recibe</div><div style="margin-top:6px;font-size:14px;font-weight:600;">${order.recipient_first_name} ${order.recipient_last_name}</div><div style="margin-top:2px;font-size:13px;color:#66766d;">${order.recipient_phone}</div></div></td></tr>` : ""}
          ${order.additional_email ? `<tr><td style="padding:8px 24px;"><div style="padding:11px 14px;border-radius:12px;background:#f5f7f2;color:#5f6d64;font-size:12px;">Esta confirmación también fue enviada a <strong>${order.additional_email}</strong>.</div></td></tr>` : ""}
          ${payment?.payment_method === "efectivo" ? `<tr><td style="padding:8px 24px;"><div style="padding:12px 14px;border:1px solid #fde68a;border-radius:12px;background:#fffbeb;color:#854d0e;font-size:12px;"><strong>Entrega presencial.</strong> El pago se realizará en efectivo según la modalidad acordada.</div></td></tr>` : ""}
          ${transferHtml}
          <tr><td style="padding:18px 24px 22px;text-align:center;border-top:1px solid #eef1eb;"><div style="font-size:12px;color:#748178;">Conserva tu código de seguimiento para consultar tu pedido.</div><div style="margin-top:5px;font-size:12px;color:#9aa49d;">VidaBajoAgua · Ecuador</div></td></tr>
        </table>
      </div>
    `,
  });
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    throw new Error("Faltan las variables de configuración SMTP.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });
}

type CreateOrderInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  parish: string;
  address: string;
  reference: string;
  payment_method:
    | "transferencia"
    | "efectivo"
    | "payphone";
  shipping_cost: number;
  notes: string;
  items: CheckoutItem[];
  address_id?: string | null;
  recipient_is_other: boolean;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_phone: string;
  additional_email: string;
};


async function validateShippingCost(
  admin: ReturnType<typeof createAdminClient>,
  input: CreateOrderInput,
): Promise<{ valid: true; shippingCost: number } | { valid: false; error: string }> {
  if (input.payment_method === "efectivo") {
    return { valid: true, shippingCost: 0 };
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { valid: false, error: "El carrito está vacío." };
  }

  const productIds = [...new Set(input.items.map((item) => item.product_id))];
  if (
    productIds.some((id) => typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) ||
    input.items.some((item) => !Number.isSafeInteger(item.quantity) || item.quantity <= 0)
  ) {
    return { valid: false, error: "Los productos o las cantidades del carrito no son válidos." };
  }

  const [productsResult, settingsResult, coverageResult] = await Promise.all([
    admin
      .from("products")
      .select("id, price")
      .in("id", productIds)
      .eq("is_active", true),
    admin
      .from("shipping_settings")
      .select("free_shipping_minimum")
      .limit(1)
      .single(),
    admin
      .from("shipping_coverage")
      .select("province, city, parish, enabled, shipping_cost"),
  ]);

  if (productsResult.error || settingsResult.error || coverageResult.error || !settingsResult.data) {
    console.error("[CHECKOUT SHIPPING VALIDATION]", {
      products: productsResult.error,
      settings: settingsResult.error,
      coverage: coverageResult.error,
    });
    return { valid: false, error: "No se pudo validar la tarifa de envío. Inténtalo nuevamente." };
  }

  const products = productsResult.data ?? [];
  if (products.length !== productIds.length) {
    return { valid: false, error: "Uno o más productos ya no están disponibles. Actualiza tu carrito." };
  }

  const priceById = new Map(products.map((product) => [product.id, Number(product.price)]));
  let subtotalCents = 0;

  for (const item of input.items) {
    const price = priceById.get(item.product_id);
    if (price === undefined || !Number.isFinite(price) || price < 0) {
      return { valid: false, error: "No se pudo validar el precio de los productos." };
    }
    subtotalCents += Math.round(price * 100) * item.quantity;
  }

  const freeShippingMinimum = Number(settingsResult.data.free_shipping_minimum);
  if (!Number.isFinite(freeShippingMinimum) || freeShippingMinimum < 0) {
    return { valid: false, error: "La configuración de envíos no es válida." };
  }

  let expectedShippingCost = 0;
  if (subtotalCents < Math.round(freeShippingMinimum * 100)) {
    const normalize = (value: string | null | undefined) => (value ?? "").trim().toLocaleLowerCase();
    const coverage = (coverageResult.data ?? []).find(
      (entry) =>
        normalize(entry.province) === normalize(input.province) &&
        normalize(entry.city) === normalize(input.city) &&
        normalize(entry.parish) === normalize(input.parish),
    );

    if (coverage?.enabled && coverage.shipping_cost !== null) {
      expectedShippingCost = Number(coverage.shipping_cost);
    }
    // Sin una tarifa de cobertura confirmada, el pedido queda "por confirmar"
    // y conserva costo cero hasta que el equipo confirme el envío.
  }

  if (!Number.isFinite(expectedShippingCost) || expectedShippingCost < 0) {
    return { valid: false, error: "La tarifa de envío configurada no es válida." };
  }

  const submittedCost = Number(input.shipping_cost);
  const expectedCents = Math.round(expectedShippingCost * 100);
  if (!Number.isFinite(submittedCost) || Math.round(submittedCost * 100) !== expectedCents) {
    return {
      valid: false,
      error: "La tarifa de envío cambió o no coincide con la configuración. Revisa el envío y vuelve a intentar.",
    };
  }

  return { valid: true, shippingCost: expectedCents / 100 };
}

export async function createPendingOrder(
  input: CreateOrderInput,
) {
  try {
    if (!input.items.length) {
      return {
        success: false,
        error: "El carrito está vacío.",
      };
    }

    /*
     * Cliente de servidor:
     * permite conocer al usuario autenticado
     * mediante las cookies de Supabase.
     */
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    /*
     * Cliente administrativo:
     * lo conservamos para ejecutar el RPC actual,
     * que únicamente permite EXECUTE a service_role.
     */
    const admin = createAdminClient();

    const shippingValidation = await validateShippingCost(admin, input);
    if (!shippingValidation.valid) {
      return {
        success: false,
        error: shippingValidation.error,
      };
    }

    /*
     * La tarifa enviada por el navegador nunca se acepta sin validación.
     * Se envía al RPC el importe recalculado a partir de la configuración
     * y la cobertura consultadas desde el servidor.
     */
    const validatedShippingCost = shippingValidation.shippingCost;
    const authUserId = user?.id ?? null;

    console.log(
      "[CHECKOUT] authUserId:",
      authUserId,
    );

    const { data, error } =
  await admin.rpc(
    "create_pending_order_v2",
    {
      p_first_name: input.first_name,
      p_last_name: input.last_name,
      p_email: input.email,
      p_phone: input.phone,
      p_province: input.province,
      p_city: input.city,
      p_parish: input.parish,
      p_address: input.address,
      p_reference: input.reference,
      p_items: input.items,
      p_payment_method:
        input.payment_method,
      p_shipping_cost: validatedShippingCost,
      p_notes: input.notes,
      p_auth_user_id: authUserId,
      p_address_id: input.address_id ?? null,
      p_recipient_is_other: input.recipient_is_other,
      p_recipient_first_name: input.recipient_first_name,
      p_recipient_last_name: input.recipient_last_name,
      p_recipient_phone: input.recipient_phone,
      p_additional_email: input.additional_email,
    },
  );

    if (error) {
      console.error(
        "[CHECKOUT] RPC error:",
        error,
      );

      return {
        success: false,
        error:
          error.message ||
          "No se pudo crear el pedido.",
      };
    }

    try {
      const orderId = data?.order_id;
      if (orderId) {
        const { data: orderForEmail } = await admin
          .from("orders")
          .select(`
            order_number,
            tracking_token,
            subtotal,
            shipping_cost,
            shipping_method,
            total,
            status,
            buyer_first_name,
            buyer_last_name,
            buyer_email,
            buyer_phone,
            recipient_is_other,
            recipient_first_name,
            recipient_last_name,
            recipient_phone,
            additional_email,
            order_items (product_name, quantity, subtotal),
            payments (payment_method)
          `)
          .eq("id", orderId)
          .single();

        if (orderForEmail) {
          await sendOrderConfirmationEmail(orderForEmail);
        }
      }
    } catch (emailError) {
      console.error("[CHECKOUT] Error enviando confirmación por correo:", emailError);
    }

    return {
      success: true,
      order: data,
    };
  } catch (error) {
    console.error(
      "[CHECKOUT] Unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        "Ocurrió un error al crear el pedido.",
    };
  }
}