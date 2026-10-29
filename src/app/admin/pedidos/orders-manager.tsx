"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getShippingCostLabel, getShippingMethodLabel } from "@/lib/shipping/shipping-method";
import { getOrderStatusMeta } from "@/lib/orders/order-status";
import {
  ChevronDown,
  CreditCard,
  MapPin,
  Package,
  Search,
  User,
} from "lucide-react";

type Customer = {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
} | null;

type Address = {
  province: string;
  city: string;
  address: string;
  reference: string | null;
} | null;

type OrderItem = {
  id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

type Payment = {
  id: string;
  payment_method: string;
  payment_status: string;
  amount: number;
  transaction_reference: string | null;
  created_at: string;
} | null;

type Order = {
  id: string;
  order_number: number;
  status: string;
  subtotal: number;
  shipping_cost: number;
  shipping_method: string;
  total: number;
  notes: string | null;
  created_at: string;
  customers: Customer;
  addresses: Address;
  order_items: OrderItem[];
  payments: Payment;
};

type Props = {
  orders: Order[];
  initialStatusFilter?: string;
  initialPaymentFilter?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function formatDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    waiting_verification: "Por verificar",
    paid: "Pagado",
    rejected: "Rechazado",
    refunded: "Reembolsado",
  };

  return labels[status] ?? status;
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    transferencia: "Transferencia / QR",
    efectivo: "Pago en efectivo",
    payphone: "PayPhone",
  };

  return labels[method] ?? method;
}

function paymentStatusClass(status: string) {
  if (status === "paid") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "waiting_verification") {
    return "bg-amber-100 text-amber-800";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-800";
  }

  if (status === "refunded") {
    return "bg-violet-100 text-violet-800";
  }

  return "bg-slate-100 text-slate-700";
}

function shippingMethodClass(method: string) {
  const classes: Record<string, string> = {
    cobertura: "bg-emerald-100 text-emerald-800",
    gratis: "bg-green-100 text-green-800",
    presencial: "bg-sky-100 text-sky-800",
    por_confirmar: "bg-amber-100 text-amber-800",
  };

  return classes[method] ?? "bg-slate-100 text-slate-700";
}

export function OrdersManager({
  orders,
  initialStatusFilter = "all",
  initialPaymentFilter = "all",
}: Props) {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState(initialStatusFilter);

  const [paymentFilter, setPaymentFilter] =
    useState(initialPaymentFilter);

  const [expandedOrders, setExpandedOrders] =
    useState<Set<string>>(new Set());

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = order.customers;

      const customerName = customer
        ? `${customer.first_name} ${customer.last_name}`
        : "";

      const matchesSearch =
        !normalizedSearch ||
        String(order.order_number).includes(
          normalizedSearch,
        ) ||
        customerName.toLowerCase().includes(
          normalizedSearch,
        ) ||
        (customer?.email ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (customer?.phone ?? "").includes(
          normalizedSearch,
        );

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.payments?.payment_status ===
          paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const paidOrders = orders.filter(
    (order) =>
      order.payments?.payment_status === "paid",
  ).length;

  const totalOrders = orders.length;

  function toggleOrder(orderId: string) {
    setExpandedOrders((current) => {
      const next = new Set(current);

      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }

      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="order-surface border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Pendientes
          </p>

          <p className="mt-2 text-3xl font-semibold text-amber-800 dark:text-amber-200">
            {pendingOrders}
          </p>
        </div>

        <div className="order-surface border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Pagados
          </p>

          <p className="mt-2 text-3xl font-semibold text-emerald-800 dark:text-emerald-200">
            {paidOrders}
          </p>
        </div>

        <div className="order-surface p-5">
          <p className="text-sm text-muted-foreground">
            Total pedidos
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {totalOrders}
          </p>
        </div>
      </div>

      {/* Filtros */}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_150px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por pedido, cliente, correo o celular..."
              className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="order-status-filter"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
            >
              Estado del pedido
            </label>

            <select
              id="order-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">
                Todos
              </option>

              <option value="pending">
                Pendientes
              </option>

              <option value="confirmed">
                Confirmados
              </option>

              <option value="preparing">
                Preparando
              </option>

              <option value="shipped">
                Enviados
              </option>

              <option value="delivered">
                Entregados
              </option>

              <option value="cancelled">
                Cancelados
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="payment-status-filter"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
            >
              Estado del pago
            </label>

            <select
              id="payment-status-filter"
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value)
              }
              className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">
                Todos
              </option>

              <option value="pending">
                Pendientes
              </option>

              <option value="waiting_verification">
                Por verificar
              </option>

              <option value="paid">
                Pagados
              </option>

              <option value="rejected">
                Rechazados
              </option>

              <option value="refunded">
                Reembolsados
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="h-12 w-full rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando{" "}
          <strong className="text-foreground">
            {filteredOrders.length}
          </strong>{" "}
          de{" "}
          <strong className="text-foreground">
            {orders.length}
          </strong>{" "}
          pedidos
        </div>
      </div>

      {/* Pedidos */}

      {orders.length === 0 ? (
        <div className="order-surface p-10 text-center">
          <Package
            className="mx-auto text-primary"
            size={40}
          />

          <h2 className="mt-4 text-xl font-semibold">
            No hay pedidos
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Los pedidos realizados desde la tienda
            aparecerán aquí.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Package
            className="mx-auto text-muted-foreground"
            size={40}
          />

          <h2 className="mt-4 text-xl font-semibold">
            No encontramos pedidos
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Prueba con otro término de búsqueda o
            cambia los filtros.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const customer = order.customers;
            const payment = order.payments;
            const address = order.addresses;
            const isExpanded =
              expandedOrders.has(order.id);

            return (
              <article
                key={order.id}
                className="order-surface overflow-hidden"
              >
                {/* Cabecera del acordeón */}

                <button
                  type="button"
                  onClick={() =>
                    toggleOrder(order.id)
                  }
                  aria-expanded={isExpanded}
                  className="w-full px-5 py-5 text-left transition hover:bg-muted/30 md:px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          Pedido #
                          {String(
                            order.order_number,
                          ).padStart(4, "0")}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${getOrderStatusMeta(order.status).badgeClass}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${getOrderStatusMeta(order.status).dotClass} ${order.status === "pending" ? "order-status-pulse" : ""}`}
                          />
                          {getOrderStatusMeta(order.status).label}
                        </span>

                        {payment && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentStatusClass(
                              payment.payment_status,
                            )}`}
                          >
                            {getPaymentStatusLabel(
                              payment.payment_status,
                            )}
                          </span>
                        )}

                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${shippingMethodClass(order.shipping_method)}`}>
                          {getShippingMethodLabel(
                            order.shipping_method,
                          )}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
                        <span>
                          {customer
                            ? `${customer.first_name} ${customer.last_name}`
                            : "Cliente"}
                        </span>

                        <span className="hidden sm:inline">
                          ·
                        </span>

                        <span>
                          {formatDate(
                            order.created_at,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">
                        Total
                      </p>

                      <p className="order-total mt-1 font-semibold">
                        {formatCurrency(
                          order.total,
                        )}
                      </p>
                    </div>

                    <ChevronDown
                      size={20}
                      className={[
                        "shrink-0 text-muted-foreground transition-transform duration-200",
                        isExpanded
                          ? "rotate-180"
                          : "",
                      ].join(" ")}
                    />
                  </div>
                </button>

                {/* Contenido expandido */}

                {isExpanded && (
                  <div className="border-t border-border">
                    <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-2">
                      {/* Cliente */}

                      <section className="order-section p-5">
                        <div className="flex items-center gap-3">
                          <User
                            size={18}
                            className="text-primary"
                          />

                          <h3 className="font-semibold">
                            Cliente
                          </h3>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          <p className="font-medium">
                            {customer
                              ? `${customer.first_name} ${customer.last_name}`
                              : "Cliente"}
                          </p>

                          {customer?.email && (
                            <p className="text-muted-foreground">
                              {customer.email}
                            </p>
                          )}

                          {customer?.phone && (
                            <p className="text-muted-foreground">
                              {customer.phone}
                            </p>
                          )}
                        </div>
                      </section>

                      {/* Pago */}

                      <section className="rounded-xl border border-border bg-background p-5">
                        <div className="flex items-center gap-3">
                          <CreditCard
                            size={18}
                            className="text-primary"
                          />

                          <h3 className="font-semibold">
                            Pago
                          </h3>
                        </div>

                        {payment ? (
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">
                                Método
                              </span>

                              <span className="text-right font-medium">
                                {getPaymentMethodLabel(
                                  payment.payment_method,
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">
                                Estado
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentStatusClass(
                                  payment.payment_status,
                                )}`}
                              >
                                {getPaymentStatusLabel(
                                  payment.payment_status,
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">
                                Monto
                              </span>

                              <span className="font-semibold">
                                {formatCurrency(
                                  payment.amount,
                                )}
                              </span>
                            </div>

                            {payment.transaction_reference && (
                              <div className="pt-2">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                  Referencia
                                </p>

                                <p className="mt-1 break-all">
                                  {
                                    payment.transaction_reference
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-muted-foreground">
                            No hay información de pago.
                          </p>
                        )}
                      </section>

                      {/* Dirección */}

                      <section className="rounded-xl border border-border bg-background p-5">
                        <div className="flex items-center gap-3">
                          <MapPin
                            size={18}
                            className="text-primary"
                          />

                          <h3 className="font-semibold">
                            Dirección de entrega
                          </h3>
                        </div>

                        {address ? (
                          <div className="mt-4 space-y-1 text-sm">
                            <p className="font-medium">
                              {address.address}
                            </p>

                            <p className="text-muted-foreground">
                              {address.city},{" "}
                              {address.province}
                            </p>

                            {address.reference && (
                              <p className="pt-2 text-muted-foreground">
                                Referencia:{" "}
                                {address.reference}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-muted-foreground">
                            No hay dirección registrada.
                          </p>
                        )}
                      </section>

                      {/* Resumen */}

                      <section className="rounded-xl border border-border bg-background p-5">
                        <div className="flex items-center gap-3">
                          <Package
                            size={18}
                            className="text-primary"
                          />

                          <h3 className="font-semibold">
                            Resumen del pedido
                          </h3>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              Subtotal
                            </span>

                            <span>
                              {formatCurrency(
                                order.subtotal,
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              Método de envío
                            </span>

                            <span className="text-right font-medium">
                              {getShippingMethodLabel(
                                order.shipping_method,
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              Costo de envío
                            </span>

                            <span className="text-right">
                              {getShippingCostLabel(
                                order.shipping_method,
                                order.shipping_cost,
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
                            <span>Total</span>

                            <span>
                              {formatCurrency(
                                order.total,
                              )}
                            </span>
                          </div>
                        </div>
                      </section>

                      {/* Productos */}

                      <section className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                          <Package
                            size={18}
                            className="text-primary"
                          />

                          <h3 className="font-semibold">
                            Productos
                          </h3>
                        </div>

                        <div className="mt-4 divide-y divide-border rounded-xl border border-border">
                          {order.order_items.map(
                            (item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 px-4 py-4"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium">
                                    {item.product_name}
                                  </p>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {formatCurrency(
                                      item.unit_price,
                                    )}{" "}
                                    ×{" "}
                                    {item.quantity}
                                  </p>
                                </div>

                                <p className="shrink-0 font-medium">
                                  {formatCurrency(
                                    item.subtotal,
                                  )}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </section>

                      {/* Observaciones */}

                      {order.notes && (
                        <section className="lg:col-span-2 rounded-xl border border-border bg-background p-5">
                          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                            Observaciones
                          </p>

                          <p className="mt-2 text-sm">
                            {order.notes}
                          </p>
                        </section>
                      )}
                    </div>

                    {/* Acciones */}

                    <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end md:px-6">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
                      >
                        Ver pedido completo
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}