export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderStatusMeta = {
  label: string;
  badgeClass: string;
  dotClass: string;
  softClass: string;
  buttonClass: string;
};

export const orderStatusMeta: Record<
  OrderStatus,
  OrderStatusMeta
> = {
  pending: {
    label: "Pendiente",
    badgeClass:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300",
    dotClass:
      "bg-amber-500 dark:bg-amber-400",
    softClass:
      "border-amber-500/20 bg-amber-500/5 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-200",
    buttonClass:
      "bg-amber-500 text-white hover:bg-amber-600",
  },
  confirmed: {
    label: "Confirmado",
    badgeClass:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300",
    dotClass:
      "bg-emerald-500 dark:bg-emerald-400",
    softClass:
      "border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/5 dark:text-emerald-200",
    buttonClass:
      "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  preparing: {
    label: "Preparando",
    badgeClass:
      "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300",
    dotClass:
      "bg-blue-500 dark:bg-blue-400",
    softClass:
      "border-blue-500/20 bg-blue-500/5 text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/5 dark:text-blue-200",
    buttonClass:
      "bg-blue-600 text-white hover:bg-blue-700",
  },
  shipped: {
    label: "Enviado",
    badgeClass:
      "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300",
    dotClass:
      "bg-sky-500 dark:bg-sky-400",
    softClass:
      "border-sky-500/20 bg-sky-500/5 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/5 dark:text-sky-200",
    buttonClass:
      "bg-sky-600 text-white hover:bg-sky-700",
  },
  delivered: {
    label: "Entregado",
    badgeClass:
      "border-emerald-600/25 bg-emerald-600/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
    dotClass:
      "bg-emerald-600 dark:bg-emerald-500",
    softClass:
      "border-emerald-600/20 bg-emerald-600/5 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-200",
    buttonClass:
      "bg-emerald-700 text-white hover:bg-emerald-800",
  },
  cancelled: {
    label: "Cancelado",
    badgeClass:
      "border-rose-200 bg-rose-50 text-rose-700",
    dotClass:
      "bg-rose-500",
    softClass:
      "border-rose-200 bg-rose-50 text-rose-800",
    buttonClass:
      "bg-red-600 text-white hover:bg-red-700",
  },
};

export function getOrderStatusMeta(
  status: string | null | undefined,
): OrderStatusMeta {
  if (
    status &&
    status in orderStatusMeta
  ) {
    return orderStatusMeta[
      status as OrderStatus
    ];
  }

  return {
    label: status ?? "Estado desconocido",
    badgeClass:
      "border-border bg-secondary text-foreground",
    dotClass:
      "bg-muted-foreground",
    softClass:
      "border-border bg-secondary text-foreground",
    buttonClass:
      "bg-primary text-primary-foreground hover:opacity-90",
  };
}
