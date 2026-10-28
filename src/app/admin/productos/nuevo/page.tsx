import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createProduct } from "./actions";
import { ProductTaxonomyFields } from "../product-taxonomy-fields";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const supabase = await createClient();

  const { data: categories, error } =
    await supabase
      .from("categories")
      .select(
        "id, name, slug",
      )
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      `No se pudieron cargar las categorías: ${error.message}`,
    );
  }

  const { data: taxonomyTerms, error: taxonomyError } = await supabase
    .from("product_taxonomy_terms")
    .select("id, category_id, parent_id, name, slug, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (taxonomyError) {
    throw new Error(`No se pudo cargar la clasificación de productos: ${taxonomyError.message}`);
  }

  const { data: attributeDefinitions, error: attributesError } = await supabase
    .from("product_attribute_definitions")
    .select("id, category_id, name, slug, data_type, unit, options, is_required, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (attributesError) {
    throw new Error(`No se pudieron cargar los atributos del catálogo: ${attributesError.message}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Encabezado */}
      <div>
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Volver a productos
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PackagePlus size={24} />
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Catálogo
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Nuevo producto
            </h1>
          </div>
        </div>

        <p className="mt-4 text-muted-foreground">
          Agrega un nuevo producto al catálogo de
          VidaBajoAgua.
        </p>
      </div>

      {/* Formulario */}
      <form
        action={createProduct}
        className="space-y-6"
      >
        {/* Información principal */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Información del producto
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Datos principales que verá el cliente.
            </p>
          </div>

          <div className="grid gap-5">
            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Nombre *
              </label>

              <input
                id="name"
                name="name"
                required
                placeholder="Ej. Anubias Nana"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="text-sm font-medium"
              >
                Slug
              </label>

              <input
                id="slug"
                name="slug"
                placeholder="anubias-nana"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <p className="mt-1 text-xs text-muted-foreground">
                Si lo dejas vacío, se generará a partir
                del nombre.
              </p>
            </div>

            <ProductTaxonomyFields
              categories={categories ?? []}
              terms={taxonomyTerms ?? []}
              attributes={attributeDefinitions ?? []}
            />

            {/* Marca / SKU */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="brand"
                  className="text-sm font-medium"
                >
                  Marca
                </label>

                <input
                  id="brand"
                  name="brand"
                  placeholder="Ej. VidaBajoAgua"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="text-sm font-medium"
                >
                  SKU
                </label>

                <input
                  id="sku"
                  name="sku"
                  placeholder="Ej. VBA-PL-002"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Descripciones */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Descripción
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Información que ayudará al cliente a conocer
              el producto.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="short_description"
                className="text-sm font-medium"
              >
                Descripción corta
              </label>

              <textarea
                id="short_description"
                name="short_description"
                rows={3}
                placeholder="Una descripción breve para el catálogo."
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Descripción completa
              </label>

              <textarea
                id="description"
                name="description"
                rows={6}
                placeholder="Describe características, cuidados, recomendaciones, etc."
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Precio e inventario */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Precio e inventario
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Define el precio de venta y la existencia
              inicial.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="price"
                className="text-sm font-medium"
              >
                Precio *
              </label>

              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="7.50"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="compare_at_price"
                className="text-sm font-medium"
              >
                Precio anterior
              </label>

              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>

                <input
                  id="compare_at_price"
                  name="compare_at_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="9.00"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="stock"
                className="text-sm font-medium"
              >
                Stock inicial *
              </label>

              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue="0"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Estado */}
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Visibilidad
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Controla cómo aparecerá el producto en la
              tienda.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked
                className="mt-1 h-4 w-4 rounded border-border"
              />

              <span>
                <span className="block text-sm font-medium">
                  Producto activo
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  El producto podrá aparecer en la tienda.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="is_featured"
                className="mt-1 h-4 w-4 rounded border-border"
              />

              <span>
                <span className="block text-sm font-medium">
                  Producto destacado
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Marca el producto como destacado en el
                  catálogo.
                </span>
              </span>
            </label>
          </div>
        </section>

        {/* Acciones */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/productos"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Crear producto
          </button>
        </div>
      </form>
    </div>
  );
}