import Link from "next/link";
import {
  Eye,
  Package,
  Pencil,
  Plus,
} from "lucide-react";

import { getProducts } from "@/lib/catalog/products";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Catálogo
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Productos
          </h1>

          <p className="mt-2 text-muted-foreground">
            Administra los productos disponibles en tu tienda.
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
        >
          <Plus size={18} />
          Nuevo producto
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Productos
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {products.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Activos
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {products.filter(
              (product) => product.is_active,
            ).length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Destacados
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {products.filter(
              (product) => product.is_featured,
            ).length}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {products.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Package
              size={42}
              strokeWidth={1.2}
              className="text-primary/60"
            />

            <h2 className="mt-4 text-lg font-semibold">
              No hay productos
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Todavía no existen productos activos en el
              catálogo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  <th className="px-5 py-4 font-medium">
                    Producto
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Categoría
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Precio
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Stock
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const stock =
                    product.inventory?.quantity ?? 0;

                  const primaryImage =
                    product.images.find(
                      (image) => image.is_primary,
                    ) ??
                    product.images[0] ??
                    null;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                    >
                      {/* Producto */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={
                                  primaryImage.alt_text ??
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package
                                  size={22}
                                  className="text-primary/50"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {product.name}
                            </p>

                            {product.sku && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">
                          {product.categories?.name ??
                            "Sin categoría"}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium">
                            ${product.price.toFixed(2)}
                          </p>

                          {product.compare_at_price !== null &&
                            product.compare_at_price >
                              product.price && (
                              <p className="mt-1 text-xs text-muted-foreground line-through">
                                $
                                {product.compare_at_price.toFixed(
                                  2,
                                )}
                              </p>
                            )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <span
                          className={
                            stock > 0
                              ? "text-sm font-medium"
                              : "text-sm font-medium text-destructive"
                          }
                        >
                          {stock}
                        </span>

                        <span className="ml-1 text-xs text-muted-foreground">
                          unidades
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Activo
                          </span>

                          {product.is_featured && (
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                              Destacado
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/producto/${product.slug}`}
                            target="_blank"
                            aria-label={`Ver ${product.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-700 transition-colors hover:bg-violet-100"
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            href={`/admin/productos/${product.id}/editar`}
                            aria-label={`Editar ${product.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100"
                          >
                            <Pencil size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}