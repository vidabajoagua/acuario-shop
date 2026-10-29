import { OrderStatusControl } from "../order-status-control";
import { ConfirmPaymentButton } from "../confirm-payment-button";
import { CancelOrderButton } from "../cancel-order-button";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  getShippingCostLabel,
  getShippingMethodLabel,
} from "@/lib/shipping/shipping-method";
import { getOrderStatusMeta } from "@/lib/orders/order-status";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: order, error } =
    await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        subtotal,
        shipping_cost,
        shipping_method,
        total,
        notes,
        created_at,

        customers (
          first_name,
          last_name,
          email,
          phone
        ),

        addresses (
          province,
          city,
          address,
          reference
        ),

        order_items (
            id,
            product_id,
            product_name,
            unit_price,
            quantity,
            subtotal,
            products (
              id,
              name,
              inventory (
                quantity
              )
            )
          ),

        payments (
          id,
          payment_method,
          payment_status,
          amount,
          transaction_reference,
          created_at,
          updated_at
        )
      `)
      .eq("id", id)
      .single();

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Volver a pedidos
        </Link>

        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Package
            className="mx-auto text-primary"
            size={42}
          />

          <h1 className="mt-4 text-2xl font-semibold">
            Pedido no encontrado
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            No pudimos encontrar el pedido solicitado.
          </p>
        </div>
      </div>
    );
  }

  const customer = Array.isArray(order.customers)
    ? order.customers[0] ?? null
    : order.customers;

  const address = Array.isArray(order.addresses)
    ? order.addresses[0] ?? null
    : order.addresses;

  const payment = Array.isArray(order.payments)
    ? order.payments[0] ?? null
    : order.payments;

  const orderItems = (order.order_items ?? []).map(
  (item) => {
    const product = Array.isArray(item.products)
      ? item.products[0] ?? null
      : item.products;

    const inventory = product?.inventory;

    const stock = Array.isArray(inventory)
      ? inventory[0]?.quantity ?? null
      : inventory?.quantity ?? null;

    return {
      ...item,
      stock,
    };
  },
);

  const paymentMethods: Record<
    string,
    string
  > = {
    transferencia: "Transferencia / QR",
    efectivo: "Pago en efectivo",
    payphone: "PayPhone",
  };

  const statusMeta = getOrderStatusMeta(order.status);

  const shippingMethodLabel = getShippingMethodLabel(
    order.shipping_method,
  );

  const shippingCostLabel = getShippingCostLabel(
    order.shipping_method,
    Number(order.shipping_cost) || 0,
  );

  const paymentStatuses: Record<
    string,
    string
  > = {
    pending: "Pendiente",
    waiting_verification: "Por verificar",
    paid: "Pagado",
    rejected: "Rechazado",
    refunded: "Reembolsado",
  };

  const paymentStatusClass: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    waiting_verification: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
    refunded: "bg-violet-100 text-violet-800",
  };

  return (
    <div className="space-y-8">

      {/* Encabezado */}

      <div>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Volver a pedidos
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Pedido
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              #{String(order.order_number).padStart(4, "0")}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("es-EC", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "America/Guayaquil",
              }).format(new Date(order.created_at))}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusMeta.badgeClass}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${statusMeta.dotClass} ${order.status === "pending" ? "order-status-pulse" : ""}`}
              />
              {statusMeta.label}
            </span>

            {payment && (
              <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${paymentStatusClass[payment.payment_status] ?? "bg-slate-100 text-slate-700"}`}>
                {paymentStatuses[
                  payment.payment_status
                ] ?? payment.payment_status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

        {/* Columna principal */}

        <div className="space-y-8">

          {/* Productos */}

          <section className="order-surface overflow-hidden">
            <div className="border-b border-border p-6">
              <div className="flex items-center gap-3">
                <Package
                  size={20}
                  className="text-primary"
                />

                <h2 className="text-xl font-semibold">
                  Productos
                </h2>
              </div>
            </div>

            <div className="divide-y divide-border">
              {orderItems.map((item) => {
  const hasStock =
    item.stock !== null &&
    item.stock >= item.quantity;

  return (
    <div
      key={item.id}
      className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="font-medium">
          {item.product_name}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {item.quantity} × $
          {Number(item.unit_price).toFixed(2)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Stock actual:
          </span>

          {item.stock === null ? (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              No disponible
            </span>
          ) : (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                hasStock
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {item.stock} unidades
            </span>
          )}

          {item.stock !== null && (
            <span
              className={`text-xs ${
                hasStock
                  ? "text-muted-foreground"
                  : "font-medium text-destructive"
              }`}
            >
              {hasStock
                ? "✓ Stock suficiente"
                : "⚠ Stock insuficiente"}
            </span>
          )}
        </div>
      </div>

      <p className="shrink-0 font-semibold">
        $
        {Number(item.subtotal).toFixed(2)}
      </p>
    </div>
  );
})}
            </div>

            <div className="space-y-3 border-t border-border p-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal
                </span>

                <span>
                  $
                  {Number(
                    order.subtotal,
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Método de envío
                </span>

                <span className="text-right font-medium">
                  {shippingMethodLabel}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Costo de envío
                </span>

                <span className="text-right">
                  {shippingCostLabel}
                </span>
              </div>

              <div className="order-total flex justify-between border-t border-border pt-4 text-lg font-semibold">
                <span>Total</span>

                <span>
                  $
                  {Number(
                    order.total,
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          {/* Cliente */}

          <section className="order-surface p-6">
            <div className="flex items-center gap-3">
              <User
                size={20}
                className="text-primary"
              />

              <h2 className="text-xl font-semibold">
                Cliente
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Nombre
                </p>

                <p className="mt-1 font-medium">
                  {customer?.first_name}{" "}
                  {customer?.last_name}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </p>

                <p className="mt-1">
                  {customer?.phone ?? "No registrado"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Correo
                </p>

                <p className="mt-1">
                  {customer?.email ?? "No registrado"}
                </p>
              </div>
            </div>
          </section>

          {/* Dirección */}

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <MapPin
                size={20}
                className="text-primary"
              />

              <h2 className="text-xl font-semibold">
                Dirección de entrega
              </h2>
            </div>

            {address ? (
              <div className="mt-6 space-y-2 text-sm">
                <p className="font-medium">
                  {address.address}
                </p>

                <p className="text-muted-foreground">
                  {address.city},{" "}
                  {address.province}
                </p>

                {address.reference && (
                  <p className="text-muted-foreground">
                    Referencia:{" "}
                    {address.reference}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                No hay dirección registrada.
              </p>
            )}
          </section>
        </div>

        {/* Columna lateral */}

        <aside className="space-y-6">

          {/* Pago */}

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <CreditCard
                size={20}
                className="text-primary"
              />

              <h2 className="text-lg font-semibold">
                Pago
              </h2>
            </div>

            {payment ? (
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Método
                  </p>

                  <p className="mt-1 font-medium">
                    {paymentMethods[
                      payment.payment_method
                    ] ??
                      payment.payment_method}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Estado
                  </p>

                  <p className="mt-1 font-medium">
                    {paymentStatuses[
                      payment.payment_status
                    ] ??
                      payment.payment_status}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Monto
                  </p>

                  <p className="order-total mt-1 text-2xl font-semibold">
                    $
                    {Number(
                      payment.amount,
                    ).toFixed(2)}
                  </p>
                </div>

                {payment.transaction_reference && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Referencia
                    </p>

                    <p className="mt-1 break-all text-sm">
                      {
                        payment.transaction_reference
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                No hay información de pago.
              </p>
            )}
          </section>

          {/* Notas */}

          {order.notes && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">
                Notas
              </h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {order.notes}
              </p>
            </section>
          )}

          {/* Acciones */}

{payment &&
  payment.payment_status !== "paid" &&
  order.status === "pending" && (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
      <p className="text-sm font-medium">
        Este pedido requiere revisión
      </p>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Verifica que el pago haya sido recibido
        antes de confirmarlo.
      </p>

      <div className="mt-5 space-y-3">
        <ConfirmPaymentButton
          orderId={order.id}
          paymentId={payment.id}
        />

        <CancelOrderButton
          orderId={order.id}
          orderNumber={order.order_number}
        />
      </div>
    </div>
  )}

{order.status !== "pending" &&
  order.status !== "cancelled" &&
  order.status !== "delivered" && (
    <>
      <OrderStatusControl
        orderId={order.id}
        currentStatus={order.status}
      />

      <CancelOrderButton
        orderId={order.id}
        orderNumber={order.order_number}
      />
    </>
  )}
        </aside>
      </div>
    </div>
  );
}