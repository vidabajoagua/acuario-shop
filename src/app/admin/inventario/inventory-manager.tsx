"use client";

import { useMemo, useState } from "react";
import {
  Boxes,
  ChevronDown,
  Loader2,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";

import { applyInventoryMovement } from "./inventory-actions";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  categories: {
    name: string;
  } | null;
  inventory: {
    quantity: number;
  } | null;
};

type MovementType =
  | "initial"
  | "purchase"
  | "sale"
  | "adjustment"
  | "damage"
  | "return";

type InventoryMovement = {
  id: string;
  product_id: string;
  quantity_change: number;
  movement_type: MovementType;
  reason: string | null;
  reference_id: string | null;
  created_at: string;
};

type InventoryManagerProps = {
  products: Product[];
  movements: InventoryMovement[];
};

const movementOptions: {
  value: MovementType;
  label: string;
}[] = [
  {
    value: "purchase",
    label: "Compra / Entrada",
  },
  {
    value: "sale",
    label: "Venta / Salida",
  },
  {
    value: "adjustment",
    label: "Ajuste",
  },
  {
    value: "damage",
    label: "Daño / Pérdida",
  },
  {
    value: "return",
    label: "Devolución",
  },
];

function getMovementLabel(type: MovementType) {
  switch (type) {
    case "initial":
      return "Inventario inicial";

    case "purchase":
      return "Compra";

    case "sale":
      return "Venta";

    case "adjustment":
      return "Ajuste";

    case "damage":
      return "Daño / pérdida";

    case "return":
      return "Devolución";

    default:
      return type;
  }
}

function formatMovementDate(date: string) {
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function InventoryManager({
  products: initialProducts,
  movements: initialMovements,
}: InventoryManagerProps) {
  const [products, setProducts] =
    useState<Product[]>(initialProducts);

  const [movements, setMovements] =
    useState<InventoryMovement[]>(
      initialMovements,
    );

  const [search, setSearch] = useState("");

  const [expandedProductId, setExpandedProductId] =
    useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [movementType, setMovementType] =
    useState<MovementType>("purchase");

  const [adjustmentDirection, setAdjustmentDirection] =
    useState<"increase" | "decrease">("increase");

  const [quantity, setQuantity] = useState("");

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name
          .toLowerCase()
          .includes(term) ||
        product.sku
          ?.toLowerCase()
          .includes(term) ||
        product.categories?.name
          .toLowerCase()
          .includes(term)
      );
    });
  }, [products, search]);

  function openMovement(product: Product) {
    setSelectedProduct(product);
    setMovementType("purchase");
    setAdjustmentDirection("increase");
    setQuantity("");
    setReason("");
    setError("");
    setSuccess("");
  }

  function closeMovement() {
    if (loading) {
      return;
    }

    setSelectedProduct(null);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    setError("");
    setSuccess("");

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Ingresa una cantidad entera mayor que 0.",
      );
      return;
    }

    let quantityChange = parsedQuantity;

    if (
      movementType === "sale" ||
      movementType === "damage"
    ) {
      quantityChange = -parsedQuantity;
    }

    if (
      movementType === "adjustment" &&
      adjustmentDirection === "decrease"
    ) {
      quantityChange = -parsedQuantity;
    }

    setLoading(true);

    try {
      const result =
        await applyInventoryMovement(
          selectedProduct.id,
          quantityChange,
          movementType,
          reason.trim() || undefined,
        );

      if (!result.success) {
        setError(
          result.error ||
            "No se pudo actualizar el inventario.",
        );
        return;
      }

      const newQuantity = result.quantity ?? 0;

      /*
       * Actualizar inmediatamente el producto
       * dentro del estado local.
       */
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === selectedProduct.id
            ? {
                ...product,
                inventory: {
                  quantity: newQuantity,
                },
              }
            : product,
        ),
      );

      /*
       * Actualizar también el producto seleccionado
       * para que el modal muestre el nuevo stock.
       */
      setSelectedProduct((currentProduct) =>
        currentProduct
          ? {
              ...currentProduct,
              inventory: {
                quantity: newQuantity,
              },
            }
          : null,
      );

      /*
       * Agregar inmediatamente el movimiento al
       * historial local.
       */
      const newMovement: InventoryMovement = {
        id: crypto.randomUUID(),
        product_id: selectedProduct.id,
        quantity_change: quantityChange,
        movement_type: movementType,
        reason: reason.trim() || null,
        reference_id: null,
        created_at:
          new Date().toISOString(),
      };

      setMovements((currentMovements) => [
        newMovement,
        ...currentMovements,
      ]);

      setSuccess(
        `Inventario actualizado. Nuevo stock: ${newQuantity}`,
      );

      setQuantity("");
      setReason("");

      setTimeout(() => {
        setSelectedProduct(null);
        setSuccess("");
      }, 1200);
    } catch (error) {
      console.error(
        "[INVENTORY] Error:",
        error,
      );

      setError(
        "Ocurrió un error inesperado.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Buscador */}
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
          placeholder="Buscar producto por nombre, SKU o categoría..."
          className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="hidden border-b border-border px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground md:grid md:grid-cols-[1fr_160px_140px_120px] md:items-center md:gap-4">
          <span>Producto</span>
          <span>Categoría</span>
          <span>Stock</span>
          <span />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
            <Package
              size={36}
              className="text-muted-foreground"
            />

            <p className="mt-3 font-medium">
              No encontramos productos
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Prueba con otro término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredProducts.map((product) => {
              const stock =
                product.inventory?.quantity ?? 0;

              const productMovements =
                movements
                  .filter(
                    (movement) =>
                      movement.product_id ===
                      product.id,
                  )
                  .slice(0, 5);

              return (
                <div key={product.id}>
                  {/* Producto */}
                  <div className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_160px_140px_120px] md:items-center">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                          <Boxes
                            size={18}
                            className="text-primary"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedProductId((current) =>
                              current === product.id ? null : product.id,
                            )
                          }
                          aria-expanded={expandedProductId === product.id}
                          aria-controls={`inventory-history-${product.id}`}
                          className="group flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {product.name}
                            </span>
                            {product.sku && (
                              <span className="mt-1 block text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </span>
                            )}
                          </span>
                          <ChevronDown
                            size={17}
                            className={`shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                              expandedProductId === product.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Categoría */}
                    <div className="text-sm text-muted-foreground">
                      {product.categories?.name ||
                        "Sin categoría"}
                    </div>

                    {/* Stock */}
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          stock > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {stock} unidades
                      </span>
                    </div>

                    {/* Acción */}
                    <button
                      type="button"
                      onClick={() =>
                        openMovement(product)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted"
                    >
                      <Plus size={16} />
                      Ajustar
                    </button>
                  </div>

                  {/* Historial desplegable tipo acordeón */}
                  {expandedProductId === product.id && (
                    <div
                      id={`inventory-history-${product.id}`}
                      className="animate-in slide-in-from-top-1 border-t border-border bg-muted/20 px-5 py-5 duration-200 sm:px-6"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                          Últimos movimientos
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {productMovements.length} {productMovements.length === 1 ? "movimiento" : "movimientos"}
                        </span>
                      </div>

                      {productMovements.length > 0 ? (
                        <div className="space-y-2">
                          {productMovements.map((movement) => (
                            <div
                              key={movement.id}
                              className="flex flex-col gap-2 rounded-xl border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {getMovementLabel(movement.movement_type)}
                                  </span>
                                  <span
                                    className={`text-sm font-semibold ${
                                      movement.quantity_change > 0
                                        ? "text-primary"
                                        : "text-destructive"
                                    }`}
                                  >
                                    {movement.quantity_change > 0 ? "+" : ""}
                                    {movement.quantity_change}
                                  </span>
                                </div>
                                {movement.reason && (
                                  <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {movement.reason}
                                  </p>
                                )}
                              </div>
                              <time
                                dateTime={movement.created_at}
                                className="shrink-0 text-xs text-muted-foreground"
                              >
                                {formatMovementDate(movement.created_at)}
                              </time>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                          Este producto todavía no tiene movimientos registrados.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Inventario
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedProduct.name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Stock actual:{" "}
                  <strong className="text-foreground">
                    {selectedProduct.inventory
                      ?.quantity ?? 0}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={closeMovement}
                disabled={loading}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >
              {/* Tipo */}
              <div>
                <label
                  htmlFor="movement-type"
                  className="text-sm font-medium"
                >
                  Tipo de movimiento
                </label>

                <select
                  id="movement-type"
                  value={movementType}
                  onChange={(event) =>
                    setMovementType(
                      event.target
                        .value as MovementType,
                    )
                  }
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {movementOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Dirección del ajuste */}
              {movementType === "adjustment" && (
                <div>
                  <label className="text-sm font-medium">
                    Tipo de ajuste
                  </label>

                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setAdjustmentDirection(
                          "increase",
                        )
                      }
                      disabled={loading}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        adjustmentDirection ===
                        "increase"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      Aumentar stock
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAdjustmentDirection(
                          "decrease",
                        )
                      }
                      disabled={loading}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        adjustmentDirection ===
                        "decrease"
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      Disminuir stock
                    </button>
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div>
                <label
                  htmlFor="movement-quantity"
                  className="text-sm font-medium"
                >
                  Cantidad
                </label>

                <input
                  id="movement-quantity"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  placeholder="Ej. 10"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                {(movementType === "sale" ||
                  movementType === "damage") && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Este movimiento disminuirá el
                    stock en {quantity || "0"}{" "}
                    unidades.
                  </p>
                )}

                {(movementType === "purchase" ||
                  movementType === "return") && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Este movimiento aumentará el
                    stock en {quantity || "0"}{" "}
                    unidades.
                  </p>
                )}

                {movementType === "adjustment" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    El stock{" "}
                    {adjustmentDirection ===
                    "increase"
                      ? "aumentará"
                      : "disminuirá"}{" "}
                    en {quantity || "0"} unidades.
                  </p>
                )}
              </div>

              {/* Motivo */}
              <div>
                <label
                  htmlFor="movement-reason"
                  className="text-sm font-medium"
                >
                  Motivo
                </label>

                <textarea
                  id="movement-reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  disabled={loading}
                  rows={3}
                  placeholder="Ej. Compra a proveedor, producto dañado..."
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                  {success}
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeMovement}
                  disabled={loading}
                  className="h-11 rounded-xl border border-border px-5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Guardar movimiento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}